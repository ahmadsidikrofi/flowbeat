import React, { useEffect, useState } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    TouchableOpacity, 
    ActivityIndicator, 
    StyleSheet 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { EXPO_PUBLIC_API_URL } from '@env';

const API_URL = EXPO_PUBLIC_API_URL;

export default function DetailKesehatan() {
    const [riwayat, setRiwayat] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetch(`${API_URL}/api/kesehatan`)
        .then(res => res.json())
        .then(data => {
            setRiwayat(data);
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
        </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>RIWAYAT KESEHATAN</Text>

            {/* Header Tabel */}
            <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, { flex: 2 }]}>Tanggal</Text>
                <Text style={styles.headerCell}>Detak Jantung</Text>
                <Text style={styles.headerCell}>Oksigen Tubuh</Text>
            </View>

            {/* Scrollable data */}
            <ScrollView style={styles.scrollContainer}>
                {riwayat.map((item, index) => {
                    const highHeart = item.detak_jantung !== '-' && item.detak_jantung > 100;
                    const lowSpO2 = item.spo2 !== '-' && item.spo2 < 90;

                    return (
                        <View key={index} style={styles.row}>
                        <Text style={[styles.cell, { flex: 2 }]}>{item.tanggal}</Text>

                        <Text style={[styles.cell, highHeart ? styles.danger : null]}>
                            {item.detak_jantung}
                        </Text>

                        <Text style={[styles.cell, lowSpO2 ? styles.danger : null]}>
                            {item.spo2}
                        </Text>
                        </View>
                    );
                    })}
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
        backgroundColor: '#FFFFFF',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 20,
        color: '#111827',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#E5E7EB',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#D1D5DB',
        paddingVertical: 8,
    },
    headerCell: {
        flex: 1,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    scrollContainer: {
        flex: 1,
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#E5E7EB',
        paddingVertical: 10,
    },
    cell: {
        flex: 1,
        textAlign: 'center',
        fontSize: 14,
    },
    danger: {
        backgroundColor: '#FF9595',
        borderRadius: 4,
        paddingVertical: 4,
    },
    button: {
        backgroundColor: '#3B82F6',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
