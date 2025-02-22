import { useAuth } from "@/utils/AuthProvider";
import { TouchableOpacity, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import BarBPIndicator from "@/components/BarBPIndicator"
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import HealthInsightInformation from "@/components/HealthInsightInformation"

const HealthInsight = ({ latestBP, latestBPFromDB }) => {
    const { userToken } = useAuth()
    const [ insightInformation, setInsightInformation ] = useState(false)
    
    const getHealthInsight = (sys, dia) => {
        if (!sys || !dia) return { message: "No data available", color: "#9E9E9E" };

        if (sys < 90 || dia < 60) {
            return {
                message: "Tekanan darah rendah. Perhatikan asupan cairan dan jangan terlalu lelah.",
                color: "#0369a1" // biru (Waspada)
            }
        } else if (sys >= 90 && sys <= 120 && dia >= 60 && dia <= 80) {
            return {
                message: "Tekanan darah sedang normal. Pertahankan gaya hidup sehat!",
                color: "#15803d" // hujau (Aman)
            }
        } else if (sys > 120 && sys < 140 || dia > 80 && dia < 90) {
            return {
                message: "Normal Tinggi. Perhatikan pola makan dan kurangi garam.",
                color: "#ca8a04" // kuning (Perlu Diperhatikan)
            }
        } else {
            return {
                message: "Tekanan Darah Tinggi! Segera konsultasi dengan dokter.",
                color: "#be123c" // merah (Bahaya)
            }
        }
    }

    const { message, color } = userToken ?  getHealthInsight(latestBPFromDB?.sys, latestBPFromDB?.dia) : getHealthInsight(latestBP?.sys, latestBP?.dia)
    return (
        <>
            <HealthInsightInformation insightInformation={insightInformation} setInsightInformation={setInsightInformation}/>
            <TouchableOpacity onPress={() => setInsightInformation(true)}>
                <Card style={{ backgroundColor: '#fff', padding: 16, marginVertical: 16 }} accessible={true}>
                    <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center', marginBottom: 16}}>
                        <Text variant="headlineSmall">Wawasan Kesehatan</Text>
                        <Ionicons name={"arrow-forward-outline"} size={28} />
                    </View>
                    <View style={{ backgroundColor: color + "20", padding: 18, borderRadius: 8 }}>
                        <Text style={{ color: `${color}`, fontSize: 20, fontWeight: '800', lineHeight: 30  }} variant="bodyLarge">{message}</Text>
                        <BarBPIndicator systolic={userToken ? latestBPFromDB?.sys : latestBP?.sys} diastolic={userToken ? latestBPFromDB?.dia : latestBP?.dia} />
                    </View>
                </Card>
            </TouchableOpacity>
        </>
    )
}
export default HealthInsight;