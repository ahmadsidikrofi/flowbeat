import { useAuth } from "@/utils/AuthProvider";
import Config from "@/utils/Config";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
const SummaryCard = ({ localDataBP, historyDataFromBP }) => {
    const { userToken } = useAuth()

    const calculateWeeklyAverage = (history) => {
        if (!Array.isArray(history) || history.length === 0) return "--/--"

        let totalSys = 0, totalDia = 0, count = 0
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        history.forEach(entry => {
            const entryDate = new Date(userToken ? entry.created_at : entry.datetime)
            if (entryDate >= oneWeekAgo) {
                totalSys += parseInt(entry.sys)
                totalDia += parseInt(entry.dia)
                count++
            }
        })
        return count > 0 ? `${Math.round(totalSys / count)} / ${Math.round(totalDia / count)}` : "--/--"
    }

    const calculateTotalMeasurements = (history) => {
        return Array.isArray(history) ? history.length : 0
    };

    const weeklyAvgBP = userToken ? calculateWeeklyAverage(historyDataFromBP) : calculateWeeklyAverage(localDataBP)
    const totalMeasurements = userToken ? calculateTotalMeasurements(historyDataFromBP) : calculateTotalMeasurements(localDataBP)

    return (
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 16 }}>
            <Card style={{ flex: 1, marginRight: 8, backgroundColor: '#fff' }}>
                <Card.Content>
                    <Ionicons name="stats-chart-outline" size={28} color="#2563eb" />
                    <Text variant="headlineMedium" style={{ marginTop: 8, fontWeight: "bold" }}>{weeklyAvgBP}</Text>
                    <Text variant="bodyMedium" style={{ color: "#666" }}> Rata-rata Mingguan </Text>
                </Card.Content>
            </Card>
            <Card style={{ flex: 1, marginLeft: 8, backgroundColor: '#fff' }}>
                <Card.Content>
                    <Ionicons name="calendar-outline" size={28} color="#d32f2f" />
                    <Text variant="headlineMedium" style={{ marginTop: 8, fontWeight: "bold" }}> {totalMeasurements} </Text>
                    <Text variant="bodyMedium" style={{ color: "#666" }}> Total Pengukuran </Text>
                </Card.Content>
            </Card>
        </View>
    );
}

export default SummaryCard;