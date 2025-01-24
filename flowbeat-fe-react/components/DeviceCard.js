import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from "@expo/vector-icons";

const DeviceCard = ({ localDevice }) => {
    return (
        <>
            {
                localDevice.map((device, i) => (
                    <ThemedView key={i} style={{ marginHorizontal: 20, marginVertical: 8, padding: 25, flexDirection: 'row', gap: 15, alignItems: 'flex-start', borderRadius: 18, borderWidth: 0.1, elevation: 1 }}>
                        <ThemedView>
                            <Ionicons size={28} name="laptop" color="#a3a3a3" />
                        </ThemedView>
                        <ThemedView>
                            <ThemedText style={{ fontSize: 15, fontWeight: '400' }}>{device.name}</ThemedText>
                            <ThemedText style={{ fontSize: 12, fontWeight: '300' }}>Last Sync: {new Date(device.lastSync).toLocaleDateString()}</ThemedText>
                        </ThemedView>
                    </ThemedView>
                ))
            }
        </>
    );
}
 
export default DeviceCard;