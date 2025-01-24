import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons"
import axios from "axios";
import { useAuth } from "@/utils/AuthProvider";
import { useEffect, useState } from "react";

const LatestBPRead = ({ latestBP }) => {
    const { userToken } = useAuth();
    const [ latestBPFromDB, setLatestBPFromDB ] = useState('')
    const LatestDataBloodPressureFromDB = async () => {
        if (userToken) {
            try {
                const res = await axios.get(
                    'https://ffff-2001-448a-4007-2e7c-293f-6075-f32c-9e99.ngrok-free.app/api/latest-health-data',
                    { headers: { Authorization: `Bearer ${userToken}` } }
                );
                setLatestBPFromDB(res.data[0]); // Update state dengan data terbaru
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
    }
    useEffect(() => {
        LatestDataBloodPressureFromDB()
    }, [userToken])

    return (
        <>
            {userToken ? (
                <View style={{ padding: 12, borderRadius: 15, borderWidth: 0.1, shadowColor: '#d4d', elevation: 1, marginTop: 10, backgroundColor: '#fff', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
                    <View style={{ marginVertical: 6, flexDirection: 'row', gap: 10, justifyContent: 'flex-start', alignItems: 'center' }}>
                        <View style={{ backgroundColor: '#D91656', borderRadius: 20, padding: 8 }}>
                            <Ionicons size={28} name='heart-half' color="#fff" />
                        </View>
                        <View>
                            <Text style={{ fontWeight: '500', fontSize: 20 }}>Blood Pressure</Text>
                            <Text style={{ fontWeight: '300' }}>
                                {latestBPFromDB?.created_at ? new Date(latestBPFromDB.created_at).toLocaleDateString(
                                    'id-ID', { weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }
                                    ) : "No data yet"}
                            </Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignSelf: 'flex-end', alignItems: 'center', gap: 30 }}>
                        <View>
                            <View style={{ flexDirection: 'row', gap: 15, alignItems: 'center'}}>
                                <Text style={{  fontWeight: '500', fontSize: 40 }}>{latestBPFromDB?.sys || "--"}</Text>
                                <Text style={{  fontWeight: '500', fontSize: 30 }}>/</Text>
                                <Text style={{  fontWeight: '500', fontSize: 40 }}>{latestBPFromDB?.dia || "--"}</Text> 
                            </View>
                            <View style={{ alignSelf: 'flex-end', marginTop: -6 }}>
                                <Text style={{  fontWeight: '500', fontSize: 18}}>mmhg</Text>
                            </View>
                        </View>
                        <View>
                            <View style={{ marginTop: 10 }}>
                                <Text style={{  fontWeight: '400', fontSize: 30 }}>{latestBPFromDB?.bpm || "..."}</Text>
                                <Text style={{  fontWeight: '500', fontSize: 18}}>bpm</Text>
                            </View>
                        </View>
                    </View>
                </View>
            ) : (
                <View style={{ padding: 12, borderRadius: 15, borderWidth: 0.1, shadowColor: '#d4d', elevation: 1, marginTop: 10, backgroundColor: '#fff', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
                    <View style={{ marginVertical: 6, flexDirection: 'row', gap: 10, justifyContent: 'flex-start', alignItems: 'center' }}>
                        <View style={{ backgroundColor: '#D91656', borderRadius: 20, padding: 8 }}>
                            <Ionicons size={28} name='heart-half' color="#fff" />
                        </View>
                        <View>
                            <Text style={{ fontWeight: '500', fontSize: 20 }}>Blood Pressure</Text>
                            <Text style={{ fontWeight: '300' }}>
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
        </>
    );
}
 
export default LatestBPRead;