import { ThemedText } from '@/components/ui/ThemedText';
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from '@/utils/AuthProvider';
import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Config from '@/utils/Config';
import HelpDialog from "@/components/HelpDialog"
import BPDataByID from "@/components/BPDataByID"
import { ActivityIndicator, Appbar, Button, Divider, Modal, Portal } from 'react-native-paper';

export const BPChart = ({ setModalVisible }) => {
    const { userToken } = useAuth()
    const [datas, setDatas] = useState([])
    const [ dataById, setDataById ] = useState('')
    const baseURL = Config.BASE_URL
    const [ helpVisible, setHelpVisible ] = useState(false);
    const  [ DetailDataVisible, setDetailDataVisible ] = useState(false)
    const [isMounting, setIsMounting] = useState(false)

    const GetAllDataFromDB = async () => {
        if (userToken) {
            setIsMounting(true)
            const res = await axios.get(`${baseURL}/api/patients/blood-pressures`,
                { headers: { Authorization: `Bearer ${userToken}` } }
            )
            setDatas(res.data['health_data'])
            setIsMounting(false)
        }
    }

    const GetDataByID = async ( id ) => {
        if (userToken) {
            const res = await axios.get(`${baseURL}/api/patients/blood-pressures/${id}`, {
                headers: { Authorization: `Bearer ${userToken}` }
            })
            setDataById(res.data.health_data)
        }
    }

    const dataPerMonth = useMemo(() => {
        const group = {}
        datas.forEach((item) => {
            const month = new Date(item.created_at).toLocaleString('id-ID', { month: 'long', year: 'numeric' })
            if (!group[month]) {
                group[month] = []
            }
            group[month].push(item)
        })
        return group
    }, [datas])

    useEffect(() => {
        GetAllDataFromDB()
    }, [userToken])

    return (
        <>
            <HelpDialog helpVisible={helpVisible} setHelpVisible={setHelpVisible}/>
            <Portal>
                <Modal visible={DetailDataVisible} onDismiss={() => setDetailDataVisible(false)}
                    contentContainerStyle={{ flex: 1, backgroundColor: '#ffffff', elevation: 0 }}    
                >
                    <BPDataByID  setDetailDataVisible={setDetailDataVisible} dataById={dataById} key={dataById.id} userToken={userToken} refreshData={GetAllDataFromDB} />
                </Modal>
            </Portal>
            <ScrollView StickyHeaderComponent={true}>
                <View>
                    <Appbar.Header>
                        <Appbar.BackAction onPress={() => setModalVisible(false)} />
                        <Appbar.Content title="Sejarah data" />
                        <Appbar.Action icon="clipboard-plus-outline" onPress={() => {}} />
                        <Appbar.Action icon="help-circle-outline" onPress={() => setHelpVisible(true)} />
                    </Appbar.Header>
                    {/* <Divider /> */}
                    <View>
                        {/* Header */}
                        <View
                            style={{
                                flexDirection: "row",
                                paddingHorizontal: 16,
                                borderBottomWidth: 0.5,
                                borderBottomColor: "#e0e0e0",
                                backgroundColor: "#e0f2fe",
                            }}
                        >
                            <ThemedText style={{ flex: 2, fontSize: 14, color: "#666", fontWeight: "500" }}>Tanggal</ThemedText>
                            <View style={{ flex: 1, alignItems: "center", }}>
                                <ThemedText style={{ fontSize: 14, color: "#666", fontWeight: "500" }}>SYS/DIA</ThemedText>
                                <ThemedText style={{ fontSize: 12, color: "#999", marginTop: 2 }}>mmHg</ThemedText>
                            </View>
                            <View style={{ flex: 1, alignItems: "center", paddingLeft: 10 }}>
                                <ThemedText style={{ fontSize: 14, color: "#666", fontWeight: "500" }}>Denyut</ThemedText>
                                <ThemedText style={{ fontSize: 12, color: "#999", marginTop: 2 }}>bpm</ThemedText>
                            </View>
                            <ThemedText style={{ flex: 1, fontSize: 14, color: "#666", fontWeight: "500" }}>Info{"\n"}Terdeteksi</ThemedText>
                        </View>

                        <View style={{ backgroundColor: "#fff" }} >
                            {/* Month Header */}
                            {isMounting ? (
                                <ActivityIndicator size="large" style={{ marginTop: 50 }} />
                            ) : (
                                Object.keys(dataPerMonth).map(bulan => (
                                    <View key={bulan}>
                                        <Text style={{ padding: 16, fontSize: 16, fontWeight: "500", color: "#333" }}>{bulan}</Text>
                                        {dataPerMonth[bulan].map((item) => {
                                            const date = new Date(item?.created_at).toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit' })
                                            const time = new Date(item?.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                                            return (
                                                <Button onPress={() => {
                                                    setDetailDataVisible(true)
                                                    GetDataByID(item?.id)
                                                }} key={item.id}
                                                    style={{ 
                                                        width: '100%', 
                                                        flexDirection: 'row',
                                                        borderBottomWidth: 1, 
                                                        borderColor: '#e0e0e0', 
                                                        alignItems: 'center', 
                                                        paddingVertical: 12,
                                                        paddingHorizontal: 16
                                                    }}
                                                >
                                                    <View style={{ flex: 1, flexDirection: 'row', gap: 10, justifyContent: 'flex-start', alignItems: 'center' }}>
                                                        <View style={{ justifyContent: 'center' }}>
                                                            <Text style={{ fontSize: 14, color: "#333" }}>{date}</Text>
                                                            <Text style={{ fontSize: 16, color: "#666", marginTop: 2 }}>{time}</Text>
                                                        </View>
                                                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'baseline', marginLeft: 90, width: 40 }}>
                                                            <Text style={{ fontSize: 16, color: "#666" }}>{item?.sys}/</Text>
                                                            <Text style={{ fontSize: 16, color: "#666" }}>{item?.dia}</Text>
                                                        </View>
                                                        <View style={{ alignItems: 'baseline', marginLeft: 70 }}>
                                                            <Text style={{ fontSize: 16, textAlign: "center", color: "#666" }}>{item?.bpm}</Text>
                                                        </View>
                                                        <View style={{ alignItems: "center", flexDirection: 'row',justifyContent: 'center',  gap: 5, marginLeft: 20 }}>
                                                            <ThemedText>{item?.mov === 1 ? <Ionicons name="warning-outline" size={20} color="#666" /> : <Ionicons name="bowling-ball" size={20} color="#ddd" />}</ThemedText>
                                                            <ThemedText>{item?.ihb === 1 ? <Ionicons name="heart-circle-outline" size={20} color="#666" /> : <Ionicons name="bowling-ball" size={20} color="#ddd" />}</ThemedText>
                                                        </View>
                                                    </View>
                                                </Button>
                                            )
                                        })}
                                        <View style={{ height: 0.5, width: '100%', backgroundColor: '#ddd', marginVertical: 10, elevation: 1 }}></View>
                                    </View>
                                ))
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </>
    );
}

export default BPChart;
