import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const LocalProfile = () => {
    return (
        <ThemedView style={{ padding: 18 }}>
            <ThemedText style={{ fontSize: 12, fontWeight: '400', marginBottom: 20 }}>Profile</ThemedText>
            <ThemedView style={{ flexDirection: 'col', justifyContent: 'self-between', gap: 40 }}>
                <ThemedView>
                    <ThemedText style={{ fontSize: 18, fontWeight: '400' }}>Kelamin</ThemedText>
                    <ThemedText style={{ fontSize: 14, fontWeight: '400', color: '#dc2626' }}>Pria</ThemedText>
                </ThemedView>
                <ThemedView>
                    <ThemedText style={{ fontSize: 18, fontWeight: '400' }}>Tanggal Lahir</ThemedText>
                    <ThemedText style={{ fontSize: 14, fontWeight: '400', color: '#dc2626' }}>Belum terdaftar</ThemedText>
                </ThemedView>
                <ThemedView>
                    <ThemedText style={{ fontSize: 18, fontWeight: '400' }}>Berat Badan</ThemedText>
                    <ThemedText style={{ fontSize: 14, fontWeight: '400', color: '#dc2626' }}>Belum terdaftar</ThemedText>
                </ThemedView>
                <ThemedView>
                    <ThemedText style={{ fontSize: 18, fontWeight: '400' }}>Tinggi Badan</ThemedText>
                    <ThemedText style={{ fontSize: 14, fontWeight: '400', color: '#dc2626' }}>Belum terdaftar</ThemedText>
                </ThemedView>
            </ThemedView>
        </ThemedView>
    )
}
export default LocalProfile