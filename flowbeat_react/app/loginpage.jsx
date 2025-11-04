import React, { useState } from 'react';
import { 
    View, 
    TextInput, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    Alert, 
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { login } from '../services/api/login';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
    const router = useRouter();
    const [phone_number, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!phone_number.trim() || !password.trim()) {
            Alert.alert('Gagal Masuk', 'Nomor handphone dan kata sandi wajib diisi.');
            return;
        }
        
        try {
            const data = await login(phone_number, password);
            // console.log('Response login:', data);
            await AsyncStorage.setItem('token', data.token);
            await AsyncStorage.setItem('user', JSON.stringify(data.lansia));

            Alert.alert('Berhasil Login', `Selamat datang, ${data.lansia.name}!`);
            router.replace('/home');
        } catch (err) {
            Alert.alert('Gagal', 'Nomor Handphone atau Kata Sandi salah.');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                        <Text style={styles.logo}>FlowBeat</Text>
                        <Text style={styles.title}>Masuk</Text>

                        {/* Input Nomor Handphone */}
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Nomor Handphone"
                                placeholderTextColor="#B0B0B0"
                                keyboardType="phone-pad"
                                onChangeText={setPhone}
                                value={phone_number}
                                maxLength={15}
                                autoCapitalize="none"
                            />
                        </View>

                        {/* Input Kata Sandi */}
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Kata Sandi"
                                placeholderTextColor="#B0B0B0"
                                secureTextEntry={!showPassword}
                                onChangeText={setPassword}
                                value={password}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity 
                                style={styles.eyeIcon} 
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Ionicons 
                                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                                    size={24} 
                                    color="#B0B0B0" 
                                />
                            </TouchableOpacity>
                        </View>
                        
                        {/* Tombol Masuk */}
                        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                            <Text style={styles.loginButtonText}>MASUK</Text>
                        </TouchableOpacity>

                        {/* Lupa Password */}
                        {/* <TouchableOpacity onPress={() => console.log('Lupa password ditekan')}> */}
                        <TouchableOpacity onPress={() => router.push('/home')}>
                            <Text style={styles.forgotPassword}>Lupa password?</Text>
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        {/* Belum punya akun? */}
                        <Text style={styles.noAccountText}>Belum mempunyai akun?</Text>
                        
                        {/* Tombol Buat Akun */}
                        <TouchableOpacity style={styles.registerButton} onPress={() => router.push('/registpage')}>
                            <Text style={styles.registerButtonText}>BUAT AKUN</Text>
                        </TouchableOpacity>

                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        flexGrow: 1,
        paddingHorizontal: 30,
        paddingTop: 20, // Ruang atas
        alignItems: 'center',
    },
    logo: {
        fontSize: 32,
        fontWeight: '900',
        color: '#111827',
        marginBottom: 50,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 30,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 10,
        marginBottom: 20,
        width: '100%',
        height: 55,
        paddingHorizontal: 15,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
    },
    eyeIcon: {
        padding: 5,
    },
    loginButton: {
        backgroundColor: '#3B82F6', // Biru muda
        borderRadius: 10,
        width: '100%',
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
        elevation: 5,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    forgotPassword: {
        color: '#3B82F6',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 40,
        textDecorationLine: 'none', // Biasanya lupa password tidak bergaris bawah di mobile
    },
    noAccountText: {
        fontSize: 16,
        color: '#4B5563',
        marginBottom: 15,
    },
    registerButton: {
        borderColor: '#3B82F6',
        borderWidth: 2,
        borderRadius: 10,
        width: '100%',
        paddingVertical: 15,
        alignItems: 'center',
    },
    registerButtonText: {
        color: '#3B82F6',
        fontSize: 18,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        width: '100%',
        backgroundColor: '#E5E7EB',
        marginVertical: 40,
    }
});
