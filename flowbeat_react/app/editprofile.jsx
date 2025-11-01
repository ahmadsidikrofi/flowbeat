import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProtectedRoute from '../components/ProtectedRoute';
import { EXPO_PUBLIC_API_URL } from "@env";

const API_URL = EXPO_PUBLIC_API_URL;

export default function EditProfile() {
    const router = useRouter();
    const [photo, setPhoto] = useState(null);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Ambil data user yang sedang login
    useEffect(() => {
        const fetchData = async () => {
        setLoading(true);
        const token = await AsyncStorage.getItem("token");

        const res = await fetch(`${API_URL}/api/akun`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data) {
            setName(data.name || "");
            setPhone(data.phone_number || "");
            setAddress(data.address || "");
            if (data.photo) {
            setPhoto(`${API_URL}/${data.photo}`);
            }
        }
        setLoading(false);
        };
        fetchData();
    }, []);

    const pickPhoto = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
        Alert.alert("Izin Ditolak", "Aplikasi membutuhkan izin akses galeri untuk memilih foto.");
        return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        });

        if (!result.canceled) {
        setPhoto(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        try {
        setLoading(true);
        const token = await AsyncStorage.getItem("token");

        const formData = new FormData();
        formData.append("name", name);
        formData.append("phone_number", phone);
        formData.append("address", address);
        formData.append("password", password);
        if (photo && !photo.startsWith(API_URL)) {
            formData.append("photo", {
            uri: photo,
            name: "profile.jpg",
            type: "image/jpeg",
            });
        }

        const res = await fetch(`${API_URL}/api/edit-profile`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });

        const data = await res.json();
        if (res.ok) {
            Alert.alert("Sukses", "Profil berhasil diperbarui!");
            router.push("/home");
        } else {
            Alert.alert("Gagal", data.message || "Gagal memperbarui profil.");
        }
        } catch (err) {
        console.error(err);
        Alert.alert("Error", "Terjadi kesalahan saat menyimpan profil.");
        } finally {
        setLoading(false);
        }
    };

    if (loading) {
        return (
        <SafeAreaView style={styles.container}>
            <ActivityIndicator size="large" color="#3B82F6" />
        </SafeAreaView>
        );
    }

    return (
        <ProtectedRoute>
            <SafeAreaView style={styles.container}>
                <Text style={styles.title}>FlowBeat</Text>
                <Text style={styles.subtitle}>Perbarui Akun</Text>

                <TouchableOpacity onPress={pickPhoto}>
                    {photo ? (
                    <Image source={{ uri: photo }} style={styles.previewImage} />
                    ) : (
                    <View style={[styles.previewImage, { backgroundColor: "#ccc", justifyContent: "center", alignItems: "center" }]}>
                        <Text>Pilih Foto</Text>
                    </View>
                    )}
                </TouchableOpacity>

                <TextInput style={styles.input} placeholder="Nama Lengkap" value={name} onChangeText={setName} />
                <TextInput style={styles.input} placeholder="Nomor Handphone" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />

                <View style={styles.passwordContainer}>
                    <TextInput
                    style={styles.passwordInput}
                    placeholder="Kata Sandi Baru (opsional)"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Icon name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#777" />
                    </TouchableOpacity>
                </View>

                <TextInput
                    style={[styles.input, { height: 70, textAlignVertical: "top" }]}
                    placeholder="Alamat"
                    multiline
                    value={address}
                    onChangeText={setAddress}
                />

                {/* Ganti Foto */}
                {/* <TouchableOpacity style={styles.input} onPress={pickPhoto}>
                    <Text style={{ color: "#666" }}>{photo ? "Foto Dipilih ✅" : "Ubah Foto Profil"}</Text>
                </TouchableOpacity>

                {photo && <Image source={{ uri: photo }} style={styles.previewImage} />} */}

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>SIMPAN PERUBAHAN</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Icon name="arrow-back-outline" size={20} color="#fff" />
                    <Text style={styles.backButtonText}>KEMBALI</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </ProtectedRoute>
        
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
