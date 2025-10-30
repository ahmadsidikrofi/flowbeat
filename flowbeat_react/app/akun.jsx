import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { TouchableOpacity, Text, View, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProtectedRoute from '../components/ProtectedRoute';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EXPO_PUBLIC_API_URL } from '@env';

const API_URL = EXPO_PUBLIC_API_URL;

export default function Akun() {
  const router = useRouter();
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

                const res = await fetch(`${API_URL}/api/akun`, {
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

    const { name, photo, phone_number, address } = userData;
    const profilePhoto = photo && photo !== 'default-avatar-profile.jpg'
    ? { uri: `${API_URL}/${photo}` }
    : require('../assets/img/default-avatar-profile.jpg');


  //UNTUK LOGOUT
  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    router.replace('/firstpage');
  };

  return (
    <ProtectedRoute>
      <View style={styles.container}>
        {/* Judul Halaman */}
        <Text style={styles.title}>AKUN</Text>

        {/* Foto Profil */}
        <Image
            // source={{ uri: "https://i.ibb.co/XFfq1zj/old-man-smile.jpg" }}
            source={profilePhoto}
            style={styles.profileImage}
        />

        {/* Informasi Pengguna */}
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.info}>{phone_number}</Text>
        <Text style={styles.info}>
            {address}
        </Text>

        {/* Tombol Aksi Utama */}
        <TouchableOpacity style={styles.updateButton} onPress={() => router.push('/editprofile')}>
            <Text style={styles.buttonText}>PERBARUI AKUN</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.buttonText}>KELUAR AKUN</Text>
        </TouchableOpacity>

        {/* Tombol Navigasi Kembali */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/home')}>
          <Ionicons name="arrow-back" size={20} color="white" style={{ marginRight: 5 }} />
          <Text style={styles.backText}>KEMBALI</Text>
        </TouchableOpacity>
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  info: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 5,
  },
  updateButton: {
    marginTop: 30,
    backgroundColor: "#ECA100", // kuning emas
    paddingVertical: 15,
    paddingHorizontal: 90,
    borderRadius: 8,
    marginBottom: 15,
  },
  logoutButton: {
    backgroundColor: "#D32F2F", // merah
    paddingVertical: 15,
    paddingHorizontal: 98,
    borderRadius: 8,
    marginBottom: 40,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  backButton: {
    marginTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 15,
    borderRadius: 8,
    paddingHorizontal: 108,
  },
  backText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});