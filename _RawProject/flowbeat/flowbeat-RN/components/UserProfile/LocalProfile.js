import { ThemedText } from '../../components/ui/ThemedText';
import { ThemedView } from '../../components/ui/ThemedView';

const LocalProfile = () => {
    return (
        <ThemedView style={{ padding: 18 }}>
            <ThemedText style={{ fontSize: 16, fontWeight: '400', marginBottom: 14 }}>Profil</ThemedText>
            <ThemedView style={{ flexDirection: 'col', justifyContent: 'self-between', gap: 40 }}>
                <ThemedView>
                    <ThemedText style={{ fontSize: 18, fontWeight: '400' }}>Kelamin</ThemedText>
                    <ThemedText style={{ fontSize: 18, fontWeight: '400', color: '#2563eb' }}>Pria</ThemedText>
                </ThemedView>
                <ThemedView>
                    <ThemedText style={{ fontSize: 18, fontWeight: '400' }}>Tanggal Lahir</ThemedText>
                    <ThemedText style={{ fontSize: 18, fontWeight: '400', color: '#dc2626' }}>Belum terdaftar</ThemedText>
                </ThemedView>
                <ThemedView>
                    <ThemedText style={{ fontSize: 18, fontWeight: '400' }}>Berat Badan</ThemedText>
                    <ThemedText style={{ fontSize: 18, fontWeight: '400', color: '#dc2626' }}>Belum terdaftar</ThemedText>
                </ThemedView>
                <ThemedView>
                    <ThemedText style={{ fontSize: 18, fontWeight: '400' }}>Tinggi Badan</ThemedText>
                    <ThemedText style={{ fontSize: 18, fontWeight: '400', color: '#dc2626' }}>Belum terdaftar</ThemedText>
                </ThemedView>
            </ThemedView>
        </ThemedView>
    )
}
export default LocalProfile