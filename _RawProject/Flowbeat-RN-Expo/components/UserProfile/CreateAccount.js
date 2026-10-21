import { ThemedText } from '../../components/ui/ThemedText';
import { ThemedView } from '../../components/ui/ThemedView';
import { useAppContext } from '../../utils/AuthProvider';

const CreateAccount = () => {
    const { currentUser, logout } = useAppContext();
    return (
        <ThemedView style={{ padding: 16 }}>
            {currentUser ? (
                <>
                    <ThemedText style={{ fontSize: 16, fontWeight: '700', color: '#f87171' }}>
                        FlowBeat Account
                    </ThemedText>
                    
                    <ThemedView style={{ marginTop: 18 }}>
                        <ThemedText style={{ fontSize: 16, fontWeight: '600', color: '#f8fafc' }}>
                            Nama lengkap
                        </ThemedText>
                        <ThemedText style={{ fontSize: 16, fontWeight: '500', color: '#cbd5e1', marginTop: 4 }}>
                            {currentUser?.name}
                        </ThemedText>
                    </ThemedView>

                    <ThemedView style={{ marginVertical: 18 }}>
                        <ThemedText style={{ fontSize: 16, fontWeight: '600', color: '#f8fafc' }}>
                            Email
                        </ThemedText>
                        <ThemedText style={{ fontSize: 16, fontWeight: '500', color: '#cbd5e1', marginTop: 4 }}>
                            {currentUser?.email || '-'}
                        </ThemedText>
                    </ThemedView>

                    <ThemedView style={{ height: 1, width: '100%', backgroundColor: '#334155', marginVertical: 12 }} />

                    <ThemedView style={{ flexDirection: 'column', gap: 20, marginVertical: 8 }}>
                        <ThemedText onPress={logout} style={{ fontSize: 16, fontWeight: '700', color: '#f87171' }}>
                            Keluar
                        </ThemedText>
                    </ThemedView>

                    <ThemedView style={{ height: 1, width: '100%', backgroundColor: '#334155', marginVertical: 12 }} />
                </>
            ) : (
                <>
                    <ThemedText style={{ fontSize: 16, fontWeight: '600', color: '#f8fafc' }}>
                        Belum login
                    </ThemedText>
                </>
            )}
        </ThemedView>
    );
};

export default CreateAccount;