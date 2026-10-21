import { ThemedText } from '../components/ui/ThemedText';
import { ThemedView } from '../components/ui/ThemedView';
import { Ionicons } from "@expo/vector-icons";
import axios from 'axios';
import Config from '../utils/Config';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Vibration } from 'react-native';
import ConnectingModal from './ConnectingModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { SafeAreaView } from 'react-native-safe-area-context';

const DeviceModal = ({ setModalVisible }) => {
    const [isDeviceFound, setDeviceFound] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [deviceName, setDeviceName] = useState('')
    const maxRetries = 5
    const retryCountRef = useRef(0)
    const intervalRef = useRef(null)
    const [modalConnectingDevice, setModalConnectingDevice] = useState(false)

    useEffect(() => {
        const scanDevice = async () => {
            try {
                console.log(`Scanning Device... (attempt ${retryCountRef.current + 1}/${maxRetries})`)
                const res = await axios.get(`${Config.BASE_URL}/scan`)
                const devices = res.data?.devices || []
                console.log(`Found ${devices.length} BLE devices total`)

                // Gunakan optional chaining agar tidak crash jika device.name null/undefined
                const targetDevice = devices.find((device) => device?.name && device.name.includes('BLESmart'))

                if (targetDevice) {
                    console.log("Found target device:", targetDevice)
                    setDeviceFound(true)
                    setDeviceName(targetDevice.name || Config.DEVICE_NAME)

                    // Simpan device ke AsyncStorage
                    const getStoredDevices = await AsyncStorage.getItem('my-devices')
                    const parsedDevices = getStoredDevices ? JSON.parse(getStoredDevices) : []
                    const syncDevice = { ...targetDevice, lastSync: Date.now() }
                    parsedDevices.push(syncDevice)
                    await AsyncStorage.setItem('my-devices', JSON.stringify(parsedDevices))

                    clearInterval(intervalRef.current)
                } else {
                    console.log("No BLESmart device found. Devices:", devices.map(d => d?.name || 'Unknown'))
                    retryCountRef.current += 1
                    if (retryCountRef.current >= maxRetries) {
                        console.log("Max retries reached, stopping scan.")
                        clearInterval(intervalRef.current)
                    }
                }
            } catch (err) {
                console.log('Error saat scanning device: ', err)
                retryCountRef.current += 1
                if (retryCountRef.current >= maxRetries) {
                    clearInterval(intervalRef.current)
                }
            } finally {
                setIsLoading(false)
            }
        }

        // Langsung scan pertama kali saat modal dibuka
        scanDevice()

        // Lalu ulangi setiap 10 detik
        intervalRef.current = setInterval(() => {
            setIsLoading(true);
            scanDevice();
        }, 10000);
        return () => clearInterval(intervalRef.current)
    }, [])
    return ( 
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top', 'left', 'right', 'bottom']}>
            <ThemedView style={{ paddingHorizontal: 15, paddingVertical: 10, flex: 1, backgroundColor: '#fff' }}>
                <ThemedView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', paddingVertical: 5 }}>
                    <Pressable onPress={() => setModalVisible(false)} hitSlop={10}>
                        <ThemedText style={{ padding: 4 }}><Ionicons size={30} name='arrow-back' color="#000" /></ThemedText>
                    </Pressable>
                    <Pressable hitSlop={10}>
                        <ThemedText><Ionicons size={30} name='reorder-three' color="#000" /></ThemedText>
                    </Pressable>
                </ThemedView>
            <ThemedView style={styles.modalView}>
                <ThemedText style={{ fontWeight: '600', color: '#000', fontSize: 28, textAlign: 'center', padding: 3, lineHeight: 30 }}>Mencari perangkat tekanan darah</ThemedText>
                <ThemedText style={{ marginVertical: 20, padding: 8, textAlign: 'justify', color: '#000', fontSize: 20, fontWeight: '400', lineHeight: 30}}>
                    Tekan dan tahan tombol selama 3 detik hingga muncul
                    huruf P yang berkedip. Aplikasi akan secara otomatis mendeteksi monitor / alat
                    tekanan darah kamu dan berganti layar
                </ThemedText>
                {isLoading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    <ThemedView>
                        <ThemedText style={{ marginVertical: 20, padding: 8, textAlign: 'justify' }}>
                            {isDeviceFound ? 
                            <ThemedView>
                                <ThemedText style={{ marginBottom: 20 }}>Device Ditemukan: {deviceName}</ThemedText> 
                                <Pressable style={[styles.button, styles.buttonClose]} onPress={() => { setModalConnectingDevice(true), Vibration.vibrate(100) }}>
                                    <ThemedText style={styles.textStyle}>Daftarkan</ThemedText>
                                </Pressable>
                            </ThemedView>
                            : 
                            <ThemedView>
                                <ThemedText>Tidak ada perangkat ditemukan. Mencoba ulang...</ThemedText>
                                <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />
                            </ThemedView>}
                        </ThemedText>
                    </ThemedView>
                )}
            </ThemedView>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalConnectingDevice}
                onRequestClose={() => {
                    setModalConnectingDevice(!modalConnectingDevice);
                }}>
                    <ConnectingModal setModalConnectingDevice={setModalConnectingDevice} />
            </Modal>
            </ThemedView>
        </SafeAreaView>
     );
}

const styles = StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalView: {
      marginVertical: 30,
      marginHorizontal: 20,
      backgroundColor: 'white',
      borderRadius: 18,
      paddingHorizontal: 10,
      paddingVertical: 30,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 3,
    },
    button: {
      borderRadius: 18,
      padding: 15,
      elevation: 5,
    },
    buttonOpen: {
      backgroundColor: '#F194FF',
    },
    buttonClose: {
      backgroundColor: '#2196F3',
      color: '#fff',
    },
    textStyle: {
      color: 'white',
      fontWeight: 'bold',
      textAlign: 'center',
    },
    modalText: {
      marginBottom: 15,
      textAlign: 'center',
    },
  });
 
export default DeviceModal;