import { useAuth } from "@/utils/AuthProvider";
import { TouchableOpacity, View, Text as RNText } from "react-native";
import { Card } from "react-native-paper";
import BarBPIndicator from "@/components/BarBPIndicator";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import HealthInsightInformation from "@/components/HealthInsightInformation";

const HealthInsight = ({ latestBP, latestBPFromDB }) => {
    const { userToken } = useAuth();
    const [ insightInformation, setInsightInformation ] = useState(false);
    
    const getHealthInsight = (sys, dia) => {
        if (!sys || !dia) return { message: "No data available", color: "#9E9E9E" };

        if (sys < 90 || dia < 60) {
            return {
                message: "Tekanan darah rendah. Perhatikan asupan cairan dan jangan terlalu lelah.",
                color: "#0369a1" // biru (Waspada)
            };
        } else if (sys >= 90 && sys <= 120 && dia >= 60 && dia <= 80) {
            return {
                message: "Tekanan darah sedang normal. Pertahankan gaya hidup sehat!",
                color: "#15803d" // hijau (Aman)
            };
        } else if ((sys > 120 && sys < 140) || (dia > 80 && dia < 90)) {
            return {
                message: "Normal Tinggi. Perhatikan pola makan dan kurangi garam.",
                color: "#ca8a04" // kuning (Perlu Diperhatikan)
            };
        } else {
            return {
                message: "Tekanan Darah Tinggi! Segera konsultasi dengan dokter.",
                color: "#be123c" // merah (Bahaya)
            };
        }
    };

    const { message, color } = userToken ? getHealthInsight(latestBPFromDB?.sys, latestBPFromDB?.dia) : getHealthInsight(latestBP?.sys, latestBP?.dia);
    
    return (
        <>
            <HealthInsightInformation insightInformation={insightInformation} setInsightInformation={setInsightInformation} />
            <TouchableOpacity activeOpacity={0.8} onPress={() => setInsightInformation(true)}>
                <Card style={{ backgroundColor: '#ffffff', marginVertical: 16, borderRadius: 12, elevation: 2 }} accessible={true}>
                    <Card.Content>
                        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: 14 }}>
                            <RNText style={{ fontSize: 18, fontWeight: '700', color: '#0f172a' }}>Wawasan kesehatan</RNText>
                            <Ionicons name={"arrow-forward-outline"} size={22} color="#0f172a" />
                        </View>
                        <View style={{ backgroundColor: color + "18", padding: 16, borderRadius: 10 }}>
                            <RNText style={{ color: `${color}`, fontSize: 17, fontWeight: '800', lineHeight: 26, marginBottom: 8 }}>{message}</RNText>
                            <BarBPIndicator systolic={userToken ? latestBPFromDB?.sys : latestBP?.sys} diastolic={userToken ? latestBPFromDB?.dia : latestBP?.dia} />
                        </View>
                    </Card.Content>
                </Card>
            </TouchableOpacity>
        </>
    );
};

export default HealthInsight;