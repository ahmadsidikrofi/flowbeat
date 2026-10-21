import { ThemedText } from '../components/ui/ThemedText';
import { ThemedView } from '../components/ui/ThemedView';
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Config from '../utils/Config';
import { useEffect, useRef, useState } from 'react';
import { Image, Vibration } from 'react-native';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

const ConnectingModal = ({ setModalConnectingDevice }) => {
    const [isConnectingComplete, setIsConnectingComplete] = useState(false)
    const [data, setData] = useState({
        datetime: null,
        sys: null,
        dia: null,
        bpm: null
    })
    useEffect(() => {
        const getBloodPressure = async () => {
            try {
                console.log("Fetching blood pressure data...")
                // const res = await axios.post('http://192.168.0.102:8000/connect-and-read', {
                const res = await axios.post(`${Config.BASE_URL}/connect-and-read`, {
                    mac_address: Config.DEVICE_MAC, // Menggunakan Config
                    device_name: Config.DEVICE_NAME, // Menggunakan Config
                    new_records_only: false,
                    sync_time: false,
                    pairing: false,
                })
                const records = res.data.records[0]
                const macAddress = res.data.mac_address
                const deviceName = res.data.device_name
                const sortedRecords = records ? 
                [...records].sort((a, b) => new Date(b.datetime) - new Date(a.datetime)) 
                : [];
                if (sortedRecords && sortedRecords.length > 0) {
                    const latestRecord = sortedRecords[0]
                    setData({
                        datetime: latestRecord.datetime,
                        sys: latestRecord.sys,
                        dia: latestRecord.dia,
                        bpm: latestRecord.bpm
                    })
                    setIsConnectingComplete(true)
                    Vibration.vibrate(100)
                    const getStoredDataBP = await AsyncStorage.getItem('bloodPressureData')
                    const updatedData = getStoredDataBP ? [...JSON.parse(getStoredDataBP), latestRecord] : latestRecord 
                    await AsyncStorage.setItem('bloodPressureData', JSON.stringify(updatedData))
                    console.log("MacAddress: ", macAddress, "deviceName: ", deviceName, "Records: ", latestRecord)
                } else {
                    console.log("No records found", "No new data available from the device.")
                }
            } catch (err) {
                console.log(err)
            } 
        }
        getBloodPressure()
    }, [])
    return ( 
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top', 'left', 'right', 'bottom']}>
            <ThemedView style={{ padding: 20, flex: 1, alignItems: 'center', justifyContent: 'space-between', gap: 15 }}>
                <View style={{ marginTop: 20 }}>
                    <ThemedText style={{ fontWeight: '600', fontSize: 18 }}>{isConnectingComplete ? 'Berkomunikasi' : 'Mohon ditunggu...'}</ThemedText>
                </View>
                {isConnectingComplete ?
                    <View style={{ marginTop: 80 }}>
                        <Image source={require('../assets/images/checklist-animation.gif')} style={{ width: 180, height: 180 }} />
                    </View>
                    :
                    <View style={{ marginTop: 80 }}>
                        <Image source={require('../assets/images/loading-animation.gif')} style={{ width: 200, height: 200 }} />
                    </View>
                }
                <View style={{ position: 'absolute', bottom: 30, right: 0, left: 0, alignItems: 'center' }}>
                    <Pressable style={[styles.button]} onPress={() => setModalConnectingDevice(false)}>
                        <ThemedText style={styles.textStyle}>
                            {isConnectingComplete ? 'Kembali' : 'Batalkan'}
                        </ThemedText>
                    </Pressable>
                </View>
            </ThemedView>
        </SafeAreaView>
     );
}

const styles = StyleSheet.create({
    button: {
      borderRadius: 18,
      padding: 10,
      width: '75%',
      elevation: 5,
      backgroundColor: '#F95454',
      color: '#fff',
    },
    textStyle: {
      color: 'white',
      fontWeight: 'bold',
      textAlign: 'center',
    },
  });
 
export default ConnectingModal;