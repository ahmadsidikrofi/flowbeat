import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Notifikasi() {
    const router = useRouter();
    // 1. Gunakan state untuk menyimpan data notifikasi
    const [notifikasiList, setNotifikasiList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // 2. Gunakan useEffect untuk mengambil data dari API
    useEffect(() => {
        // Tentukan URL API
        const API_URL = 'http://192.168.18.210:3000/notifikasi';

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        fetch(API_URL, { signal: controller.signal })
            .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
            })
            .then(data => setNotifikasiList(data))
            .catch(err => console.error("Gagal mengambil notifikasi:", err))
            .finally(() => setIsLoading(false));

        return () => clearTimeout(timeout);
    }, []); // Array kosong berarti efek ini hanya dijalankan sekali setelah render pertama

    // --- Komponen Pemuatan (Loading) ---
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Memuat notifikasi...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
        {/* Judul Halaman */}
        <Text style={styles.header}>NOTIFIKASI</Text>

        {/* Daftar Notifikasi */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
            {notifikasiList.map((item) => (
            <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDate}>{item.date}</Text>
                </View>
                <Text style={styles.cardContent}>{item.pesan}</Text>
            </View>
            ))}
        </ScrollView>

        {/* Tombol Navigasi Kembali */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/home')}>
            <Ionicons name="arrow-back" size={20} color="white" style={{ marginRight: 5 }} />
            <Text style={styles.backText}>KEMBALI</Text>
        </TouchableOpacity>
        </View>
    );
    }

    const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#F9FAFB',
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 20,
        color: '#111827',
    },
    scrollContent: {
        paddingBottom: 80, // supaya tidak ketutupan tombol kembali
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3, // efek shadow di Android
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    cardDate: {
        fontSize: 12,
        color: '#6B7280',
    },
    cardContent: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
    },
    backButton: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3B82F6',
        paddingVertical: 15,
        borderRadius: 8,
        paddingHorizontal: 108,
        position: 'absolute',
        bottom: 20,
        left: 16,
        right: 16,
    },
    backText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
