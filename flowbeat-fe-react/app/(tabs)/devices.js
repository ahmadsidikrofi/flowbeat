import { Modal, Pressable, SafeAreaView, ScrollView, TouchableOpacity, View } from "react-native";
import { ThemedText } from '../../components/ui/ThemedText';
import { ThemedView } from '../../components/ui/ThemedView';
import { Ionicons } from "@expo/vector-icons";
import DeviceCard from "../../components/DeviceCard";
import DeviceModal from "../../components/DeviceModal";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DevicesScreen = () => {
    const [modalVisible, setModalVisible] = useState(false)
    const [localDevice, setLocalDevice] = useState([])
    useEffect(() => {
        const getDevices = async () => {
            const devices = JSON.parse(await AsyncStorage.getItem('my-devices')) || []
            setLocalDevice(devices)
        }
        getDevices()
    }, [localDevice])
    return ( 
        <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: '#fff' }}>
            <SafeAreaView>
                <View>
                    <ThemedView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15 }}>
                        <ThemedText>My Devices</ThemedText>
                        <TouchableOpacity style={{ backgroundColor: '#fff', borderRadius: 50, borderWidth: 0.1, elevation: 1, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}
                            onPress={() => setModalVisible(true)}
                        >
                            <Ionicons size={28} name="add-circle" color="#D91656" />
                        </TouchableOpacity>
                    </ThemedView>
                    <DeviceCard localDevice={localDevice}/>
                    <ThemedView style={{ marginHorizontal: 20, marginVertical: 8, padding: 10,borderWidth: 0.1, borderRadius: 18, elevation: 1 }}>
                        <TouchableOpacity onPress={() => setModalVisible(true)} style={{ flexDirection: 'row', gap: 10, alignItems: 'center',  justifyContent: 'center' }}>
                            <ThemedText><Ionicons size={20} name="add-circle-outline" /></ThemedText>
                            <ThemedText>Add Device</ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                </View>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(!modalVisible);
                    }}>
                        <DeviceModal setModalVisible={setModalVisible}/>
                </Modal>
            </SafeAreaView>
        </ScrollView>
     );
}
 
export default DevicesScreen;