import { ThemedText } from '../ui/ThemedText';
import { ThemedView } from '../ui/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, TouchableOpacity } from 'react-native';
import SignUp from './SignUp';
import SignIn from './SignIn';

const AuthIntro = ({ setAuthModal }) => {
    const [ signUpModal, setSignUpModal ] = useState(false)
    const [ signInModal, setSignInModal ] = useState(false)
    return (
        <ScrollView>
            <ThemedView style={{ padding: 10, flex: 1 }}>
                <ThemedView style={{ marginTop: 20 }}>
                    <Pressable onPress={() => setAuthModal(false)}>
                        <ThemedText style={{ padding: 4 }}><Ionicons size={25} name='arrow-back' /></ThemedText>
                    </Pressable>
                </ThemedView>
                <ThemedText style={{ fontWeight: '600', fontSize: 25, textAlign: 'center', marginVertical: 25 }}>Mulai Berhubungan</ThemedText>
                <ThemedView style={{ flexDirection: 'col', alignItems: 'center', marginTop: 30, marginBottom: 50 }}>
                    <Image source={require('../../assets/images/authIntro.png')} style={{ width: 300, height: 300 }} />
                    <ThemedView style={{ flexDirection: 'col', alignItems: 'flex-start', paddingHorizontal: 40 }}>
                        <ThemedView style={{ flexDirection: 'row', gap: 10 }}>
                            <Ionicons size={25} name="checkmark-circle-outline" color="#2563eb"></Ionicons>
                            <ThemedText style={{ marginBottom: 10, textAlign: 'justify', lineHeight: 30 }}>Bisa lihat riwayat tekanan darah kapan saja, biar lebih gampang kalau ada perubahan kesehatan.</ThemedText>
                        </ThemedView>
                        <ThemedView style={{ flexDirection: 'row', gap: 10 }}>
                            <Ionicons size={25} name="checkmark-circle-outline" color="#2563eb"></Ionicons>
                            <ThemedText style={{ marginBottom: 10, textAlign: 'justify', lineHeight: 30 }}>Ada pengingat otomatis supaya tidak lupa cek tekanan darah secara rutin.</ThemedText>
                        </ThemedView>
                        <ThemedView style={{ flexDirection: 'row', gap: 10 }}>
                            <Ionicons size={25} name="checkmark-circle-outline" color="#2563eb"></Ionicons>
                            <ThemedText style={{ lineHeight: 30 }}>Data bisa langsung dilihat dokter, jadi lebih mudah buat mereka memantau kesehatan kamu.</ThemedText>
                        </ThemedView>
                    </ThemedView>
                </ThemedView>
                <ThemedView style={{ alignItems: 'center', marginTop: "auto", flexDirection: 'col', gap: 10, paddingBottom: 20  }}>
                    <TouchableOpacity onPress={() => setSignInModal(true)}  style={{ padding: 10, width: 250, borderRadius: 15, borderWidth: 0.3, elevation: 5, backgroundColor: '#fff' }}>
                        <ThemedText style={{ textAlign: 'center', fontWeight: '500' }}>Sign In</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setSignUpModal(true)}  style={{ padding: 10, width: 250, borderRadius: 15, elevation: 5, backgroundColor: '#2563eb' }}>
                        <ThemedText style={{ textAlign: 'center', color: '#fff', fontWeight: '500' }}>Pertama kali?</ThemedText>
                    </TouchableOpacity>
                </ThemedView>
                <Modal
                    animationType='slide'
                    transparent={false}
                    visible={signUpModal}
                    onRequestClose={() => {
                        setSignUpModal(!signUpModal)
                    }}
                >
                    <SignUp setSignUpModal={setSignUpModal} setSignInModal={setSignInModal} />
                </Modal>
                <Modal
                    animationType='slide'
                    transparent={false}
                    visible={signInModal}
                    onRequestClose={() => {
                        setSignInModal(!signInModal)
                    }}
                >
                    <SignIn setSignInModal={setSignInModal} setAuthModal={setAuthModal}/>
                </Modal>
            </ThemedView>
        </ScrollView>
    );
}
 
export default AuthIntro;