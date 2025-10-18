import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { login } from '../services/api/login.jsx'; // file di atas

export default function LoginScreen() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
        const data = await login(phone, password);
        Alert.alert('Berhasil Login', `Selamat datang ${data.user.name}`);
        } catch (err) {
        Alert.alert('Gagal', 'Nomor atau password salah');
        }
    };

    return (
        <View>
        <TextInput placeholder="Nomor HP" onChangeText={setPhone} />
        <TextInput placeholder="Password" secureTextEntry onChangeText={setPassword} />
        <Button title="MASUK" onPress={handleLogin} />
        </View>
    );
}
