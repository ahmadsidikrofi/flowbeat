import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, TouchableOpacity } from 'react-native';
import AuthIntro from '../AuthComponent/AuthIntro';
import { useAuth } from '../../utils/AuthProvider';
const CreateAccount = () => {
    const [ authModal, setAuthModal ] = useState(false)
    const { userToken, signOut, user } = useAuth()
    return ( 
        <ThemedView style={{ padding: 15 }}>
            {userToken ? (
                <>
                    <ThemedText style={{ fontSize: 12, fontWeight: '400', color: '#ef4444' }}>Omblepy Account</ThemedText>
                    <ThemedView style={{ marginTop: 18 }}>
                        <ThemedText style={{ fontSize: 18, fontWeight: '400' }}>Nama lengkap</ThemedText>
                        <ThemedText style={{ fontSize: 12, fontWeight: '400', color: '#737373' }}>{user?.first_name} {user?.last_name}</ThemedText>
                    </ThemedView>
                    <ThemedView style={{ marginVertical: 18 }}>
                        <ThemedText style={{ fontSize: 18, fontWeight: '400' }}>Nomor handphone</ThemedText>
                        <ThemedText style={{ fontSize: 12, fontWeight: '400', color: '#737373' }}>{user?.phone_number}</ThemedText>
                    </ThemedView>
                    <ThemedView style={{ height: 0.5, width: '100%', backgroundColor: '#ddd', marginVertical: 10, elevation: 1 }}></ThemedView>
                    <ThemedView style={{ flexDirection: 'col', gap: 30 }}>
                        <TouchableOpacity onPress={signOut}><ThemedText style={{ fontSize: 18, fontWeight: '400', color: '#dc2626' }}>Keluar</ThemedText></TouchableOpacity>
                        <TouchableOpacity ><ThemedText style={{ fontSize: 18, fontWeight: '400', color: '#dc2626' }}>Hapus Akun</ThemedText></TouchableOpacity>
                    </ThemedView>
                    <ThemedView style={{ height: 0.5, width: '100%', backgroundColor: '#ddd', marginVertical: 10, elevation: 1 }}></ThemedView>
                </>
            ) : (
                <>
                    <ThemedText style={{ fontSize: 12, fontWeight: '400', marginBotton: 20 }}>Koneksikan Akunmu</ThemedText>
                    <ThemedView style={{ flexDirection: 'row', justifyContent: 'self-between', gap: 20 }}>
                        <TouchableOpacity style={{ backgroundColor: '#fff', padding: 8, borderWidth: 0.1, borderRadius: 10, elevation: 3 }} onPress={() => setAuthModal(true)}><ThemedText style={{ fontSize: 18, fontWeight: '400', color: '#000' }}>Create an Account</ThemedText></TouchableOpacity>
                        <ThemedView style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <Ionicons size={20} name='warning' color="#D91656" />
                        </ThemedView>
                    </ThemedView>
                </>
            )}
            <Modal
                animationType='slide'
                transparent={true}
                visible={authModal}
                onRequestClose={() => {
                    setAuthModal(!authModal)
                }}
            >
                <AuthIntro setAuthModal={setAuthModal}/>
            </Modal>
        </ThemedView>
    );
}
 
export default CreateAccount;