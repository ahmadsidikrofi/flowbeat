import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import useBLE from './useBLE';
import { useAuth } from './AuthProvider';

export const useLatestBloodPressure = () => {
    const [refreshing, setRefreshing] = useState(false)
    const [ syncData, setSyncData ] = useState(false)
    const { requestPermissions } = useBLE()
    const [ localDataBP, setLocalDataBP ] = useState([])
    const [ isSuccess, setIsSuccess ] = useState(null)
    const { userToken, user } = useAuth()

    const getBloodPressure = async () => {
        const isPermissionsEnabled = requestPermissions();
        if (!isPermissionsEnabled) {
            Alert.alert('Permissions Denied', 'Please enable Bluetooth and Location permissions to proceed.');
            return;
        }
        try {
            setRefreshing(true)
            setSyncData(true)
            console.log("Fetching blood pressure data...")
            const res = await axios.post('http://192.168.1.3:8000/latest-bp-records', {
                mac_address: 'FA:E4:FA:F7:F7:AC', // Masih setting manual
                device_name: 'BLESmart_00000480FAE4FAF7F7AC', // Masih setting manual
                new_records_only: false,
                sync_time: false,
                pairing: false,
            })
            const latestRecords = res.data.latest_record
            const macAddress = res.data.mac_address
            const deviceName = res.data.device_name
            setLocalDataBP({
                datetime: latestRecords.datetime,
                sys: latestRecords.sys,
                dia: latestRecords.dia,
                bpm: latestRecords.bpm
            })
            if (latestRecords) {
                const getStoredDataBP = await AsyncStorage.getItem('blood-pressure-data')
                let updatedData = getStoredDataBP ? JSON.parse(getStoredDataBP) : [] 
                updatedData.push(latestRecords)
                await AsyncStorage.setItem('blood-pressure-data', JSON.stringify(updatedData))
                setLocalDataBP(updatedData)
                console.log("MacAddress: ", macAddress, "deviceName: ", deviceName, "Records: ", latestRecords);
                setIsSuccess(true)
                setTimeout(() => setIsSuccess(null), 4000)
                if (userToken) {
                    const res = await axios.post(`https://ffff-2001-448a-4007-2e7c-293f-6075-f32c-9e99.ngrok-free.app/api/patient-health-data/${user?.uuid}`, {
                        sys: latestRecords.sys,
                        dia: latestRecords.dia,
                        bpm: latestRecords.bpm,
                        mov: latestRecords.mov,
                        ihb: latestRecords.ihb,
                        patient_id: user?.id,
                    }, { headers: { Authorization: `Bearer ${userToken}` } })
                    console.log(res.data)
                }
            } else {
                console.log("No records found", "No new data available from the device.")
                setIsSuccess(true)
                setTimeout(() => setIsSuccess(null), 4000)
            }
        } catch (err) {
            console.log(err)
            setIsSuccess(false)
            setTimeout(() => setIsSuccess(null), 4000)
        } finally {
            setRefreshing(false)
            setSyncData(false)
        }
    }
    useState(() => {
        const getLocalBloodPressure = async () => {
           const data = JSON.parse(await AsyncStorage.getItem('blood-pressure-data')) || {}
           setLocalDataBP(data)
        }
        getLocalBloodPressure()
    }, [])
    const latestBP = localDataBP && localDataBP.length > 0 ? localDataBP[localDataBP.length - 1] : null

  return {
    latestBP,
    refreshing,
    syncData,
    isSuccess,
    getBloodPressure,
  };
};
