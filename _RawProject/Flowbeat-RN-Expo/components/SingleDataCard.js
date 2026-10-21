import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SingleDataCard = () => {
    return ( 
        <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 6 }}>
                <View style={{ width: '50%', backgroundColor: '#fff', marginVertical: 15, padding: 8, borderRadius: 18, borderWidth: 0.1, shadowColor: '#2563eb', elevation: 3 }}>
                    <View style={{ justifyContent: 'center', flexDirection: 'column', padding: 5 }}>
                        <View style={{ backgroundColor: '#fff', borderRadius: 50, borderWidth: 0.1, width: 45, height: 45, justifyContent: 'center', alignItems: 'center', elevation: 1 }}>
                            <Ionicons size={28} name='heart-half' color="#2563eb" />
                        </View>
                        <Text style={{ fontSize: 20, fontWeight: '700', marginVertical: 8 }}>Sys mmhg</Text>
                        <Text>30 November 2024</Text>
                    </View>
                </View>
                <View style={{ width: '50%', backgroundColor: '#fff', marginVertical: 15, padding: 8, borderRadius: 18, borderWidth: 0.1, shadowColor: '#2563eb', elevation: 3 }}>
                    <View style={{ justifyContent: 'center', flexDirection: 'column', padding: 5 }}>
                        <View style={{ backgroundColor: '#fff', borderRadius: 50, borderWidth: 0.1, width: 45, height: 45, justifyContent: 'center', alignItems: 'center', elevation: 1 }}>
                            <Ionicons size={28} name='heart-half' color="#2563eb" />
                        </View>
                        <Text style={{ fontSize: 20, fontWeight: '700', marginVertical: 8 }}>Dia mmhg</Text>
                        <Text>30 November 2024</Text>
                    </View>
                </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 6 }}>
                <View style={{ width: '50%', backgroundColor: '#fff', marginVertical: 15, padding: 8, borderRadius: 18, borderWidth: 0.1, shadowColor: '#2563eb', elevation: 3 }}>
                    <View style={{ justifyContent: 'center', flexDirection: 'column', padding: 5 }}>
                        <View style={{ backgroundColor: '#fff', borderRadius: 50, borderWidth: 0.1, width: 45, height: 45, justifyContent: 'center', alignItems: 'center', elevation: 1 }}>
                            <Ionicons size={28} name='heart-half' color="#2563eb" />
                        </View>
                        <Text style={{ fontSize: 20, fontWeight: '700', marginVertical: 8 }}>Sys mmhg</Text>
                        <Text>30 November 2024</Text>
                    </View>
                </View>
                <View style={{ width: '50%', backgroundColor: '#fff', marginVertical: 15, padding: 8, borderRadius: 18, borderWidth: 0.1, shadowColor: '#2563eb', elevation: 3 }}>
                    <View style={{ justifyContent: 'center', flexDirection: 'column', padding: 5 }}>
                        <View style={{ backgroundColor: '#fff', borderRadius: 50, borderWidth: 0.1, width: 45, height: 45, justifyContent: 'center', alignItems: 'center', elevation: 1 }}>
                            <Ionicons size={28} name='heart-half' color="#2563eb" />
                        </View>
                        <Text style={{ fontSize: 20, fontWeight: '700', marginVertical: 8 }}>Dia mmhg</Text>
                        <Text>30 November 2024</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

export default SingleDataCard;