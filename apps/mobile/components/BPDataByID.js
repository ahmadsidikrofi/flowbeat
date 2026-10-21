import Config from "@/utils/Config";
import { useLatestBloodPressure } from "@/utils/useLatestBloodPressure";
import { measurementApi } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, View, Text as RNText } from "react-native";
import { Appbar, Button, Card, Dialog, Divider, Portal, Text } from "react-native-paper";

import { formatDateFull, formatTimeShort } from "@/utils/dateHelpers";

const BPDataByID = ({ setDetailDataVisible, dataById, userToken, refreshData }) => {
    const [ deleteDialogVisible, setDeleteDialogVisible ] = useState(false);
    const dateVal = dataById?.created_at || dataById?.datetime;
    const date = formatDateFull(dateVal);
    const time = formatTimeShort(dateVal);
    const { LatestDataBloodPressureFromDB } = useLatestBloodPressure();

    const handleDeleteData = async ( id ) => {
        if (userToken) {
            const numericId = typeof id === 'number' ? id : parseInt(String(id).replace(/[^0-9]/g, ''), 10);
            if (!numericId) return;

            const res = await measurementApi.delete(numericId, userToken);
            if (res.success) {
                setDetailDataVisible(false);
                refreshData();
                await LatestDataBloodPressureFromDB();
            } else {
                console.log('Error deleting measurement:', res.error);
            }
        }
    };
    
    return ( 
        <ScrollView style={{ backgroundColor: '#f8fafc' }} removeClippedSubviews={true}>
            <View>
                <Appbar.Header style={{ backgroundColor: '#1e293b' }}>
                    <Appbar.BackAction onPress={() => setDetailDataVisible(false)} color="#ffffff" />
                    <Appbar.Content title="Detail Data Pengukuran" titleStyle={{ color: '#ffffff', fontWeight: 'bold' }} />
                </Appbar.Header>
            </View>
            <View style={{ padding: 16 }}>
                {/* Pengukuran Card */}
                <Card style={{ backgroundColor: '#ffffff', borderRadius: 12, elevation: 2, marginBottom: 16 }}>
                    <Card.Content style={{ padding: 16 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <RNText style={{ fontSize: 16, fontWeight: '700', color: '#2563eb' }}>Pengukuran</RNText>
                            <RNText style={{ fontSize: 14, fontWeight: '600', color: '#2563eb' }}>{date}</RNText>
                        </View>
                        
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
                            <RNText style={{ fontSize: 15, color: '#64748b' }}>Waktu pengukuran</RNText>
                            <RNText style={{ fontSize: 15, fontWeight: '600', color: '#0f172a' }}>{time}</RNText>
                        </View>
                        
                        <Divider style={{ marginVertical: 14, backgroundColor: '#e2e8f0' }} />
                        
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
                            <RNText style={{ fontSize: 15, color: '#64748b' }}>SYS/DIA</RNText>
                            <RNText style={{ fontSize: 15, fontWeight: '700', color: '#0f172a' }}>{dataById?.sys}/{dataById?.dia} mmHg</RNText>
                        </View>
                        
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
                            <RNText style={{ fontSize: 15, color: '#64748b' }}>Irama / Denyut</RNText>
                            <RNText style={{ fontSize: 15, fontWeight: '600', color: '#0f172a' }}>{dataById?.bpm} bpm</RNText>
                        </View>
                        
                        {dataById?.spo2 ? (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
                                <RNText style={{ fontSize: 15, color: '#64748b' }}>Saturasi Oksigen (SpO2)</RNText>
                                <RNText style={{ fontSize: 15, fontWeight: '700', color: '#0284c7' }}>{dataById?.spo2}%</RNText>
                            </View>
                        ) : null}
                        
                        {dataById?.blood_sugar ? (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
                                <RNText style={{ fontSize: 15, color: '#64748b' }}>Prediksi Gula Darah</RNText>
                                <RNText style={{ fontSize: 15, fontWeight: '700', color: '#059669' }}>{Math.round(dataById?.blood_sugar)} mg/dL</RNText>
                            </View>
                        ) : null}
                        
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                            <RNText style={{ fontSize: 15, color: '#64748b' }}>Status</RNText>
                            <RNText style={{ fontSize: 15, fontWeight: '600', color: '#0f172a' }}>{dataById?.status || 'Normal'}</RNText>
                        </View>
                    </Card.Content>
                </Card>

                {/* Detected Info Card */}
                <Card style={{ backgroundColor: '#ffffff', borderRadius: 12, elevation: 2, marginBottom: 20 }}>
                    <Card.Content style={{ padding: 16 }}>
                        <RNText style={{ fontSize: 16, fontWeight: '700', color: '#2563eb', marginBottom: 20 }}>Detected Info</RNText>
                        
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <RNText style={{ fontSize: 15, color: '#64748b' }}>Irreguler heartbeat</RNText>
                            {dataById?.ihb ? (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    <RNText style={{ fontSize: 15, fontWeight: '600', color: '#ef4444' }}>Terdeteksi</RNText>
                                    <Ionicons name="heart-circle-outline" size={20} color="#ef4444" />
                                </View>
                            ) : (
                                <RNText style={{ fontSize: 15, color: '#64748b' }}>Tidak terdeteksi</RNText>
                            )}
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <RNText style={{ fontSize: 15, color: '#64748b' }}>Pergerakan tubuh</RNText>
                            {dataById?.mov ? (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    <RNText style={{ fontSize: 15, fontWeight: '600', color: '#eab308' }}>Terdeteksi</RNText>
                                    <Ionicons name="warning-outline" size={20} color="#eab308" />
                                </View>
                            ) : (
                                <RNText style={{ fontSize: 15, color: '#64748b' }}>Tidak terdeteksi</RNText>
                            )}
                        </View>

                        <Divider style={{ marginVertical: 14, backgroundColor: '#e2e8f0' }} />

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
                            <RNText style={{ fontSize: 15, color: '#64748b' }}>Kekencangan manset</RNText>
                            <RNText style={{ fontSize: 15, fontWeight: '600', color: '#0f172a' }}>OK 👌🏻</RNText>
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <RNText style={{ fontSize: 15, color: '#64748b' }}>Device</RNText>
                            <RNText style={{ fontSize: 15, fontWeight: '600', color: '#0f172a' }}>HEM-7142T1</RNText>
                        </View>
                    </Card.Content>
                </Card>

                {/* Hapus Button */}
                <Button 
                    icon="delete-outline" 
                    style={{ backgroundColor: "#ef4444", borderRadius: 8, paddingVertical: 4 }}  
                    mode="contained" 
                    textColor="#ffffff"
                    onPress={() => setDeleteDialogVisible(true)}
                >
                    Hapus
                </Button>

                <Portal>
                    <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)} style={{ backgroundColor: '#ffffff' }}>
                        <Dialog.Icon icon="alert-box" size={40} color="#ef4444" />
                        <Dialog.Title style={{ textAlign: 'center', color: '#0f172a', fontWeight: 'bold' }}>Hapus Data</Dialog.Title>
                        <Dialog.Content>
                            <Text style={{ textAlign: 'center', color: '#475569' }} variant="bodyMedium">Apakah Anda yakin ingin menghapus record data ini?</Text>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button textColor="#64748b" onPress={() => setDeleteDialogVisible(false)}>Batal</Button>
                            <Button textColor="#ef4444" onPress={() => {
                                handleDeleteData(dataById?.id);
                                LatestDataBloodPressureFromDB();
                            }}>Hapus</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            </View>
        </ScrollView>
    );
}
 
export default BPDataByID;