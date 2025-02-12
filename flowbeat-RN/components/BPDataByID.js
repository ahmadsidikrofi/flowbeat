import Config from "@/utils/Config";
import { useLatestBloodPressure } from "@/utils/useLatestBloodPressure";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { Appbar, Button, Card, Dialog, Divider, Portal, Text } from "react-native-paper";

const BPDataByID = ({ setDetailDataVisible, dataById, userToken, refreshData }) => {
    // console.log(dataById)
    const [ deleteDialogVisible, setDeleteDialogVisible ] = useState(false)
    const date = new Date(dataById?.created_at).toLocaleDateString('id-ID', { dateStyle: 'full' })
    const time = new Date(dataById?.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    const { LatestDataBloodPressureFromDB } = useLatestBloodPressure()

    const handleDeleteData = async ( id ) => {
        if (userToken) {
            await axios.delete(`${Config.BASE_URL}/api/track-bp-data/${id}`, {
                headers: { Authorization: `Bearer ${userToken}` }
            }).then(async (res) => {
                setDetailDataVisible(false)
                console.log(res.data)
                refreshData()
                await LatestDataBloodPressureFromDB()
            }).catch((err) => {
                console.log(err);
            })
        }
    }
    
    return ( 
        <ScrollView removeClippedSubviews={true}>
            <View>
                <Appbar.Header>
                    <Appbar.BackAction  onPress={() => setDetailDataVisible(false)} />
                    <Appbar.Content title="Detail data" />
                </Appbar.Header>
            </View>
            <View style={{ padding: 15 }}>
                {/* Pengukuran */}
                <Card style={{ backgroundColor: '#fff' }}>
                    <Card.Content>
                        <Text variant="titleSmall" style={{ color: '#2563eb' }}>Pengukuran</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 30 }}>
                            <Text variant="bodyLarge">Tanggal pengukuran</Text>
                            <Text variant="bodyLarge">{date}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text variant="bodyLarge">Waktu pengukuran</Text>
                            <Text variant="bodyLarge">{time}</Text>
                        </View>
                        <Divider style={{ marginVertical: 20 }} />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text variant="bodyLarge">SYS/DIA</Text>
                            <Text variant="bodyLarge">{dataById?.sys}/{dataById?.dia} mmhg</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 30 }}>
                            <Text variant="bodyLarge">Irama / Denyut</Text>
                            <Text variant="bodyLarge">{dataById?.bpm} bpm</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text variant="bodyLarge">Status</Text>
                            <Text variant="bodyLarge">{dataById?.status}</Text>
                        </View>
                    </Card.Content>
                </Card>
                {/* Detected Info */}
                <Card style={{ backgroundColor: '#fff', marginVertical: 20 }}>
                    <Card.Content>
                        <Text variant="titleSmall" style={{ color: '#2563eb' }}>Detected Info</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 30 }}>
                            <Text variant="bodyLarge">Irreguler heartbeat </Text>
                            {dataById?.ihb ? (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                    <Text variant="bodyLarge" style={{ color: '#f43f5e' }}>Terdeteksi</Text>
                                    <Ionicons name="heart-circle-outline" size={20} color="#666" />
                                </View>
                            ) : (
                                <Text variant="bodyLarge">Tidak terdeteksi</Text>
                            )}
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text variant="bodyLarge">Pergerakan tubuh</Text>
                            {dataById?.mov ? (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                    <Text variant="bodyLarge" style={{ color: '#f43f5e' }}>Terdeteksi</Text>
                                    <Ionicons name="body-outline" size={20} color="#666" />
                                </View>
                            ) : (
                                <Text variant="bodyLarge">Tidak terdeteksi</Text>
                            )}
                        </View>
                        <Divider style={{ marginVertical: 20 }} />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 }}>
                            <Text variant="bodyLarge">Kekencangan manset</Text>
                            <Text variant="bodyLarge">OK👌🏻</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text variant="bodyLarge">Device</Text>
                            <Text variant="bodyLarge">HEM-7142T1</Text>
                        </View>
                    </Card.Content>
                </Card>
                <Button icon="delete-alert-outline" style={{ backgroundColor: "#f43f5e" }}  mode="contained" onPress={() => setDeleteDialogVisible(true)}>
                    Hapus
                </Button>
                <Portal>
                    <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
                        <Dialog.Icon icon="alert-box" size={40} />
                        <Dialog.Title style={{ textAlign: 'center' }}>Hapus data</Dialog.Title>
                        <Dialog.Content>
                            <Text style={{ textAlign: 'center' }} variant="bodyMedium">Sudah yakin mau hapus record data ini?</Text>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button textColor="#000" onPress={() => setDeleteDialogVisible(false)}>Batal</Button>
                            <Button textColor="#f43f5e" onPress={() => {
                                handleDeleteData(dataById?.id)
                                LatestDataBloodPressureFromDB()
                            }}>Hapus</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            </View>
        </ScrollView>
    );
}
 
export default BPDataByID;