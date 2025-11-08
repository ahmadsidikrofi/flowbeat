import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; 
import ProtectedRoute from '../components/ProtectedRoute';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EXPO_PUBLIC_API_URL } from '@env';

const API_URL = EXPO_PUBLIC_API_URL;


export default function Home() {
    const router = useRouter(); // Dapatkan hook useRouter di sini
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (!token) {
                    router.replace('/loginpage');
                    return;
                }

                const res = await fetch(`${API_URL}/api/home`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = await res.json();
                setUserData(data);
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    if (loading) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </SafeAreaView>
        );
    }

    if (!userData) {
        return (
            <SafeAreaView style={styles.centered}>
                <Text>Gagal memuat data pengguna</Text>
            </SafeAreaView>
        );
    }

    const { name, photo, bpm, spo2 } = userData;
    const profilePhoto = photo && photo !== 'default-avatar-profile.jpg'
    ? { uri: `${API_URL}/${photo}` }
    : require('../assets/img/default-avatar-profile.jpg');
    // console.log('data:',userData)
    // console.log('Profile photo URL:', `${API_URL}/${photo}`);

        // Logika status kesehatan
    const bpmStatus =
        bpm === null
            ? 'Tidak Ada Data'
            : bpm < 60 || bpm > 100
            ? 'Tidak Normal'
            : 'Normal';

    const spo2Status =
        spo2 === null
            ? 'Tidak Ada Data'
            : spo2 < 90
            ? 'Tidak Normal'
            : 'Normal';


    return (
        <ProtectedRoute>
            <SafeAreaView style={styles.container}>
                {/* Teruskan 'router' sebagai prop */}
                
                {/* HEADER */}
                <TouchableOpacity onPress={() => router.push('/akun')}>
                    <View style={styles.headerContainer}>
                        <Image
                            source={profilePhoto}
                            style={styles.profileImage}
                        />
                        <Text style={styles.headerText}>Halo, {name}</Text>
                    </View>
                </TouchableOpacity>


                {/* DATA KESEHATAN */}
                <View style={styles.mainContent}>
                    <TouchableOpacity style={[styles.healthCard, { backgroundColor: "#e0eaff" }]}>
                        <View style={styles.cardContent}>
                            <View style={styles.cardInfo}>
                                <Ionicons name="heart-outline" size={32} color="#555" />
                                <Text style={styles.cardTitle}>Detak Jantung</Text>
                                <View style={styles.valueContainer}>
                                    <Text style={styles.valueText}>{bpm ?? '--'}</Text>
                                    <Text style={styles.unitText}>BPM</Text>
                                </View>
                                <View
                                    style={[
                                        styles.statusLabel,
                                        bpmStatus === 'Tidak Normal'
                                            ? { backgroundColor: '#FF9595' }
                                            : bpmStatus === 'Normal'
                                            ? { backgroundColor: '#7ae47fff' }
                                            : { backgroundColor: '#bdbdbd' },
                                    ]}
                                >
                                    <Text style={styles.statusText}>{bpmStatus}</Text>
                                </View>
                            </View>
                            <Ionicons name="arrow-forward-sharp" size={24} color="#555" />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.healthCard, { backgroundColor: "#e0eaff" }]}>
                        <View style={styles.cardContent}>
                            <View style={styles.cardInfo}>
                                <FontAwesome5 name="wind" size={28} color="#555" />
                                <Text style={styles.cardTitle}>Oksigen Tubuh</Text>
                                <View style={styles.valueContainer}>
                                    <Text style={styles.valueText}>{spo2 ?? '--'}</Text>
                                    <Text style={styles.unitText}>%</Text>
                                </View>
                                <View
                                    style={[
                                        styles.statusLabel,
                                        spo2Status === 'Tidak Normal'
                                            ? { backgroundColor: '#FF9595' }
                                            : spo2Status === 'Normal'
                                            ? { backgroundColor: '#7ae47fff' }
                                            : { backgroundColor: '#bdbdbd' },
                                    ]}
                                >
                                    <Text style={styles.statusText}>{spo2Status}</Text>
                                </View>
                            </View>
                            <Ionicons name="arrow-forward-sharp" size={24} color="#555" />
                        </View>
                    </TouchableOpacity>

                    {/* PANGGILAN DARURAT */}
                    <TouchableOpacity onPress={() => Linking.openURL('tel:112')} style={[styles.emergencyCard]}>
                        <View style={styles.emergencyContent}>
                            <Ionicons name="call" size={36} color="#fff" style={styles.emergencyIcon} />
                            <View style={styles.emergencyInfo}>
                                <Text style={styles.emergencyNumber}>112</Text>
                                <Text style={styles.emergencyText}>Panggilan Darurat</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* NAVIGASI BAWAH */}
                    <View style={styles.bottomNav}>
                        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/notifikasi')}>
                            <Icon name="notifications-outline" size={20} color="#fff" />
                            <Text style={styles.navText}>NOTIFIKASI</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/akun')}>
                            <Icon name="person-outline" size={20} color="#fff" />
                            <Text style={styles.navText}>AKUN</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </ProtectedRoute>
        
    )
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginTop: 20, // Tambahkan margin atas
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 15,
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    mainContent: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    healthCard: {
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardInfo: {
        flexDirection: 'column',
    },
    cardTitle: {
        fontSize: 16,
        color: '#555',
    },
    valueContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginTop: 5,
    },
    valueText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#333',
    },
    unitText: {
        fontSize: 24,
        color: '#555',
        marginLeft: 5,
        marginBottom: 5,
    },
    statusLabel: {
        backgroundColor: '#d3f9d3',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginTop: 10,
        alignSelf: 'flex-start',
    },
    statusText: {
        color: '#000000',
        fontWeight: 'bold',
        fontSize: 12,
    },
    emergencyCard: {
        backgroundColor: '#ff9999',
        borderRadius: 15,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    emergencyContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    emergencyIcon: {
        marginRight: 15,
    },
    emergencyInfo: {
        flexDirection: 'column',
    },
    emergencyNumber: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    emergencyText: {
        fontSize: 16,
        color: '#fff',
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 'auto',
    },
    navButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3B82F6',
        width: 150,           // lebar 50px
        height: 50,
        padding: 4,          // padding semua sisi 4px
        borderRadius: 14,
        marginBottom: 8,     // jarak bawah 8px
        justifyContent: 'center', // biar isi tombol center
    },
    navText: {
        marginLeft: 6,
        color: '#fff',
        fontWeight: 'bold',
    },
});