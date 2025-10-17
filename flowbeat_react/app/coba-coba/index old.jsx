
import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Linking, SafeAreaView } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Stack } from 'expo-router'; // Gunakan Stack dari expo-router

const Header = () => (
  // Di sini, Anda perlu mengarahkan navigasi menggunakan Expo Router
  <TouchableOpacity onPress={() => console.log('Tombol navigasi ditekan')}>
    <View style={styles.headerContainer}>
      <Image
        source={{ uri: 'https://i.pravatar.cc/150?img=68' }}
        style={styles.profileImage}
      />
      <Text style={styles.headerText}>Halo, Hidayat Taufiq</Text>
    </View>
  </TouchableOpacity>
);

const HealthCard = ({ icon, title, value, unit, status, color }) => (
  <TouchableOpacity style={[styles.healthCard, { backgroundColor: color }]}>
    <View style={styles.cardContent}>
      <View style={styles.cardInfo}>
        {icon}
        <Text style={styles.cardTitle}>{title}</Text>
        <View style={styles.valueContainer}>
          <Text style={styles.valueText}>{value}</Text>
          <Text style={styles.unitText}>{unit}</Text>
        </View>
        <View style={styles.statusLabel}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>
      <Ionicons name="arrow-forward-sharp" size={24} color="#555" />
    </View>
  </TouchableOpacity>
);

const EmergencyCallCard = () => (
  <TouchableOpacity onPress={() => Linking.openURL('tel:112')} style={[styles.emergencyCard]}>
    <View style={styles.emergencyContent}>
      <Ionicons name="call" size={36} color="#fff" style={styles.emergencyIcon} />
      <View style={styles.emergencyInfo}>
        <Text style={styles.emergencyNumber}>112</Text>
        <Text style={styles.emergencyText}>Panggilan Darurat</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const BottomNav = () => {
    // Navigasi menggunakan Expo Router tidak memerlukan prop "navigation"
    // Anda bisa menggunakan hook "useRouter" atau komponen <Link>
    return (
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => console.log('Riwayat ditap')} style={styles.navItem}>
          <Ionicons name="list-outline" size={24} color="#555" />
          <Text style={styles.navText}>RIWAYAT</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => console.log('Tombol akun ditap')} style={styles.navItem}>
          <Ionicons name="person-outline" size={24} color="#555" />
          <Text style={styles.navText}>AKUN</Text>
        </TouchableOpacity>
      </View>
    );
};

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Jika Anda ingin menggunakan header khusus dari Expo Router, Anda bisa gunakan <Stack.Screen /> */}
      <Stack.Screen options={{ headerShown: false }} />
      <Header />
      <View style={styles.mainContent}>
        <HealthCard
          icon={<Ionicons name="heart-outline" size={32} color="#555" />}
          title="Detak Jantung"
          value="77"
          unit="BPM"
          status="Normal"
          color="#e0eaff"
        />
        <HealthCard
          icon={<FontAwesome5 name="wind" size={28} color="#555" />}
          title="Oksigen Tubuh"
          value="98"
          unit="%"
          status="Normal"
          color="#e0eaff"
        />
        <EmergencyCallCard />
      </View>
      <BottomNav />
    </SafeAreaView>
  );
}

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
    color: '#1e7e34',
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
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#f8f8f8',
    marginBottom: 10, // Tambahkan margin bawah
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
  },
});

// import { StyleSheet, Text, View, Image } from 'react-native'
// import React from 'react'
// import Logo from '../assets/img/LogoFRI.png'
// import { Link } from 'expo-router'

// const Home = () => {
//   return (
//     <View style={styles.container}>
//         <Image source={Logo} style={styles.img}/>
        
//       <Text style={[styles.title, {color: 'purple'}]}>Bismillah</Text>
//       <Text style={{ marginTop:10, marginBottom:30 }}>Alhamdulillah</Text>
//       <View style={styles.card}>
//         <Text>
//             Opening
//         </Text>
//       </View>
//         <Link href={'/about'} style={styles.link}>About Page</Link>
//         <Link href={'/detail'} style={styles.link}>Detail Page</Link>
//     </View>
//   )
// }

// export default Home

// const styles = StyleSheet.create({
//     container:{
//         flex:1,
//         alignItems:'center',
//         justifyContent:'center',

//     },
//     title:{
//         fontWeight: 'bold',
//         fontSize:18
//     },
//     img:{
//         marginVertical:20,
//         width: 100, // Atur lebar dalam piksel
//         height: 100, // Atur tinggi dalam piksel
//         resizeMode: 'contain',
//     },
//     card:{
//         backgroundColor:'#eee',
//         padding:20,
//         borderRadius:5,
//         boxShadow:'4px 4px rgba(0,0,0,0.1)',
//         elevation: 4,
//     },
//     link:{
//         marginVertical:10,
//         borderBottomWidth:1
//     },
// })