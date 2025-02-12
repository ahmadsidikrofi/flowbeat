import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons"
import { useAuth } from "@/utils/AuthProvider";
import { useState } from "react";
import BPChart from "./BPChart"
import { Modal, Portal } from "react-native-paper";

const LatestBPRead = ({ latestBP, syncData, latestBPFromDB }) => {
    const { userToken } = useAuth();
    const [ modalVisible, setModalVisible ] = useState(false)

    return (
        <>
            {userToken ? (
                <TouchableOpacity onPress={() => setModalVisible(true)} style={{  marginTop: 10, elevation: 1, backgroundColor: '#fff', shadowColor: '#2563eb', padding: 12, borderRadius: 15, borderWidth: 0.1 }}>
                    <View style={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
                        <View style={{ marginVertical: 6, flexDirection: 'row', gap: 10, justifyContent: 'flex-start', alignItems: 'center' }}>
                            <View style={{ backgroundColor: '#2563eb', borderRadius: 20, padding: 8 }}>
                                <MaterialCommunityIcons name="blood-bag" color='#fff' size={28} />
                            </View>
                            <View>
                                <Text style={{ fontWeight: '500', fontSize: 25 }}>Tekanan Darah</Text>
                                <Text style={{ fontWeight: '300', fontSize: 18 }}>
                                    {latestBPFromDB?.created_at ? new Date(latestBPFromDB.created_at).toLocaleDateString(
                                        'id-ID', { weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }
                                    ) : "No data yet"}
                                </Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignSelf: 'flex-end', alignItems: 'center', gap: 30 }}>
                            <View>
                                <View style={{ flexDirection: 'row', gap: 15, alignItems: 'center' }}>
                                    <Text style={{ fontWeight: '500', fontSize: 40 }}>{syncData ? "--" : latestBPFromDB?.sys || "--"}</Text>
                                    <Text style={{ fontWeight: '500', fontSize: 30 }}>/</Text>
                                    <Text style={{ fontWeight: '500', fontSize: 40 }}>{syncData ? "--" : latestBPFromDB?.dia || "--"}</Text>
                                </View>
                                <View style={{ alignSelf: 'flex-end', marginTop: -6 }}>
                                    <Text style={{ fontWeight: '500', fontSize: 18 }}>mmhg</Text>
                                </View>
                            </View>
                            <View>
                                <View style={{ marginTop: 10 }}>
                                    <Text style={{ fontWeight: '400', fontSize: 30 }}>{syncData ? "--" : latestBPFromDB?.bpm || "..."}</Text>
                                    <Text style={{ fontWeight: '500', fontSize: 18 }}>bpm</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            ) : (
                <View style={{ padding: 12, borderRadius: 15, borderWidth: 0.1, shadowColor: '#2563eb', elevation: 1, marginTop: 10, backgroundColor: '#fff', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
                    <View style={{ marginVertical: 6, flexDirection: 'row', gap: 10, justifyContent: 'flex-start', alignItems: 'center' }}>
                        <View style={{ backgroundColor: '#2563eb', borderRadius: 20, padding: 8 }}>
                            <MaterialCommunityIcons name="blood-bag" color='#fff' size={28} />
                        </View>
                        <View>
                            <Text style={{ fontWeight: '500', fontSize: 25 }}>Tekanan Darah</Text>
                            <Text style={{ fontWeight: '300', fontSize: 18 }}>
                                {latestBP?.datetime ? new Date(latestBP.datetime).toLocaleDateString(
                                    'id-ID', { weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }
                                    ) : "No data yet"}
                            </Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignSelf: 'flex-end', alignItems: 'center', gap: 30 }}>
                        <View>
                            <View style={{ flexDirection: 'row', gap: 15, alignItems: 'center'}}>
                                <Text style={{  fontWeight: '500', fontSize: 40 }}>{latestBP?.sys || "--"}</Text>
                                <Text style={{  fontWeight: '500', fontSize: 30 }}>/</Text>
                                <Text style={{  fontWeight: '500', fontSize: 40 }}>{latestBP?.dia || "--"}</Text> 
                            </View>
                            <View style={{ alignSelf: 'flex-end', marginTop: -6 }}>
                                <Text style={{  fontWeight: '500', fontSize: 18}}>mmhg</Text>
                            </View>
                        </View>
                        <View>
                            <View style={{ marginTop: 10 }}>
                                <Text style={{  fontWeight: '400', fontSize: 30 }}>{latestBP?.bpm || "..."}</Text>
                                <Text style={{  fontWeight: '500', fontSize: 18}}>bpm</Text>
                            </View>
                        </View>
                    </View>
                </View>
            )}
            <Portal>
                <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={{ flex: 1, backgroundColor: '#fff' }}>
                    <BPChart setModalVisible={setModalVisible} />
                </Modal>
            </Portal>
        </>
    );
}
 
export default LatestBPRead;