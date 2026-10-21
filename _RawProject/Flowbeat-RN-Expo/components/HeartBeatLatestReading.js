import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

const HeartBeatLatestReading = () => {
    return (
        <View style={{ marginTop: 10, elevation: 1, backgroundColor: '#fff', shadowColor: '#2563eb', padding: 12, borderRadius: 15, borderWidth: 0.1 }}>
            <View style={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
                <View style={{ marginVertical: 6, flexDirection: 'row', gap: 10, justifyContent: 'flex-start', alignItems: 'center' }}>
                    <View style={{ backgroundColor: '#2563eb', borderRadius: 20, padding: 8 }}>
                        <MaterialCommunityIcons name="heart" color='#fff' size={20} />
                    </View>
                    <View>
                        <Text style={{ fontWeight: '500', fontSize: 20 }}>Heart beat & Oxygen</Text>
                        <Text style={{ fontWeight: '300' }}>Sen, 03/02/2025, 22.10</Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', alignSelf: 'flex-end', alignItems: 'center', gap: 30 }}>
                    <View>
                        <View style={{ flexDirection: 'row', gap: 15, alignItems: 'center' }}>
                            <Text style={{ fontWeight: '500', fontSize: 40 }}>101</Text>
                            <Text style={{ fontWeight: '500', fontSize: 30 }}>/</Text>
                            <Text style={{ fontWeight: '500', fontSize: 40 }}>96</Text>
                        </View>
                        <View style={{ alignSelf: 'flex-end', marginTop: -6 }}>
                            <Text style={{ fontWeight: '500', fontSize: 18 }}>bpm</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

export default HeartBeatLatestReading;