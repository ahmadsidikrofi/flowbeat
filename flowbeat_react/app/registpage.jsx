import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // Asumsi Anda menggunakan Expo Router
import { register } from '../services/api/register';

const PRIMARY_COLOR = '#3B82F6'; // Warna biru utama

export default function RegistPage() {
    const router = useRouter();
    
    // State untuk semua input
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [address, setAddress] = useState('');
    
    // State untuk visibility password
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleRegister = async () => {
        if (!fullName || !phone || !password || !confirmPassword || !address) {
            Alert.alert('Gagal Daftar', 'Semua kolom wajib diisi.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Gagal Daftar', 'Kata sandi dan konfirmasi tidak sama.');
            return;
        }

        try {
            const res = await register(fullName, phone, password, address, 'default-avatar-profile.jpg');
            Alert.alert('Berhasil', res.message || 'Akun berhasil dibuat!');
            router.replace('/loginpage');
        } catch (err) {
            Alert.alert('Gagal', 'Terjadi kesalahan saat mendaftar.');
    }};


    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <Text style={styles.logo}>FlowBeat</Text>
                <Text style={styles.title}>Buat Akun</Text>

                {/* 1. Nama Lengkap */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Nama Lengkap"
                        placeholderTextColor="#B0B0B0"
                        onChangeText={setFullName}
                        value={fullName}
                    />
                </View>

                {/* 2. Nomor Handphone */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Nomor Handphone"
                        placeholderTextColor="#B0B0B0"
                        keyboardType="phone-pad"
                        onChangeText={setPhone}
                        value={phone}
                        maxLength={15}
                    />
                </View>

                {/* 3. Kata Sandi */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Kata Sandi"
                        placeholderTextColor="#B0B0B0"
                        secureTextEntry={!showPassword}
                        onChangeText={setPassword}
                        value={password}
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
                
                {/* 4. Konfirmasi Kata Sandi */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Konfirmasi Kata Sandi"
                        placeholderTextColor="#B0B0B0"
                        secureTextEntry={!showConfirmPassword}
                        onChangeText={setConfirmPassword}
                        value={confirmPassword}
                    />
                    <TouchableOpacity 
                        style={styles.eyeIcon} 
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        <Ionicons 
                            name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                            size={24} 
                            color="#B0B0B0" 
                        />
                    </TouchableOpacity>
                </View>

                {/* 5. Alamat (Multi-line) */}
                <View style={[styles.inputContainer, styles.addressInputContainer]}>
                    <TextInput
                        style={styles.addressInput}
                        placeholder="Alamat"
                        placeholderTextColor="#B0B0B0"
                        onChangeText={setAddress}
                        value={address}
                        multiline={true}
                        numberOfLines={4}
                    />
                </View>
                
                {/* Tombol Daftar */}
                <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
                {/* <TouchableOpacity style={styles.registerButton} onPress={()=>router.push('/home')}> */}
                    <Text style={styles.registerButtonText}>DAFTAR</Text>
                </TouchableOpacity>

                {/* Tombol Kembali */}
                <TouchableOpacity style={styles.backButton} onPress={() => router.push('/firstpage')}>
                {/* <TouchableOpacity style={styles.backButton} onPress={() => router.back()}> */}
                    <Ionicons name="arrow-back" size={20} color="white" style={{ marginRight: 8 }} />
                    <Text style={styles.backButtonText}>KEMBALI</Text>
                </TouchableOpacity>

            </ScrollView>
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
        paddingTop: 20, 
        alignItems: 'center',
    },
    logo: {
        fontSize: 32,
        fontWeight: '900',
        color: '#111827',
        marginBottom: 30,
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
    addressInputContainer: {
        height: 120, // Tinggi lebih besar untuk textarea
        alignItems: 'flex-start',
        paddingVertical: 15,
    },
    addressInput: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
        textAlignVertical: 'top', // Penting agar teks mulai dari atas
        width: '100%',
    },
    eyeIcon: {
        padding: 5,
    },
    registerButton: {
        backgroundColor: PRIMARY_COLOR,
        borderRadius: 10,
        width: '100%',
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 15,
        elevation: 5,
    },
    registerButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: PRIMARY_COLOR,
        borderRadius: 10,
        width: '100%',
        paddingVertical: 15,
        elevation: 5,
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});