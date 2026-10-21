import { ThemedText } from '../../components/ui/ThemedText';
import { ThemedView } from '../../components/ui/ThemedView';

const LocalProfile = () => {
    return (
        <ThemedView style={{ padding: 18 }}>
            <ThemedText style={{ fontSize: 16, fontWeight: '700', marginBottom: 14, color: '#38bdf8' }}>Profil</ThemedText>
            <ThemedView style={{ flexDirection: 'column', gap: 24 }}>
                <ThemedView>
                    <ThemedText style={{ fontSize: 16, fontWeight: '600', color: '#f8fafc' }}>Kelamin</ThemedText>
                    <ThemedText style={{ fontSize: 16, fontWeight: '500', color: '#38bdf8', marginTop: 2 }}>Pria</ThemedText>
                </ThemedView>
                <ThemedView>
                    <ThemedText style={{ fontSize: 16, fontWeight: '600', color: '#f8fafc' }}>Tanggal Lahir</ThemedText>
                    <ThemedText style={{ fontSize: 16, fontWeight: '500', color: '#f87171', marginTop: 2 }}>Belum terdaftar</ThemedText>
                </ThemedView>
                <ThemedView>
                    <ThemedText style={{ fontSize: 16, fontWeight: '600', color: '#f8fafc' }}>Berat Badan</ThemedText>
                    <ThemedText style={{ fontSize: 16, fontWeight: '500', color: '#f87171', marginTop: 2 }}>Belum terdaftar</ThemedText>
                </ThemedView>
                <ThemedView>
                    <ThemedText style={{ fontSize: 16, fontWeight: '600', color: '#f8fafc' }}>Tinggi Badan</ThemedText>
                    <ThemedText style={{ fontSize: 16, fontWeight: '500', color: '#f87171', marginTop: 2 }}>Belum terdaftar</ThemedText>
                </ThemedView>
            </ThemedView>
        </ThemedView>
    );
};

export default LocalProfile;