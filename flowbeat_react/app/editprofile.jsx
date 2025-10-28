import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

export default function EditProfile() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [photo, setPhoto] = useState(null);

    const pickPhoto = async () => {
        // Request permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (status !== 'granted') {
            Alert.alert('Izin Ditolak', 'Aplikasi membutuhkan izin akses galeri untuk memilih foto.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'], // ✅ CARA BARU (v17+)
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setPhoto(result.assets[0].uri);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
        <Text style={styles.title}>FlowBeat</Text>
        <Text style={styles.subtitle}>Perbarui Akun</Text>

        <TextInput style={styles.input} placeholder="Nama Lengkap" placeholderTextColor="#666" />
        <TextInput style={styles.input} placeholder="Nomor Handphone" keyboardType="phone-pad" placeholderTextColor="#666" />

        {/* Password */}
        <View style={styles.passwordContainer}>
            <TextInput
            style={styles.passwordInput}
            placeholder="Kata Sandi"
            secureTextEntry={!showPassword}
            placeholderTextColor="#666"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Icon name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#777" />
            </TouchableOpacity>
        </View>

        {/* Konfirmasi Password */}
        <View style={styles.passwordContainer}>
            <TextInput
            style={styles.passwordInput}
            placeholder="Konfirmasi Kata Sandi"
            secureTextEntry={!showConfirmPassword}
            placeholderTextColor="#666"
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Icon name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#777" />
            </TouchableOpacity>
        </View>

        <TextInput
            style={[styles.input, { height: 70, textAlignVertical: "top" }]}
            placeholder="Alamat"
            multiline
            placeholderTextColor="#666"
        />

        {/* Ganti Foto */}
        <TouchableOpacity style={styles.input} onPress={pickPhoto}>
            <Text style={{ color: "#666" }}>{photo ? "Foto Dipilih ✅" : "Ubah Foto Profil"}</Text>
        </TouchableOpacity>

        {photo && <Image source={{ uri: photo }} style={styles.previewImage} />}

        <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveButtonText}>SIMPAN PERUBAHAN</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Icon name="arrow-back-outline" size={20} color="#fff" />
            <Text style={styles.backButtonText}>KEMBALI</Text>
        </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 25,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        color: "#000",
    },
    subtitle: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        marginVertical: 20,
        color: "#000",
    },
    input: {
        backgroundColor: "#E6E6E6",
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 15,
        color: "#333",
    },
    passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#E6E6E6",
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
    },
    passwordInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 12,
        color: "#333",
    },
    saveButton: {
        backgroundColor: "#ECA100",
        borderRadius: 8,
        paddingVertical: 15,
        alignItems: "center",
        marginTop: 10,
    },
    saveButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    backButton: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#3B82F6",
        borderRadius: 8,
        paddingVertical: 15,
        marginTop: 10,
    },
    backButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 6,
    },
    previewImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignSelf: "center",
        marginBottom: 10,
    },
});
