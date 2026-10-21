import { View, Text, TouchableOpacity } from "react-native";
import LatestBPRead from "./LatestBPRead";
import { useRouter } from "expo-router";

const LatestReadings = ({ title, latestBP, latestBPFromDB, syncData }) => {
    const router = useRouter();

    return ( 
        <View style={{ marginTop: 24 }}>
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 5 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#0f172a', flexShrink: 1 }}>{title}</Text>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => router.push('/measure')}
                    style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, elevation: 2, backgroundColor: '#2563eb' }}
                >
                    <Text style={{ textAlign: 'center', color: '#fff', fontWeight: '600', fontSize: 14 }}>
                        Ambil Data Terbaru
                    </Text>
                </TouchableOpacity>
            </View>
            <View>
                <LatestBPRead latestBP={latestBP} latestBPFromDB={latestBPFromDB} syncData={syncData}/>
            </View>
        </View>
     );
}
 
export default LatestReadings;