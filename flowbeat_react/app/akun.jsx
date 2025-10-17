import { useRouter } from 'expo-router';
import { TouchableOpacity, Text, View, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Akun() {
  const router = useRouter();
    return (
        <View style={styles.container}>
          {/* Judul Halaman */}
          <Text style={styles.title}>AKUN</Text>

          {/* Foto Profil */}
          <Image
              // source={{ uri: "https://i.ibb.co/XFfq1zj/old-man-smile.jpg" }}
              source={require("../assets/img/profil1.jpg")}
              style={styles.profileImage}
          />

          {/* Informasi Pengguna */}
          <Text style={styles.name}>HIDAYAT TAUFIQ</Text>
          <Text style={styles.info}>08123456789</Text>
          <Text style={styles.info}>
              Jl. Soekarno, no 12, Jakarta Pusat, Kebayoran lama
          </Text>

          {/* Tombol Aksi Utama */}
          <TouchableOpacity style={styles.updateButton}>
              <Text style={styles.buttonText}>PERBARUI AKUN</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton}>
              <Text style={styles.buttonText}>KELUAR AKUN</Text>
          </TouchableOpacity>

          {/* Tombol Navigasi Kembali */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
            <Ionicons name="arrow-back" size={20} color="white" style={{ marginRight: 5 }} />
            <Text style={styles.backText}>KEMBALI</Text>
          </TouchableOpacity>
        </View>
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