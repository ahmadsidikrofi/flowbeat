import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function FirstPage() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Judul */}
      <Text style={styles.title}>FlowBeat</Text>

      {/* Ilustrasi */}
      <Image
        source={require('../assets/img/nurse1.png')} // pastikan file ini ada di folder assets/img/
        style={styles.illustration}
        resizeMode="contain"
      />

      {/* Tombol Aksi */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push('/home')}
        >
          <Text style={styles.loginText}>MASUK</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signupButton}
          onPress={() => router.push('/akun')}
        >
          <Text style={styles.signupText}>BUAT AKUN</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 40,
  },
  illustration: {
    width: '90%',
    height: 280,
    marginBottom: 60,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderWidth: 2,
    borderColor: '#5A7DFE',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5A7DFE',
  },
  signupButton: {
    width: '100%',
    backgroundColor: '#5A7DFE',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  signupText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
