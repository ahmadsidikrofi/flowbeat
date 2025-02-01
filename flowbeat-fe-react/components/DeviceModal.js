import { ThemedText } from '../components/ui/ThemedText';
import { ThemedView } from '../components/ui/ThemedView';
import { Ionicons } from "@expo/vector-icons";
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Vibration } from 'react-native';
import ConnectingModal from './ConnectingModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DeviceModal = ({ setModalVisible }) => {
    const [isDeviceFound, setDeviceFound] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [deviceName, setDeviceName] = useState('')
    const [retryCount, setRetryCount] = useState(0)
    const maxRetries = 5
    const intervalRef = useRef(null)
    const [modalConnectingDevice, setModalConnectingDevice] = useState(false)
    
    useEffect(() => {
        const scanDevice = async () => {
            try {
                console.log("Scanning Device")
                // const res = await axios.get('http://192.168.0.102:8000/scan')
                const res = await axios.get('http://192.168.135.236:8000/scan')
                const devices = res.data.devices
                const targetDevice = devices.find((device) => device.name.includes('BLESmart'))
                if (targetDevice) {
                    console.log(targetDevice)
                    setDeviceFound(true)
                    if (targetDevice.name === "BLESmart_00000480FAE4FAF7F7AC") {
                        setDeviceName("HEM-7142T")
                        const getStoredDevices = await AsyncStorage.getItem('my-devices')
                        const parsedDevices = getStoredDevices ? JSON.parse(getStoredDevices) : []
                        const syncDevice = { ...targetDevice, lastSync: Date.now() }
                        parsedDevices.push(syncDevice)
                        await AsyncStorage.setItem('my-devices', JSON.stringify(parsedDevices))
                    }
                    clearInterval(intervalRef.current)
                } else if (retryCount >= maxRetries) {
                    clearInterval(intervalRef.current)
                }
            } catch (err) {
                console.log('Device tidak ditemukan: ',err)
            } finally {
                setRetryCount(prev => prev + 1)
                setIsLoading(false)
            }
        }
        intervalRef.current = setInterval(() => {
            setIsLoading(true);
            scanDevice();
        }, 10000);
        return () => clearInterval(intervalRef.current)
    }, [])
    return ( 
        <ThemedView style={{  padding: 10, flex: 1 }}>
            <ThemedView  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Pressable onPress={() => setModalVisible(false)}>
                    <ThemedText style={{ padding: 4 }}><Ionicons size={30} name='arrow-back' /></ThemedText>
                </Pressable>
                <Pressable>
                    <ThemedText><Ionicons size={30} name='reorder-three' /></ThemedText>
                </Pressable>
            </ThemedView>
            <ThemedView style={styles.modalView}>
                <ThemedText style={{ fontWeight: '500' }}>Mencari perangkat tekanan darah Bapak</ThemedText>
                <ThemedText style={{ marginVertical: 20, padding: 8, textAlign: 'justify' }}>
                    Tekan dan tahan tombol bluetooth selama 3 detik hingga muncul
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