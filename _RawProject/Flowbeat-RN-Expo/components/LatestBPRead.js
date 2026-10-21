import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "@/utils/AuthProvider";
import { useState } from "react";
import BPChart from "./BPChart";
import { Modal, Portal } from "react-native-paper";
import { formatDateFull, formatTimeShort } from "@/utils/dateHelpers";

const LatestBPRead = ({ latestBP, syncData, latestBPFromDB }) => {
    const { userToken } = useAuth();
    const [ modalVisible, setModalVisible ] = useState(false);

    const dateValDB = latestBPFromDB?.created_at || latestBPFromDB?.datetime;
    const dateStrDB = dateValDB ? `${formatDateFull(dateValDB)} ${formatTimeShort(dateValDB)}` : "No data yet";

    const dateValLocal = latestBP?.datetime;
    const dateStrLocal = dateValLocal ? `${formatDateFull(dateValLocal)} ${formatTimeShort(dateValLocal)}` : "No data yet";

    return (
        <>
            {userToken ? (
                <TouchableOpacity activeOpacity={0.8} onPress={() => setModalVisible(true)} style={{ marginTop: 10, elevation: 2, backgroundColor: '#ffffff', shadowColor: '#2563eb', padding: 16, borderRadius: 15, borderWidth: 1, borderColor: '#e2e8f0' }}>
                    <View style={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                        <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'flex-start', alignItems: 'center' }}>
                            <View style={{ backgroundColor: '#2563eb', borderRadius: 20, padding: 10 }}>
                                <MaterialCommunityIcons name="blood-bag" color='#ffffff' size={26} />
                            </View>
                            <View>
                                <Text style={{ fontWeight: '700', fontSize: 22, color: '#0f172a' }}>Tekanan Darah</Text>
                                <Text style={{ fontWeight: '500', fontSize: 14, color: '#64748b', marginTop: 2 }}>
                                    {dateStrDB}
                                </Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignSelf: 'flex-end', alignItems: 'center', gap: 30 }}>
                            <View>
                                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'baseline' }}>
                                    <Text style={{ fontWeight: '800', fontSize: 36, color: '#0f172a' }}>{syncData ? "--" : latestBPFromDB?.sys || "--"}</Text>
                                    <Text style={{ fontWeight: '700', fontSize: 28, color: '#64748b' }}>/</Text>
                                    <Text style={{ fontWeight: '800', fontSize: 36, color: '#0f172a' }}>{syncData ? "--" : latestBPFromDB?.dia || "--"}</Text>
                                </View>
                                <View style={{ alignSelf: 'flex-end', marginTop: -4 }}>
                                    <Text style={{ fontWeight: '600', fontSize: 14, color: '#64748b' }}>mmHg</Text>
                                </View>
                            </View>
                            <View>
                                <View style={{ marginTop: 4 }}>
                                    <Text style={{ fontWeight: '800', fontSize: 32, color: '#0f172a' }}>{syncData ? "--" : latestBPFromDB?.bpm || "..."}</Text>
                                    <Text style={{ fontWeight: '600', fontSize: 14, color: '#64748b' }}>bpm</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            ) : (
                <View style={{ padding: 16, borderRadius: 15, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#2563eb', elevation: 2, marginTop: 10, backgroundColor: '#ffffff', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                    <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'flex-start', alignItems: 'center' }}>
                        <View style={{ backgroundColor: '#2563eb', borderRadius: 20, padding: 10 }}>
                            <MaterialCommunityIcons name="blood-bag" color='#ffffff' size={26} />
                        </View>
                        <View>
                            <Text style={{ fontWeight: '700', fontSize: 22, color: '#0f172a' }}>Tekanan Darah</Text>
                            <Text style={{ fontWeight: '500', fontSize: 14, color: '#64748b', marginTop: 2 }}>
                                {dateStrLocal}
                            </Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignSelf: 'flex-end', alignItems: 'center', gap: 30 }}>
                        <View>
                            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'baseline'}}>
                                <Text style={{ fontWeight: '800', fontSize: 36, color: '#0f172a' }}>{latestBP?.sys || "--"}</Text>
                                <Text style={{ fontWeight: '700', fontSize: 28, color: '#64748b' }}>/</Text>
                                <Text style={{ fontWeight: '800', fontSize: 36, color: '#0f172a' }}>{latestBP?.dia || "--"}</Text> 
                            </View>
                            <View style={{ alignSelf: 'flex-end', marginTop: -4 }}>
                                <Text style={{ fontWeight: '600', fontSize: 14, color: '#64748b' }}>mmHg</Text>
                            </View>
                        </View>
                        <View>
                            <View style={{ marginTop: 4 }}>
                                <Text style={{ fontWeight: '800', fontSize: 32, color: '#0f172a' }}>{latestBP?.bpm || "..."}</Text>
                                <Text style={{ fontWeight: '600', fontSize: 14, color: '#64748b' }}>bpm</Text>
                            </View>
                        </View>
                    </View>
                </View>
            )}
            <Portal>
                <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={{ flex: 1, width: '100%', height: '100%', backgroundColor: '#ffffff', margin: 0, padding: 0 }}>
                    <BPChart setModalVisible={setModalVisible} />
                </Modal>
            </Portal>
        </>
    );
};
 
export default LatestBPRead;