import { View, Text as RNText } from "react-native";
import { Card } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import Config from "@/utils/Config";
import { useAppContext } from "@/utils/AuthProvider";
import { useEffect, useState } from "react";

const VitalSignCard = ({ title, value, unit, isNormal, icon }) => (
    <Card style={{ backgroundColor: '#ffffff', flex: 1, borderRadius: 12, elevation: 2 }}>
        <Card.Content style={{ padding: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name={icon} size={22} color={isNormal === "Normal" ? "#15A34A" : isNormal === "Cukup Normal" ? "#f59e0b" : "#D32F2F"} />
                <RNText style={{ fontWeight: "700", fontSize: 14, color: "#475569" }}>{title}</RNText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginVertical: 8 }}>
                <RNText style={{ fontSize: 32, fontWeight: "800", color: "#0f172a" }}>{value}</RNText>
                <RNText style={{ fontSize: 16, fontWeight: "600", color: "#64748b" }}>{unit}</RNText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <RNText style={{ fontSize: 15, fontWeight: "700", color: isNormal === "Normal" ? "#15A34A" : isNormal === "Cukup Normal" ? "#f59e0b" : isNormal === "--" ? "#94a3b8" : "#D32F2F" }}>
                    {isNormal}
                </RNText>
                <Ionicons name={"arrow-forward-outline"} size={18} color={isNormal === "Normal" ? "#15A34A" : isNormal === "Cukup Normal" ? "#f59e0b" : isNormal === "--" ? "#94a3b8" : "#D32F2F"} />
            </View>
        </Card.Content>
    </Card>
);

const LatestVitalSigns = () => {
    const { currentUser, currentProfile } = useAppContext();
    const baseURL = Config.BASE_URL;
    const [ latestVitalSign, setLatestVitalSign ] = useState({ bpm: null, bpm_status: "--", spo2: null, spo2_status: "--" });

    const LatestVitalSignFromDB = async () => {
        if (currentUser && currentProfile) {
            let bpBpm = null;
            let spo2Value = null;

            try {
                const bpRes = await axios.get(`${baseURL}/api/measurements/${currentProfile.backendId || currentProfile.id}/latest`, {
                    headers: { Authorization: `Bearer ${currentUser.token}` }
                });
                bpBpm = bpRes.data?.bpm;
            } catch (error) {
                console.log("Error fetching BP for vital signs:", error.message);
            }

            try {
                const spo2Res = await axios.get(`${baseURL}/api/measurements/${currentProfile.backendId || currentProfile.id}/spo2/latest`, {
                    headers: { Authorization: `Bearer ${currentUser.token}` }
                });
                spo2Value = spo2Res.data?.spo2;
            } catch (error) {
                console.log("Error fetching SpO2:", error.message);
            }

            const bpmStatus = bpBpm ? (bpBpm > 100 ? "Tinggi" : bpBpm < 60 ? "Rendah" : "Normal") : "--";
            const spo2Status = spo2Value ? (spo2Value >= 95 ? "Normal" : "Rendah") : "--";

            setLatestVitalSign({
                bpm: bpBpm,
                bpm_status: bpmStatus,
                spo2: spo2Value,
                spo2_status: spo2Status
            });
        }
    };

    useEffect(() => {
        LatestVitalSignFromDB();
    }, [currentUser, currentProfile]);

    return (
        <View style={{ marginVertical: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <RNText style={{ fontSize: 18, fontWeight: '700', color: '#0f172a' }}>
                    Tanda vital terbaru
                </RNText>
            </View>
            <View style={{ flexDirection: "row", gap: 12, marginVertical: 4 }}>
                <VitalSignCard
                    title="Denyut Nadi"
                    value={latestVitalSign?.bpm || "--"}
                    unit="bpm"
                    isNormal={latestVitalSign?.bpm_status || "--"}
                    icon="heart-outline"
                />
                <VitalSignCard 
                    title="Oksigen" 
                    value={latestVitalSign?.spo2 || "--"} 
                    unit="%" 
                    isNormal={latestVitalSign?.spo2_status || "--"} 
                    icon="water-outline" 
                />
            </View>
        </View>
    );
};

export default LatestVitalSigns;