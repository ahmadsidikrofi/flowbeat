import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function ProtectedRoute({ children }) {
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
            router.replace('/loginpage'); // kalau tidak ada token, kembali ke login
        }
        setLoading(false);
        };
        checkAuth();
    }, []);

    if (loading) {
        return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#007AFF" />
        </View>
        );
    }

  return children; // kalau token ada → render halaman anaknya
}