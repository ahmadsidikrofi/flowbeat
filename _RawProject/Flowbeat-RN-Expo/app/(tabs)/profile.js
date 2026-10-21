import { SafeAreaView, ScrollView, Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { ThemedText } from '../../components/ui/ThemedText';
import { ThemedView } from '../../components/ui/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from "../../utils/AuthProvider";
import { hitungUmur, formatTanggal } from "../../utils/dateHelpers";
import CreateAccount from "../../components/UserProfile/CreateAccount";

const ProfileScreen = () => {
    const { currentProfile, selectProfile, logout } = useAppContext();

    return (
        <ThemedView style={{ flex: 1 }}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Current Profile Info */}
                {currentProfile && (
                    <ThemedView style={styles.profileSection}>
                        <ThemedText style={styles.sectionTitle}>Profil Aktif</ThemedText>
                        <ThemedView style={styles.profileInfo}>
                            <ThemedText style={styles.profileName}>{currentProfile.name}</ThemedText>
                            <ThemedText style={styles.profileDetail}>
                                {currentProfile.gender} • {currentProfile.tanggal_lahir ? `${hitungUmur(currentProfile.tanggal_lahir)} tahun (${formatTanggal(currentProfile.tanggal_lahir)})` : `${currentProfile.umur} tahun`}
                            </ThemedText>
                            <ThemedText style={styles.profileDetail}>
                                TB: {currentProfile.tinggi_badan} cm • BB: {currentProfile.berat_badan} kg
                            </ThemedText>
                        </ThemedView>
                        <TouchableOpacity
                            style={styles.switchButton}
                            onPress={() => selectProfile(null)}
                        >
                            <Ionicons name="swap-horizontal-outline" size={20} color="#38bdf8" />
                            <ThemedText style={styles.switchButtonText}>Ganti Profil</ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                )}

                <CreateAccount />
            </ScrollView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    profileSection: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#38bdf8', // Vibrant sky blue for high visibility on dark theme
        marginBottom: 12,
    },
    profileInfo: {
        marginBottom: 14,
    },
    profileName: {
        fontSize: 24,
        fontWeight: '800',
        color: '#f8fafc', // Bright white text
        marginBottom: 4,
    },
    profileDetail: {
        fontSize: 15,
        color: '#cbd5e1', // Light slate gray text
        marginTop: 4,
        fontWeight: '500',
    },
    switchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderWidth: 1.5,
        borderColor: '#0ea5e9',
        backgroundColor: '#0f172a',
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    switchButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#38bdf8',
    },
});

export default ProfileScreen;