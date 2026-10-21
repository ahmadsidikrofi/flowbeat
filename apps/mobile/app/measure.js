import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  Alert,
  BackHandler,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppContext } from '@/utils/AuthProvider';
import { measurementApi } from '@/services/api';
import Config from '@/utils/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Alur Pengukuran Multi-Tahap:
 * 1. measuring_bp   — Mengambil data tensimeter dari alat Omron
 * 2. bp_done        — Hasil tensimeter muncul + Tombol WAJIB "Lanjut prediksi Gula Darah"
 * 3. measuring_spo2 — Menampilkan instruksi tempelkan jari ke sensor merah & polling SpO2/Gula Darah
 * 4. complete       — Semua data berhasil diterima & disimpan ke database riwayat
 * 5. error          — Penanganan kesalahan dengan opsi Coba Lagi
 */

export default function MeasureScreen() {
  const router = useRouter();
  const { currentUser, currentProfile } = useAppContext();

  const [step, setStep] = useState('measuring_bp');
  const [errorMsg, setErrorMsg] = useState('');
  const [bpData, setBpData] = useState(null);
  const [spo2Data, setSpo2Data] = useState(null);

  const abortRef = useRef(false);
  const startedRef = useRef(false);
  const pollingRef = useRef(null);

  // Animasi
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseAnimDelayed = useRef(new Animated.Value(1)).current;
  const heartPulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const spo2ProgressAnim = useRef(new Animated.Value(0)).current;

  // ── Konfigurasi Animasi ──────────────────────────────────
  useEffect(() => {
    const createPulse = (anim) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1.08,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

    const ring1 = createPulse(pulseAnim);
    ring1.start();

    const timeout = setTimeout(() => {
      createPulse(pulseAnimDelayed).start();
    }, 800);

    Animated.loop(
      Animated.sequence([
        Animated.timing(heartPulseAnim, {
          toValue: 1.25,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(heartPulseAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.timing(progressAnim, {
      toValue: 0.4,
      duration: 3000,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();

    if (!startedRef.current) {
      startedRef.current = true;
      startBPMeasurement();
    }

    return () => {
      clearTimeout(timeout);
      abortRef.current = true;
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // ── Interseptor Tombol Kembali (Hardware Back Android) ──
  useEffect(() => {
    const onBackPress = () => {
      if (step === 'complete') {
        router.replace('/(tabs)');
        return true;
      }
      handleCancelMeasurement();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, [step]);

  // ── Step 1: Ambil data dari Tensimeter Omron ────────────
  const startBPMeasurement = async () => {
    if (abortRef.current) return;
    try {
      setStep('measuring_bp');
      setErrorMsg('');

      Animated.timing(progressAnim, {
        toValue: 0.6,
        duration: 4000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();

      const res = await measurementApi.readLatestFromDevice(
        Config.DEVICE_MAC,
        Config.DEVICE_NAME,
        0
      );

      if (abortRef.current) return;

      if (!res.success || !res.data?.latest_record) {
        setStep('error');
        setErrorMsg(res.error || 'Gagal mengambil data dari tensimeter. Pastikan alat dalam mode pairing (huruf P berkedip).');
        return;
      }

      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }).start();

      // Simpan data tensimeter ke state
      const record = res.data.latest_record;

      // LANGSUNG SIMPAN KE DATABASE BACKEND agar saat ESP32 mengirim SpO2,
      // backend bisa menemukan data Omron untuk prediksi gula darah.
      // (Tanpa ini, POST /spo2 akan return 400 "Harus mengukur tekanan darah terlebih dahulu")
      if (currentUser?.token && currentProfile?.backendId) {
        const saveRes = await measurementApi.save({
          id_user: currentUser.id,
          id_profile: currentProfile.backendId,
          sys: record.sys,
          dia: record.dia,
          bpm: record.bpm,
          mov: record.mov || 0,
          ihb: record.ihb || 0,
          datetime: record.datetime || new Date().toISOString(),
        }, currentUser.token);

        if (saveRes.success && saveRes.data?.id) {
          record.id = saveRes.data.id;
        } else {
          console.log('Warning: Gagal menyimpan BP ke backend:', saveRes.error);
        }
      }

      setBpData(record);
      setStep('bp_done');

    } catch (err) {
      if (!abortRef.current) {
        setStep('error');
        setErrorMsg(err.message || 'Terjadi kesalahan saat berkomunikasi dengan alat.');
      }
    }
  };

  // ── Step 2 → 3: Mulai Polling Prediksi Gula Darah (SpO2 Sensor) ──
  const startSpo2Polling = useCallback(async () => {
    if (abortRef.current) return;

    setStep('measuring_spo2');
    setErrorMsg('');
    spo2ProgressAnim.setValue(0);

    // 1. Ambil ID SpO2 terakhir sebelum active-session baru dimulai
    let initialSpo2Id = null;
    if (currentProfile?.backendId) {
      try {
        const initRes = await measurementApi.getLatestSpo2(
          currentProfile.backendId,
          currentUser?.token
        );
        if (initRes.success && initRes.data?.id) {
          initialSpo2Id = initRes.data.id;
        }
      } catch {
        // Ignored jika belum ada record SpO2 sebelumnya
      }
    }

    // 2. Set active session di backend agar ESP32 tahu siapa yang diukur
    if (currentUser?.id && currentProfile?.backendId) {
      await measurementApi.setActiveSession(
        currentUser.id,
        currentProfile.backendId,
        currentUser.token
      );
    }

    const pollStartTime = new Date();
    const POLL_INTERVAL_MS = 3000;
    const POLL_TIMEOUT_MS = 120000; // 2 menit timeout
    let elapsed = 0;

    Animated.timing(spo2ProgressAnim, {
      toValue: 0.85,
      duration: POLL_TIMEOUT_MS,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();

    pollingRef.current = setInterval(async () => {
      elapsed += POLL_INTERVAL_MS;

      if (abortRef.current) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        return;
      }

      if (elapsed >= POLL_TIMEOUT_MS) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        setStep('error');
        setErrorMsg('Waktu habis — sensor SpO2 belum mengirimkan data. Pastikan jari menempel erat pada sensor berwarna merah di alat.');
        return;
      }

      try {
        if (currentProfile?.backendId) {
          const res = await measurementApi.getLatestSpo2(
            currentProfile.backendId,
            currentUser?.token
          );

          if (res.success && res.data) {
            const dataTime = parseServerDate(res.data.datetime);
            // Record dianggap baru jika ID-nya berbeda dari ID awal ATAU timestamp-nya setelah pollStartTime
            const isNewData = res.data.id !== initialSpo2Id || dataTime.getTime() > (pollStartTime.getTime() - 15000);

            console.log(`[SPO2 POLL] Latest ID: ${res.data.id} | Initial ID: ${initialSpo2Id} | Is New? ${isNewData}`);

            if (isNewData) {
              if (pollingRef.current) clearInterval(pollingRef.current);

              Animated.timing(spo2ProgressAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: false,
              }).start();

              setSpo2Data(res.data);

              // Simpan ke storage lokal
              await saveCompleteMeasurement(bpData, res.data);
              setStep('complete');
            }
          }
        }
      } catch {
        // Silently retry jika ada masalah jaringan saat polling
      }
    }, POLL_INTERVAL_MS);
  }, [currentProfile, currentUser, bpData]);

  // ── Simpan Pengukuran ke AsyncStorage Lokal ───────────────────
  const saveCompleteMeasurement = async (bp, spo2) => {
    try {
      if (bp) {
        // (Backend sudah disimpan saat fase BP selesai, tidak perlu simpan lagi)
        const getStoredDataBP = await AsyncStorage.getItem('blood-pressure-data');
        let updatedData = getStoredDataBP ? JSON.parse(getStoredDataBP) : [];
        updatedData.push(bp);
        await AsyncStorage.setItem('blood-pressure-data', JSON.stringify(updatedData));
      }
    } catch (err) {
      console.log('Error saving measurement:', err);
    }
  };

  // ── Penanganan Batal / Keluar Pengukuran ────────────────
  const handleCancelMeasurement = () => {
    Alert.alert(
      'Batalkan Pengukuran?',
      'Jika Anda kembali sekarang, hasil pengukuran tensimeter TIDAK akan disimpan ke dalam riwayat.',
      [
        { text: 'Lanjutkan Pengukuran', style: 'cancel' },
        {
          text: 'Batalkan & Keluar',
          style: 'destructive',
          onPress: async () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
            abortRef.current = true;

            // Jika data BP sudah sempat disimpan ke backend, hapus record tersebut dari database
            if (bpData?.id && currentUser?.token) {
              try {
                await measurementApi.delete(bpData.id, currentUser.token);
                console.log(`[CANCEL] Record ID ${bpData.id} berhasil dihapus dari backend.`);
              } catch (err) {
                console.log('[CANCEL] Error deleting measurement:', err);
              }
            }

            router.replace('/(tabs)');
          },
        },
      ]
    );
  };

  // ── Handler Coba Lagi ──────────────────────────────────
  const handleRetry = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    abortRef.current = false;

    if (bpData) {
      // Jika data tensimeter sudah ada tapi SpO2 gagal, retry SpO2
      startSpo2Polling();
    } else {
      // Retry dari awal
      setStep('measuring_bp');
      setErrorMsg('');
      progressAnim.setValue(0);
      startBPMeasurement();
    }
  };

  // ── Helper Parsing Datetime Backend ───────────────────
  const parseServerDate = (dateStr) => {
    if (!dateStr) return new Date(0);
    if (typeof dateStr === 'string') {
      const hasTimezone = dateStr.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(dateStr);
      if (!hasTimezone) {
        return new Date(dateStr + 'Z');
      }
    }
    return new Date(dateStr);
  };

  // ── Interpolasi Progress Bar ───────────────────────────
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const spo2ProgressWidth = spo2ProgressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // ── Klasifikasi Tekanan Darah ─────────────────────────
  const classifyBP = (sys, dia) => {
    if (sys < 120 && dia < 80) return { label: 'Normal', color: '#15803d', bg: '#dcfce7', border: '#86efac' };
    if (sys < 130 && dia < 85) return { label: 'Prehipertensi', color: '#b45309', bg: '#fef3c7', border: '#fde68a' };
    if (sys < 140 && dia < 90) return { label: 'Hipertensi Derajat 1', color: '#c2410c', bg: '#ffedd5', border: '#fed7aa' };
    return { label: 'Hipertensi Derajat 2', color: '#b91c1c', bg: '#fee2e2', border: '#fca5a5' };
  };

  // ── Klasifikasi Gula Darah ────────────────────────────
  const classifyGlucose = (mg) => {
    if (mg == null) return { label: 'Tidak Ada Data', color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1' };
    if (mg < 100) return { label: 'Normal', color: '#15803d', bg: '#dcfce7', border: '#86efac' };
    if (mg < 126) return { label: 'Pre-Diabetes', color: '#b45309', bg: '#fef3c7', border: '#fde68a' };
    return { label: 'Diabetes', color: '#b91c1c', bg: '#fee2e2', border: '#fca5a5' };
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Navigation */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (step === 'complete') {
                router.replace('/(tabs)');
              } else {
                handleCancelMeasurement();
              }
            }}
            hitSlop={10}
          >
            <Ionicons name="arrow-back" size={26} color="#0f172a" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Pengukuran Kesehatan</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* ─── FASE 1: Mengukur Tensimeter ─── */}
        {step === 'measuring_bp' && (
          <View style={styles.stepContainer}>
            <View style={styles.statusPillBlue}>
              <MaterialCommunityIcons name="bluetooth-connect" size={22} color="#2563eb" />
              <Text style={styles.statusPillBlueText}>Mengukur Tekanan Darah...</Text>
            </View>

            {/* Ilustrasi Animasi */}
            <View style={styles.illustrationContainer}>
              <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]} />
              <Animated.View style={[styles.pulseRing2, { transform: [{ scale: pulseAnimDelayed }] }]} />
              <View style={styles.mainIllustration}>
                <Animated.View style={{ transform: [{ scale: heartPulseAnim }] }}>
                  <MaterialCommunityIcons name="heart-pulse" size={72} color="#2563eb" />
                </Animated.View>
              </View>
            </View>

            <View style={styles.messagingBox}>
              <Text style={styles.messagingTitle}>Menghubungkan ke Tensimeter</Text>
              <Text style={styles.messagingSubtitle}>
                Mohon tunggu, aplikasi sedang mengambil data SYS, DIA, dan BPM dari alat Omron Anda...
              </Text>
            </View>

            {/* Progress Card */}
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTextLeft}>Proses Pembacaan</Text>
                <Text style={styles.progressTextRight}>Sedang Berjalan</Text>
              </View>
              <View style={styles.progressBarTrack}>
                <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
              </View>
            </View>

            {/* Batal Button */}
            <TouchableOpacity style={styles.cancelOutlineButton} onPress={handleCancelMeasurement}>
              <Text style={styles.cancelOutlineText}>Batalkan Pengukuran</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ─── FASE 2: Hasil Tensimeter & Tombol WAJIB Prediksi Gula Darah ─── */}
        {step === 'bp_done' && bpData && (() => {
          const bpClass = classifyBP(bpData.sys, bpData.dia);
          return (
            <View style={styles.stepContainer}>
              <View style={styles.statusPillGreen}>
                <Ionicons name="checkmark-circle" size={22} color="#15803d" />
                <Text style={styles.statusPillGreenText}>Tekanan Darah Berhasil Diterima!</Text>
              </View>

              {/* Preview Hasil Tensimeter */}
              <View style={[styles.bpResultCard, { borderColor: bpClass.border }]}>
                <View style={[styles.bpBadge, { backgroundColor: bpClass.bg }]}>
                  <Ionicons name="shield-checkmark" size={16} color={bpClass.color} />
                  <Text style={[styles.bpBadgeText, { color: bpClass.color }]}>{bpClass.label}</Text>
                </View>

                <View style={styles.bpValueRow}>
                  <View style={styles.bpValueItem}>
                    <Text style={styles.bpLabel}>SYS</Text>
                    <Text style={styles.bpNumber}>{bpData.sys}</Text>
                    <Text style={styles.bpUnit}>mmHg</Text>
                  </View>
                  <View style={styles.bpDivider} />
                  <View style={styles.bpValueItem}>
                    <Text style={styles.bpLabel}>DIA</Text>
                    <Text style={styles.bpNumber}>{bpData.dia}</Text>
                    <Text style={styles.bpUnit}>mmHg</Text>
                  </View>
                  <View style={styles.bpDivider} />
                  <View style={styles.bpValueItem}>
                    <Text style={styles.bpLabel}>BPM</Text>
                    <Text style={styles.bpNumber}>{bpData.bpm}</Text>
                    <Text style={styles.bpUnit}>bpm</Text>
                  </View>
                </View>
              </View>

              {/* Banner Peringatan Wajib Lanjut */}
              <View style={styles.warningBanner}>
                <MaterialIcons name="warning" size={24} color="#d97706" />
                <Text style={styles.warningText}>
                  Pengukuran tensimeter belum tersimpan ke riwayat. Anda <Text style={{ fontWeight: '700', color: '#b45309' }}>WAJIB</Text> melanjutkan ke Prediksi Gula Darah agar data dapat disimpan secara lengkap.
                </Text>
              </View>

              {/* Tombol Utama Wajib */}
              <TouchableOpacity
                style={styles.primaryActionButton}
                onPress={startSpo2Polling}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons name="water" size={24} color="#ffffff" />
                <Text style={styles.primaryActionButtonText}>Lanjut Prediksi Gula Darah</Text>
                <Ionicons name="arrow-forward" size={22} color="#ffffff" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelTextButton} onPress={handleCancelMeasurement}>
                <Text style={styles.cancelTextButtonText}>Batalkan & Buang Data Ini</Text>
              </TouchableOpacity>
            </View>
          );
        })()}

        {/* ─── FASE 3: Mengukur Prediksi Gula Darah (Sensor Merah MAX30102) ─── */}
        {step === 'measuring_spo2' && (
          <View style={styles.stepContainer}>
            <View style={styles.statusPillRed}>
              <MaterialCommunityIcons name="sensor" size={22} color="#dc2626" />
              <Text style={styles.statusPillRedText}>Prediksi Gula Darah</Text>
            </View>

            {/* Visual Instruksi Tempel Jari */}
            <View style={styles.sensorInstructionCard}>
              <Animated.View style={[styles.sensorPulseCircle, { transform: [{ scale: pulseAnim }] }]}>
                <MaterialIcons name="fingerprint" size={80} color="#dc2626" />
              </Animated.View>

              <Text style={styles.sensorInstructionTitle}>Tempelkan Jari Anda!</Text>
              <Text style={styles.sensorInstructionText}>
                Silakan <Text style={styles.highlightText}>tempelkan dan tekan jari Anda ke SENSOR BERWARNA MERAH</Text> pada alat yang telah disediakan selama 10 detik.
              </Text>
            </View>

            {/* Progress Card SpO2 */}
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTextLeft}>Menunggu Sensor Red-Light...</Text>
                <Text style={[styles.progressTextRight, { color: '#dc2626' }]}>Mendeteksi</Text>
              </View>
              <View style={styles.progressBarTrack}>
                <Animated.View style={[styles.progressBarFillRed, { width: spo2ProgressWidth }]} />
              </View>
            </View>

            <TouchableOpacity style={styles.cancelOutlineButton} onPress={handleCancelMeasurement}>
              <Text style={styles.cancelOutlineText}>Batalkan Pengukuran</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ─── FASE 4: Selesai ─── */}
        {step === 'complete' && (() => {
          const bpClass = bpData ? classifyBP(bpData.sys, bpData.dia) : null;
          const glucoseClass = spo2Data?.blood_sugar != null ? classifyGlucose(spo2Data.blood_sugar) : null;

          return (
            <View style={styles.stepContainer}>
              <View style={styles.completeCard}>
                <Ionicons name="checkmark-circle" size={80} color="#16a34a" />
                <Text style={styles.completeTitle}>Pengukuran Berhasil!</Text>
                <Text style={styles.completeSubtitle}>
                  Data tekanan darah, SpO2, dan prediksi gula darah telah berhasil disimpan ke Riwayat Anda.
                </Text>

                {/* 1. Hasil Tekanan Darah (Omron) */}
                {bpData && bpClass && (
                  <View style={[styles.bpResultCard, { borderColor: bpClass.border, marginBottom: 16 }]}>
                    <View style={[styles.bpBadge, { backgroundColor: bpClass.bg }]}>
                      <Ionicons name="shield-checkmark" size={16} color={bpClass.color} />
                      <Text style={[styles.bpBadgeText, { color: bpClass.color }]}>Tekanan Darah: {bpClass.label}</Text>
                    </View>

                    <View style={styles.bpValueRow}>
                      <View style={styles.bpValueItem}>
                        <Text style={styles.bpLabel}>SYS</Text>
                        <Text style={styles.bpNumber}>{bpData.sys}</Text>
                        <Text style={styles.bpUnit}>mmHg</Text>
                      </View>
                      <View style={styles.bpDivider} />
                      <View style={styles.bpValueItem}>
                        <Text style={styles.bpLabel}>DIA</Text>
                        <Text style={styles.bpNumber}>{bpData.dia}</Text>
                        <Text style={styles.bpUnit}>mmHg</Text>
                      </View>
                      <View style={styles.bpDivider} />
                      <View style={styles.bpValueItem}>
                        <Text style={styles.bpLabel}>BPM</Text>
                        <Text style={styles.bpNumber}>{bpData.bpm}</Text>
                        <Text style={styles.bpUnit}>bpm</Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* 2. Hasil SpO2 & Suhu (MAX30102) */}
                {spo2Data && (
                  <View style={styles.spo2SummaryGrid}>
                    <View style={styles.spo2SummaryCard}>
                      <MaterialCommunityIcons name="water-percent" size={28} color="#2563eb" />
                      <Text style={styles.spo2SummaryCardLabel}>SpO2</Text>
                      <Text style={styles.spo2SummaryCardValue}>{spo2Data.spo2}<Text style={{ fontSize: 14 }}>%</Text></Text>
                    </View>

                    <View style={styles.spo2SummaryCard}>
                      <MaterialCommunityIcons name="thermometer" size={28} color="#d97706" />
                      <Text style={styles.spo2SummaryCardLabel}>Suhu</Text>
                      <Text style={styles.spo2SummaryCardValue}>{spo2Data.temperature != null ? spo2Data.temperature.toFixed(1) : '--'}<Text style={{ fontSize: 14 }}>°C</Text></Text>
                    </View>
                  </View>
                )}

                {/* 3. Hasil Prediksi Gula Darah (ML) */}
                {spo2Data?.blood_sugar != null && glucoseClass && (
                  <View style={[styles.glucoseCard, { borderColor: glucoseClass.border }]}>
                    <View style={styles.glucoseCardHeader}>
                      <View style={[styles.glucoseIconBg, { backgroundColor: glucoseClass.bg }]}>
                        <MaterialCommunityIcons name="water" size={30} color={glucoseClass.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.glucoseCardTitle}>Prediksi Gula Darah</Text>
                        <View style={[styles.bpBadge, { backgroundColor: glucoseClass.bg, alignSelf: 'flex-start', marginTop: 4 }]}>
                          <Ionicons name="medical" size={14} color={glucoseClass.color} />
                          <Text style={[styles.bpBadgeText, { color: glucoseClass.color }]}>{glucoseClass.label}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.glucoseCardBody}>
                      <Text style={[styles.glucoseCardValue, { color: glucoseClass.color }]}>
                        {typeof spo2Data.blood_sugar === 'number' ? spo2Data.blood_sugar.toFixed(1) : spo2Data.blood_sugar}
                      </Text>
                      <Text style={styles.glucoseCardUnit}>mg/dL</Text>
                    </View>

                    <Text style={styles.glucoseCardNote}>
                      * Hasil merupakan prediksi model Machine Learning berbasis SpO2, Heart Rate, & Tekanan Darah.
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.primaryActionButton, { marginTop: 12 }]}
                  onPress={() => router.replace('/(tabs)')}
                >
                  <Text style={styles.primaryActionButtonText}>Kembali ke Beranda</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })()}

        {/* ─── FASE ERROR ─── */}
        {step === 'error' && (
          <View style={styles.stepContainer}>
            <View style={styles.errorCard}>
              <MaterialIcons name="error-outline" size={72} color="#dc2626" />
              <Text style={styles.errorTitle}>Pengukuran Gagal</Text>
              <Text style={styles.errorSubtitle}>{errorMsg}</Text>

              <TouchableOpacity style={styles.primaryActionButton} onPress={handleRetry}>
                <Ionicons name="refresh" size={20} color="#ffffff" />
                <Text style={styles.primaryActionButtonText}>Coba Lagi</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelTextButton} onPress={() => router.replace('/(tabs)')}>
                <Text style={styles.cancelTextButtonText}>Kembali ke Beranda</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 50,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  stepContainer: {
    alignItems: 'center',
    marginTop: 10,
  },

  // Status Pills
  statusPillBlue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
    marginBottom: 24,
  },
  statusPillBlueText: {
    color: '#2563eb',
    fontWeight: '700',
    fontSize: 15,
  },
  statusPillGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
    marginBottom: 24,
  },
  statusPillGreenText: {
    color: '#15803d',
    fontWeight: '700',
    fontSize: 15,
  },
  statusPillRed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
    marginBottom: 24,
  },
  statusPillRedText: {
    color: '#dc2626',
    fontWeight: '700',
    fontSize: 15,
  },

  // Ilustrasi
  illustrationContainer: {
    position: 'relative',
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  pulseRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 3,
    borderColor: 'rgba(37, 99, 235, 0.2)',
  },
  pulseRing2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: 'rgba(37, 99, 235, 0.1)',
  },
  mainIllustration: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    elevation: 3,
  },

  // Messaging
  messagingBox: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  messagingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  messagingSubtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Progress Card
  progressCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressTextLeft: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  progressTextRight: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563eb',
  },
  progressBarTrack: {
    width: '100%',
    height: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 6,
  },
  progressBarFillRed: {
    height: '100%',
    backgroundColor: '#dc2626',
    borderRadius: 6,
  },

  // BP Result Card
  bpResultCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    elevation: 3,
    marginBottom: 20,
  },
  bpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
    marginBottom: 16,
  },
  bpBadgeText: {
    fontWeight: '700',
    fontSize: 14,
  },
  bpValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bpValueItem: {
    flex: 1,
    alignItems: 'center',
  },
  bpLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 1,
    marginBottom: 4,
  },
  bpNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: '#0f172a',
  },
  bpUnit: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  bpDivider: {
    width: 1,
    height: 48,
    backgroundColor: '#e2e8f0',
  },

  // Warning Banner
  warningBanner: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
    alignItems: 'center',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#92400e',
    lineHeight: 18,
  },

  // Sensor Instruction
  sensorInstructionCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
    elevation: 2,
    marginBottom: 24,
  },
  sensorPulseCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fca5a5',
    marginBottom: 16,
  },
  sensorInstructionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#dc2626',
    marginBottom: 8,
  },
  sensorInstructionText: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
  },
  highlightText: {
    fontWeight: '700',
    color: '#dc2626',
  },

  // Buttons
  primaryActionButton: {
    width: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 4,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 12,
  },
  primaryActionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelOutlineButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
  },
  cancelOutlineText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 14,
  },
  cancelTextButton: {
    paddingVertical: 10,
    marginTop: 4,
  },
  cancelTextButtonText: {
    color: '#dc2626',
    fontWeight: '600',
    fontSize: 14,
  },

  // Complete & Error Cards
  completeCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    elevation: 2,
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#16a34a',
    marginTop: 16,
    marginBottom: 8,
  },
  completeSubtitle: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  spo2SummaryBox: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#f0fdf4',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  spo2SummaryItem: {
    alignItems: 'center',
  },
  spo2SummaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 4,
  },
  spo2SummaryValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#14532d',
  },

  // SpO2 & Temp Complete Summary Grid
  spo2SummaryGrid: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  spo2SummaryCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  spo2SummaryCardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  spo2SummaryCardValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },

  // Complete Glucose Card
  glucoseCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    borderWidth: 2,
    marginBottom: 16,
  },
  glucoseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  glucoseIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glucoseCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  glucoseCardBody: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 6,
    marginVertical: 14,
  },
  glucoseCardValue: {
    fontSize: 48,
    fontWeight: '800',
    lineHeight: 52,
  },
  glucoseCardUnit: {
    fontSize: 18,
    fontWeight: '700',
    color: '#64748b',
  },
  glucoseCardNote: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 16,
  },

  errorCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
    elevation: 2,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#dc2626',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
});
