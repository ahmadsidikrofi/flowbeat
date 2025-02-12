import { useEffect, useState } from "react"
import { View, Animated, Easing } from "react-native"
import { Text } from "react-native-paper"

const BloodPressureIndicator = ({ systolic, diastolic }) => {
    const getIndicatorPosition = (sys, dia) => {
        if (!sys || !dia || isNaN(sys) || isNaN(dia)) return 35
        if (sys < 90 || dia < 60) return 15 // Rendah
        if (sys <= 120 && dia <= 80) return 35 // Normal
        if ((sys > 120 && sys < 140) || (dia > 80 && dia < 90)) return 65 // Pra-hipertensi
        return 85 // Hipertensi
    }
    const position = getIndicatorPosition(systolic, diastolic)
    const [animatedPosition] = useState(new Animated.Value(position))
    
    useEffect(() => {
        Animated.timing(animatedPosition, {
            toValue: position,
            duration: 500, 
            easing: Easing.inOut(Easing.ease), // Biar smooth
            useNativeDriver: false, // Karena animasi ini mengubah "left" (layout)
        }).start()
    }, [position])

    return (
        <View style={{ marginTop: 15, marginBottom: 8 }}>
            {/* Bar Indikator */}
            <View style={{ flexDirection: "row", height: 10, borderRadius: 8, overflow: "hidden", gap: 2 }}>
                <View style={{ flex: 25, backgroundColor: "#60a5fa" }} />{/* Biru */}
                <View style={{ flex: 25, backgroundColor: "#22c55e" }} />{/* Hijau */}
                <View style={{ flex: 25, backgroundColor: "#fbbf24" }} />{/* Kuning */}
                <View style={{ flex: 25, backgroundColor: "#f43f5e" }} />{/* Merah */}
            </View>

            {/* Panah Indikator */}
            <Animated.View
                style={{
                    position: "absolute",
                    left: animatedPosition.interpolate({
                        inputRange: [0, 100],
                        outputRange: ["0%", "100%"],
                    }),
                    top: -8,
                    transform: [{ translateX: -6 }],
                }}
            >
                <View
                    style={{
                        width: 0,
                        height: 0,
                        backgroundColor: "transparent",
                        borderStyle: "solid",
                        borderLeftWidth: 6,
                        borderRightWidth: 6,
                        borderBottomWidth: 8,
                        borderLeftColor: "transparent",
                        borderRightColor: "transparent",
                        borderBottomColor: "#333",
                    }}
                />
            </Animated.View>

            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginTop: 4,
                }}
            >
                <Text style={{ color: "#666" }}>Rendah</Text>
                <Text style={{ color: "#666" }}>Tinggi</Text>
            </View>
        </View>
    )
}
export default BloodPressureIndicator