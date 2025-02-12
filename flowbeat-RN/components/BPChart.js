import { ThemedText } from '@/components/ui/ThemedText';
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from '@/utils/AuthProvider';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Config from '@/utils/Config';
import HelpDialog from "@/components/HelpDialog"
import BPDataByID from "@/components/BPDataByID"
import { Appbar, Button, Divider, Modal, Portal } from 'react-native-paper';

export const BPChart = ({ setModalVisible }) => {
    const { userToken } = useAuth()
    const [datas, setDatas] = useState([])
    const [ dataById, setDataById ] = useState('')
    const baseURL = Config.BASE_URL
    const [ helpVisible, setHelpVisible ] = useState(false);
    const  [ DetailDataVisible, setDetailDataVisible ] = useState(false)

    const GetAllDataFromDB = async () => {
        if (userToken) {
            const res = await axios.get(`${baseURL}/api/track-bp-data`,
                { headers: { Authorization: `Bearer ${userToken}` } }
            )
            setDatas(res.data['health_data'])
        }
    }
    useEffect(() => {
        GetAllDataFromDB()
    }, [userToken])

    const GetDataByID = async ( id ) => {
        if (userToken) {
            const res = await axios.get(`${baseURL}/api/track-bp-data/${id}`, {
                headers: { Authorization: `Bearer ${userToken}` }
            })
            setDataById(res.data.health_data)
        }
    }

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

                        {/* Month Header */}
                        <View style={{ padding: 16, backgroundColor: "#fff" }} >
                            <Text style={{ fontSize: 16, fontWeight: "500", color: "#333" }}>Jan 2025</Text>
                        </View>
                        <View style={{ height: 0.5, width: '100%', backgroundColor: '#ddd', marginTop: 10, elevation: 2 }}></View>
                    </View>
                    {/* BP Data */}
                    {datas.map((data, i) => {
                        const date = new Date(data.created_at).toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit' })
                        const time = new Date(data.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                        return (
                            <Button onPress={() => {
                                setDetailDataVisible(true) 
                                GetDataByID(data.id)
                            }} key={i} style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e0e0e0',  alignItems: 'center' }}>
                                <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'flex-start', alignItems: 'center' }}>
                                    <View style={{ paddingHorizontal: 5, flex: 2 }}>
                                        <ThemedText style={{ fontSize: 14, color: "#333" }}>{date}</ThemedText>
                                        <ThemedText style={{ fontSize: 16, color: "#666", marginTop: 2 }}>{time}</ThemedText>
                                    </View>
                                    <View style={{ flex: 1, flexDirection: 'row', gap: 8, fontSize: 16, textAlign: "center", color: "#333" }}>
                                        <ThemedText style={{ fontSize: 16, color: "#666" }}>{data?.sys}/</ThemedText>
                                        <ThemedText style={{ fontSize: 16, color: "#666" }}>{data?.dia}</ThemedText>
                                    </View>
                                    <Text style={{ flex: 1, fontSize: 16, textAlign: "center", color: "#666" }}>{data?.bpm}</Text>
                                    <View style={{ flex: 1, alignItems: "center", flexDirection: 'row', gap: 5 }}>
                                        <ThemedText>{data?.mov === 1 ? <Ionicons name="warning-outline" size={20} color="#666" /> : <Ionicons name="bowling-ball" size={20} color="#ddd" />}</ThemedText>
                                        <ThemedText>{data?.ihb === 1 ? <Ionicons name="heart-circle-outline" size={20} color="#666" /> : <Ionicons name="bowling-ball" size={20} color="#ddd" />}</ThemedText>
                                    </View>
                                </View>
                            </Button>
                        )
                    })}
                </View>
            </ScrollView>
        </>
    );
}

export default BPChart;
