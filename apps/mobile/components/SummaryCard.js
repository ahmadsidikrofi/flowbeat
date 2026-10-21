import { useAuth } from "@/utils/AuthProvider";
import Config from "@/utils/Config";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { View, Text as RNText } from "react-native";
import { Card } from "react-native-paper";

const SummaryCard = ({ localDataBP, historyDataFromBP }) => {
    const { userToken } = useAuth();

    const calculateWeeklyAverage = (history) => {
        if (!Array.isArray(history) || history.length === 0) return "--/--";

        let totalSys = 0, totalDia = 0, count = 0;
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        history.forEach(entry => {
            const entryDate = new Date(userToken ? entry.created_at : entry.datetime);
            if (entryDate >= oneWeekAgo) {
                totalSys += parseInt(entry.sys);
                totalDia += parseInt(entry.dia);
                count++;
            }
        });
        return count > 0 ? `${Math.round(totalSys / count)} / ${Math.round(totalDia / count)}` : "--/--";
    };

    const calculateTotalMeasurements = (history) => {
        return Array.isArray(history) ? history.length : 0;
    };

    const weeklyAvgBP = userToken ? calculateWeeklyAverage(historyDataFromBP) : calculateWeeklyAverage(localDataBP);
    const totalMeasurements = userToken ? calculateTotalMeasurements(historyDataFromBP) : calculateTotalMeasurements(localDataBP);

    return (
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12, marginBottom: 24 }}>
            <Card style={{ flex: 1, marginRight: 8, backgroundColor: '#ffffff', borderRadius: 12, elevation: 2 }}>
                <Card.Content style={{ padding: 14 }}>
                    <Ionicons name="stats-chart-outline" size={26} color="#2563eb" />
                    <RNText style={{ marginTop: 10, fontSize: 24, fontWeight: "800", color: "#0f172a" }}>{weeklyAvgBP}</RNText>
                    <RNText style={{ fontSize: 13, color: "#64748b", marginTop: 4, fontWeight: "500" }}>Rata-rata Mingguan</RNText>
                </Card.Content>
            </Card>
            <Card style={{ flex: 1, marginLeft: 8, backgroundColor: '#ffffff', borderRadius: 12, elevation: 2 }}>
                <Card.Content style={{ padding: 14 }}>
                    <Ionicons name="calendar-outline" size={26} color="#d32f2f" />
                    <RNText style={{ marginTop: 10, fontSize: 24, fontWeight: "800", color: "#0f172a" }}>{totalMeasurements}</RNText>
                    <RNText style={{ fontSize: 13, color: "#64748b", marginTop: 4, fontWeight: "500" }}>Total Pengukuran</RNText>
                </Card.Content>
            </Card>
        </View>
    );
};

export default SummaryCard;