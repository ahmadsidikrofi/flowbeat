import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Modal, ActivityIndicator, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAppContext } from '../../utils/AuthProvider';
import { hitungUmur, formatTanggal, parseTanggal, formatDateInput } from '../../utils/dateHelpers';

const GENDER_OPTIONS = ['Laki-laki', 'Perempuan'];

export default function AddProfileScreen() {
  const [name, setName] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [tanggalLahirText, setTanggalLahirText] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState(null);
  const [gender, setGender] = useState('');
  const [tb, setTb] = useState('');
  const [bb, setBb] = useState('');
  const [errors, setErrors] = useState({});
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const { addProfile } = useAppContext();
  const router = useRouter();

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Izin akses galeri dibutuhkan untuk memilih foto profil.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets[0].uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  const clearError = (field) => {
    if (errors[field]) {
      setErrors(e => ({ ...e, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Nama profil wajib diisi.';
    }
    if (!tanggalLahirText.trim()) {
      newErrors.tanggalLahir = 'Tanggal lahir wajib diisi.';
    } else {
      const parsed = parseTanggal(tanggalLahirText);
      if (!parsed) {
        newErrors.tanggalLahir = 'Format tanggal tidak valid (DD/MM/YYYY).';
      } else {
        const umurHitung = hitungUmur(parsed);
        if (umurHitung < 1 || umurHitung > 150) {
          newErrors.tanggalLahir = 'Umur harus antara 1 - 150 tahun.';
        }
      }
    }
    if (!gender) {
      newErrors.gender = 'Gender wajib dipilih.';
    }
    if (!tb.trim()) {
      newErrors.tb = 'Tinggi badan wajib diisi.';
    } else if (!/^\d+(\.\d+)?$/.test(tb.trim())) {
      newErrors.tb = 'Tinggi badan harus berupa angka.';
    } else if (parseFloat(tb.trim()) < 30 || parseFloat(tb.trim()) > 300) {
      newErrors.tb = 'Tinggi badan harus antara 30 - 300 cm.';
    }
    if (!bb.trim()) {
      newErrors.bb = 'Berat badan wajib diisi.';
    } else if (!/^\d+(\.\d+)?$/.test(bb.trim())) {
      newErrors.bb = 'Berat badan harus berupa angka.';
    } else if (parseFloat(bb.trim()) < 1 || parseFloat(bb.trim()) > 500) {
      newErrors.bb = 'Berat badan harus antara 1 - 500 kg.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddProfile = async () => {
    if (validate()) {
      setIsLoading(true);
      setApiError('');
      try {
        const parsed = parseTanggal(tanggalLahirText);
        const result = await addProfile({
          name: name.trim(),
          tanggal_lahir: parsed ? parsed.toISOString() : null,
          umur: parsed ? hitungUmur(parsed) : 0,
          gender: gender,
          tinggi_badan: parseFloat(tb.trim()),
          berat_badan: parseFloat(bb.trim()),
        });
        setIsLoading(false);
        if (result.success) {
          router.replace('/(profiles)');
        } else {
          setApiError(result.error || 'Gagal menyimpan profil.');
        }
      } catch (err) {
        setIsLoading(false);
        setApiError('Terjadi kesalahan: ' + (err.message || 'Unknown error'));
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(profiles)')}>
          <Ionicons name="arrow-back" size={28} color="#38bdf8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tambah Profil</Text>
        <View style={{ width: 48 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>

            {/* Nama */}
            <Text style={styles.label}>Nama Profil</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Masukkan nama profil"
              placeholderTextColor="#64748b"
              value={name}
              onChangeText={(v) => { setName(v); clearError('name'); }}
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

            {/* Tanggal Lahir */}
            <Text style={styles.label}>Tanggal Lahir</Text>
            <View style={styles.inputWithSuffix}>
              <View style={[styles.dateInputRow, errors.tanggalLahir && styles.inputError]}>
                <Ionicons name="calendar-outline" size={22} color="#38bdf8" />
                <TextInput
                  style={styles.dateInput}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="#64748b"
                  value={tanggalLahirText}
                  onChangeText={(v) => {
                    const formatted = formatDateInput(v, tanggalLahirText);
                    setTanggalLahirText(formatted);
                    const parsed = parseTanggal(formatted);
                    setTanggalLahir(parsed);
                    clearError('tanggalLahir');
                  }}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
            </View>
            {tanggalLahir ? (
              <Text style={styles.ageInfoText}>
                Umur: {hitungUmur(tanggalLahir)} tahun
              </Text>
            ) : null}
            {errors.tanggalLahir ? <Text style={styles.errorText}>{errors.tanggalLahir}</Text> : null}

            {/* Gender Dropdown */}
            <Text style={styles.label}>Gender</Text>
            <TouchableOpacity
              style={[styles.dropdownButton, errors.gender && styles.inputError]}
              onPress={() => setShowGenderPicker(true)}
            >
              <Text style={[styles.dropdownText, !gender && { color: '#64748b' }]}>
                {gender || 'Pilih Gender'}
              </Text>
              <Ionicons name="chevron-down" size={24} color="#94a3b8" />
            </TouchableOpacity>
            {errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}

            {/* Tinggi Badan */}
            <Text style={styles.label}>Tinggi Badan</Text>
            <View style={styles.inputWithSuffix}>
              <TextInput
                style={[styles.inputSuffixed, errors.tb && styles.inputError]}
                placeholder="Contoh: 165"
                placeholderTextColor="#64748b"
                value={tb}
                onChangeText={(v) => { setTb(v); clearError('tb'); }}
                keyboardType="numeric"
              />
              <Text style={styles.suffixText}>cm</Text>
            </View>
            {errors.tb ? <Text style={styles.errorText}>{errors.tb}</Text> : null}

            {/* Berat Badan */}
            <Text style={styles.label}>Berat Badan</Text>
            <View style={styles.inputWithSuffix}>
              <TextInput
                style={[styles.inputSuffixed, errors.bb && styles.inputError]}
                placeholder="Contoh: 70"
                placeholderTextColor="#64748b"
                value={bb}
                onChangeText={(v) => { setBb(v); clearError('bb'); }}
                keyboardType="numeric"
              />
              <Text style={styles.suffixText}>kg</Text>
            </View>
            {errors.bb ? <Text style={styles.errorText}>{errors.bb}</Text> : null}

            {/* Submit */}
            {apiError ? (
              <View style={styles.apiErrorBox}>
                <Text style={styles.apiErrorText}>{apiError}</Text>
              </View>
            ) : null}

            <TouchableOpacity style={[styles.button, isLoading && styles.buttonDisabled]} onPress={handleAddProfile} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Simpan Profil</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Gender Picker Modal */}
      <Modal visible={showGenderPicker} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowGenderPicker(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Pilih Gender</Text>
            {GENDER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.modalOption, gender === option && styles.modalOptionSelected]}
                onPress={() => {
                  setGender(option);
                  setShowGenderPicker(false);
                  clearError('gender');
                }}
              >
                <Text style={[styles.modalOptionText, gender === option && styles.modalOptionTextSelected]}>
                  {option}
                </Text>
                {gender === option && <Ionicons name="checkmark" size={24} color="#38bdf8" />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f19', // Deep dark background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 72,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    backgroundColor: '#0f172a',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#1e293b', // Dark card
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 14,
    marginBottom: 4,
    fontSize: 16,
    color: '#f8fafc',
    borderWidth: 1,
    borderColor: '#334155',
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#450a0a',
  },
  errorText: {
    color: '#f87171',
    fontSize: 13,
    marginBottom: 8,
    marginTop: 2,
  },
  dateInputRow: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  dateInput: {
    flex: 1,
    fontSize: 16,
    color: '#f8fafc',
    padding: 4,
  },
  ageInfoText: {
    fontSize: 14,
    color: '#38bdf8',
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 2,
  },
  inputWithSuffix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  inputSuffixed: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#f8fafc',
    borderWidth: 1,
    borderColor: '#334155',
  },
  suffixText: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '600',
    minWidth: 45,
  },
  dropdownButton: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 14,
    marginBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  dropdownText: {
    fontSize: 16,
    color: '#f8fafc',
  },
  button: {
    backgroundColor: '#0ea5e9',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#0f172a',
  },
  modalOptionSelected: {
    backgroundColor: '#0369a1',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#f8fafc',
  },
  modalOptionTextSelected: {
    fontWeight: '700',
    color: '#ffffff',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  apiErrorBox: {
    backgroundColor: '#450a0a',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ef4444',
    marginTop: 8,
    marginBottom: 8,
  },
  apiErrorText: {
    color: '#fecaca',
    fontSize: 14,
  },
});
