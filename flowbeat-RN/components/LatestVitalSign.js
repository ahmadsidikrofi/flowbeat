import { View } from "react-native"
import { Button, Card, Text } from "react-native-paper"
import { Ionicons } from "@expo/vector-icons"
import axios from "axios"
import Config from "@/utils/Config"
import { useAuth } from "@/utils/AuthProvider"
import { useEffect, useState } from "react"

const VitalSignCard = ({ title, value, unit, isNormal, icon }) => (
    <Card style={{ backgroundColor: '#fff', flex: 1 }}>
        <Card.Content>
            <View style={{ flexDirection: 'row', alignContent:'center', alignItems: 'center', gap: 4 }}>
                <Ionicons name={icon} size={24} color={isNormal ? "#15A34A" : "#D32F2F"} />
                <Text variant="titleLarge" style={{ fontWeight: "bold" }}>{title}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignContent:'center', alignItems: 'center', gap: 4 }}>
                <Text variant="displayLarge" style={{ marginTop: 8, fontWeight: "bold" }}>{value}</Text>
                <Text variant="titleLarge" style={{ color: "#333" }}> {unit} </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
                <Text variant="titleLarge" style={{ color: isNormal === "Normal" ? "#15A34A" : isNormal === "Cukup Normal" ? "#f59e0b" : "#D32F2F" }}>
                    {isNormal}
                </Text>
                <Ionicons name={"arrow-forward-outline"} size={24} color={isNormal === "Normal" ? "#15A34A" : isNormal === "Cukup Normal" ? "#f59e0b" : "#D32F2F"} />
            </View>
        </Card.Content>
    </Card>
)

const LatestVitalSigns = () => {
    const { userToken } = useAuth()
    const baseURL = Config.BASE_URL
    const [ latestVitalSign, setLatestVitalSign ] = useState('')
    const LatestVitalSignFromDB = async () => {
        if (userToken) {
            const res = await axios.get(`${baseURL}/api/latest-vital-data`, {
                headers: { Authorization: `Bearer ${userToken}` }
            })
            setLatestVitalSign(res.data[0])
        }
    } 

    useEffect(() => {
        LatestVitalSignFromDB()
    }, [userToken, latestVitalSign])

    return (
        <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text variant="titleLarge">
                    Tanda Vital Terakhir
                </Text>
                {/* <Button mode="contained" >Sync Data</Button> */}
            </View>
            <View style={{ flexDirection: "row", gap: 12, marginVertical: 16 }}>
                <VitalSignCard
                    title="Denyut Nadi"
                    value={latestVitalSign?.bpm || "--"}
                    unit="bpm"
                    isNormal={latestVitalSign?.bpm_status || "--"}
                    icon="heart-outline"
                />
                <VitalSignCard title="Oksigen" value={latestVitalSign?.spo2 || "--"} unit="%" isNormal={latestVitalSign?.spo2_status || "--"} icon="water-outline" />
            </View>
        </View>
    )
}
export default LatestVitalSigns