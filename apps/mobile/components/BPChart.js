import { Ionicons } from "@expo/vector-icons";
import { useAppContext } from '@/utils/AuthProvider';
import { formatMonthYear, formatDateShort, formatTimeShort } from '@/utils/dateHelpers';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import HelpDialog from "@/components/HelpDialog";
import BPDataByID from "@/components/BPDataByID";
import { measurementApi } from '@/services/api';
import { ActivityIndicator, Appbar, Modal, Portal } from 'react-native-paper';

export const BPChart = ({ setModalVisible }) => {
    const { currentUser, currentProfile } = useAppContext();
    const [datas, setDatas] = useState([]);
    const [dataById, setDataById] = useState('');
    const [helpVisible, setHelpVisible] = useState(false);
    const [DetailDataVisible, setDetailDataVisible] = useState(false);
    const [isMounting, setIsMounting] = useState(false);

    const GetAllDataFromDB = async () => {
        const profileId = currentProfile?.backendId || currentProfile?.id;
        const token = currentUser?.token;

        if (token && profileId) {
            setIsMounting(true);
            try {
                const [resBp, resSpo2] = await Promise.all([
                    measurementApi.getAll(profileId, token),
                    measurementApi.getAllSpo2(profileId, token),
                ]);

                const bpList = resBp.success && resBp.data
                    ? (Array.isArray(resBp.data) ? resBp.data : (resBp.data.health_data || []))
                    : [];

                const spo2List = resSpo2.success && resSpo2.data
                    ? (Array.isArray(resSpo2.data) ? resSpo2.data : [])
                    : [];

                const parseUtcDate = (dateStr) => {
                    if (!dateStr) return new Date(0);
                    if (typeof dateStr === 'string') {
                        const hasTimezone = dateStr.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(dateStr);
                        if (!hasTimezone) {
                            return new Date(dateStr + 'Z');
                        }
                    }
                    return new Date(dateStr);
                };

                const matchedSpo2Ids = new Set();

                const combined = bpList.map((bpItem) => {
                    const bpTime = parseUtcDate(bpItem.created_at || bpItem.datetime).getTime();
                    
                    let matchedSpo2 = null;
                    let minDiff = Infinity;
                    
                    spo2List.forEach((s) => {
                        const sTime = parseUtcDate(s.datetime).getTime();
                        const diff = Math.abs(sTime - bpTime);
                        // Toleransi pencocokan hingga 120 menit (2 jam)
                        if (diff < 120 * 60 * 1000 && diff < minDiff) {
                            minDiff = diff;
                            matchedSpo2 = s;
                        }
                    });

                    if (matchedSpo2) {
                        matchedSpo2Ids.add(matchedSpo2.id);
                    }

                    return {
                        ...bpItem,
                        spo2: bpItem.spo2 ?? matchedSpo2?.spo2 ?? null,
                        blood_sugar: bpItem.blood_sugar ?? matchedSpo2?.blood_sugar ?? null,
                    };
                });

                // Masukkan juga data SpO2 mandiri jika tidak berpasangan dengan tensimeter
                spo2List.forEach((s) => {
                    if (!matchedSpo2Ids.has(s.id)) {
                        combined.push({
                            id: s.id,
                            datetime: s.datetime,
                            created_at: s.datetime,
                            sys: null,
                            dia: null,
                            bpm: s.bpm,
                            spo2: s.spo2,
                            blood_sugar: s.blood_sugar,
                            status: 'SpO2 Standalone'
                        });
                    }
                });

                // Urutkan riwayat dari yang terbaru ke terlama
                combined.sort((a, b) => parseUtcDate(b.created_at || b.datetime).getTime() - parseUtcDate(a.created_at || a.datetime).getTime());

                setDatas(combined);
            } catch (err) {
                console.error("Error fetching measurements:", err);
                setDatas([]);
            } finally {
                setIsMounting(false);
            }
        } else {
            setDatas([]);
        }
    };

    const GetDataByID = (id) => {
        const found = datas.find((item) => item.id === id);
        if (found) {
            setDataById(found);
        }
    };

    const dataPerMonth = useMemo(() => {
        const group = {};
        datas.forEach((item) => {
            const dateVal = item.created_at || item.datetime;
            const month = formatMonthYear(dateVal);
            if (!group[month]) {
                group[month] = [];
            }
            group[month].push(item);
        });
        return group;
    }, [datas]);

    useEffect(() => {
        GetAllDataFromDB();
    }, [currentUser?.token, currentProfile?.backendId, currentProfile?.id]);

    return (
        <>
            <HelpDialog helpVisible={helpVisible} setHelpVisible={setHelpVisible}/>
            <Portal>
                <Modal 
                    visible={DetailDataVisible} 
                    onDismiss={() => setDetailDataVisible(false)}
                    contentContainerStyle={{ flex: 1, backgroundColor: '#ffffff', elevation: 0 }}    
                >
                    <BPDataByID 
                        setDetailDataVisible={setDetailDataVisible} 
                        dataById={dataById} 
                        key={dataById?.id || 'detail'} 
                        userToken={currentUser?.token} 
                        refreshData={GetAllDataFromDB} 
                    />
                </Modal>
            </Portal>
            <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
                <Appbar.Header style={{ backgroundColor: '#1e293b' }}>
                    <Appbar.BackAction onPress={() => setModalVisible(false)} color="#ffffff" />
                    <Appbar.Content title="Sejarah Data Pengukuran" titleStyle={{ color: '#ffffff', fontWeight: 'bold' }} />
                    <Appbar.Action icon="help-circle-outline" onPress={() => setHelpVisible(true)} color="#ffffff" />
                </Appbar.Header>

                <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
                    <ScrollView 
                        style={{ flex: 1 }} 
                        contentContainerStyle={{ flexGrow: 1 }}
                        showsVerticalScrollIndicator={true}
                    >
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={true} 
                            contentContainerStyle={{ flexGrow: 1 }}
                        >
                            <View style={{ width: 470, minHeight: '100%', backgroundColor: '#ffffff' }}>
                                {/* Table Header */}
                                <View
                                    style={{
                                        flexDirection: "row",
                                        paddingHorizontal: 12,
                                        paddingVertical: 12,
                                        borderBottomWidth: 1,
                                        borderBottomColor: "#cbd5e1",
                                        backgroundColor: "#e0f2fe",
                                        alignItems: "center",
                                    }}
                                >
                                    <View style={{ width: 95 }}>
                                        <Text style={{ fontSize: 13, color: "#0f172a", fontWeight: "700" }}>Tanggal</Text>
                                    </View>
                                    <View style={{ width: 80, alignItems: "center" }}>
                                        <Text style={{ fontSize: 13, color: "#0f172a", fontWeight: "700" }}>SYS/DIA</Text>
                                        <Text style={{ fontSize: 11, color: "#475569", marginTop: 1 }}>mmHg</Text>
                                    </View>
                                    <View style={{ width: 60, alignItems: "center" }}>
                                        <Text style={{ fontSize: 13, color: "#0f172a", fontWeight: "700" }}>Denyut</Text>
                                        <Text style={{ fontSize: 11, color: "#475569", marginTop: 1 }}>bpm</Text>
                                    </View>
                                    <View style={{ width: 60, alignItems: "center" }}>
                                        <Text style={{ fontSize: 13, color: "#0284c7", fontWeight: "700" }}>SpO2</Text>
                                        <Text style={{ fontSize: 11, color: "#475569", marginTop: 1 }}>%</Text>
                                    </View>
                                    <View style={{ width: 95, alignItems: "center" }}>
                                        <Text style={{ fontSize: 13, color: "#059669", fontWeight: "700", textAlign: "center" }}>Gula Darah</Text>
                                        <Text style={{ fontSize: 11, color: "#475569", marginTop: 1 }}>mg/dL</Text>
                                    </View>
                                    <View style={{ width: 80, alignItems: "center" }}>
                                        <Text style={{ fontSize: 13, color: "#0f172a", fontWeight: "700", textAlign: "center" }}>Info{"\n"}Terdeteksi</Text>
                                    </View>
                                </View>

                                {/* Table Body */}
                                <View style={{ backgroundColor: "#ffffff", flex: 1 }}>
                                    {isMounting ? (
                                        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 50, marginBottom: 50 }} />
                                    ) : Object.keys(dataPerMonth).length === 0 ? (
                                        <View style={{ padding: 40, alignItems: 'center' }}>
                                            <Text style={{ fontSize: 15, color: '#64748b' }}>Belum ada data pengukuran untuk profil ini.</Text>
                                        </View>
                                    ) : (
                                        Object.keys(dataPerMonth).map(bulan => (
                                            <View key={bulan}>
                                                <View style={{ backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 0.5, borderColor: '#cbd5e1' }}>
                                                    <Text style={{ fontSize: 14, fontWeight: "700", color: "#1e293b" }}>{bulan}</Text>
                                                </View>
                                                {dataPerMonth[bulan].map((item) => {
                                                    const dateVal = item?.created_at || item?.datetime;
                                                    const date = formatDateShort(dateVal);
                                                    const time = formatTimeShort(dateVal);
                                                    const isMovDetected = item?.mov === 1 || item?.mov === true;
                                                    const isIhbDetected = item?.ihb === 1 || item?.ihb === true;

                                                    return (
                                                        <TouchableOpacity
                                                            activeOpacity={0.7}
                                                            onPress={() => {
                                                                GetDataByID(item?.id);
                                                                setDetailDataVisible(true);
                                                            }} 
                                                            key={item.id}
                                                            style={{ 
                                                                flexDirection: 'row',
                                                                alignItems: 'center', 
                                                                paddingVertical: 12,
                                                                paddingHorizontal: 12,
                                                                borderBottomWidth: 1, 
                                                                borderColor: '#e2e8f0',
                                                                backgroundColor: '#ffffff',
                                                            }}
                                                        >
                                                            {/* Tanggal */}
                                                            <View style={{ width: 95, justifyContent: 'center' }}>
                                                                <Text style={{ fontSize: 13, fontWeight: '600', color: "#0f172a" }}>{date}</Text>
                                                                <Text style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{time}</Text>
                                                            </View>

                                                            {/* SYS/DIA */}
                                                            <View style={{ width: 80, alignItems: 'center', justifyContent: 'center' }}>
                                                                <Text style={{ fontSize: 14, fontWeight: '700', color: "#0f172a" }}>
                                                                    {item?.sys ? `${item.sys}/${item.dia}` : '--'}
                                                                </Text>
                                                            </View>

                                                            {/* Denyut BPM */}
                                                            <View style={{ width: 60, alignItems: 'center', justifyContent: 'center' }}>
                                                                <Text style={{ fontSize: 14, fontWeight: '600', color: "#334155" }}>
                                                                    {item?.bpm ?? '--'}
                                                                </Text>
                                                            </View>

                                                            {/* SPO2 */}
                                                            <View style={{ width: 60, alignItems: 'center', justifyContent: 'center' }}>
                                                                <Text style={{ fontSize: 14, fontWeight: '700', color: item?.spo2 ? "#0284c7" : "#94a3b8" }}>
                                                                    {item?.spo2 ? `${item.spo2}` : '--'}
                                                                </Text>
                                                            </View>

                                                            {/* Prediksi Gula Darah */}
                                                            <View style={{ width: 95, alignItems: 'center', justifyContent: 'center' }}>
                                                                <Text style={{ fontSize: 14, fontWeight: '700', color: item?.blood_sugar ? "#059669" : "#94a3b8" }}>
                                                                    {item?.blood_sugar ? `${Math.round(item.blood_sugar)}` : '--'}
                                                                </Text>
                                                            </View>

                                                            {/* Info Terdeteksi */}
                                                            <View style={{ width: 80, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
                                                                <Ionicons name="warning-outline" size={18} color={isMovDetected ? "#eab308" : "#cbd5e1"} />
                                                                <Ionicons name="heart-circle-outline" size={18} color={isIhbDetected ? "#ef4444" : "#cbd5e1"} />
                                                            </View>
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </View>
                                        ))
                                    )}
                                </View>
                            </View>
                        </ScrollView>
                    </ScrollView>
                </View>
            </View>
        </>
    );
};

export default BPChart;
