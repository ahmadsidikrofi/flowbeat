import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
// import useBLE from './useBLE';
import { useAuth } from './AuthProvider';
import Config from './Config';

export const useLatestBloodPressure = () => {
    const [refreshing, setRefreshing] = useState(false)
    const [ syncData, setSyncData ] = useState(false)
    const [ localDataBP, setLocalDataBP ] = useState([])
    const [ latestBPFromDB, setLatestBPFromDB ] = useState('')
    const [ historyDataFromBP, setHistoryDataFromBP ] = useState([])
    const [ isSuccess, setIsSuccess ] = useState(null)
    const { userToken, user } = useAuth()
    const baseURL = Config.BASE_URL
    console.log(latestBPFromDB)
    

    const getBloodPressure = async () => {
        try {
            setRefreshing(true)
            setSyncData(true)
            console.log("Fetching blood pressure data...")
            const res = await axios.post('http://10.58.95.249:8000/latest-bp-records', {
            
                mac_address: 'FA:E4:FA:F7:F7:AC', // Masih setting manual
                device_name: 'BLESmart_00000480FAE4FAF7F7AC', // Masih setting manual
                new_records_only: false,
                sync_time: false,
                pairing: false,
            })

            console.log('======= API SUKSES! =======');
            console.log('Data diterima:', res.data.latest_record);
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
                
                if (!Array.isArray(updatedData)) {
                    updatedData = []
                }

                updatedData.push(latestRecords)
                await AsyncStorage.setItem('blood-pressure-data', JSON.stringify(updatedData))
                setLocalDataBP(updatedData) // Ini sudah benar, mengatur state jadi Array
                console.log("MacAddress: ", macAddress, "deviceName: ", deviceName, "Records: ", latestRecords);
                setIsSuccess(true)
                setTimeout(() => setIsSuccess(null), 4000)

                // [FIX 4] DIKOMENTARI KARENA MENYEBABKAN ERROR 404.
                // Server Python Anda tidak memiliki endpoint '/api/patient-bp-data/...'
                // Server Anda juga tidak memiliki endpoint untuk LatestDataBloodPressureFromDB dan GetAllDataFromDB.
                if (userToken) {
                    setSyncData(true)
                    const res = await axios.post(`${baseURL}/api/omron/${user?.id}`, {
                        sys: latestRecords.sys,
                        dia: latestRecords.dia,
                        bpm: latestRecords.bpm,
                        mov: latestRecords.mov,
                        ihb: latestRecords.ihb,
                        device: deviceName,
                        user_id: user?.id,
                    }, { headers: { Authorization: `Bearer ${userToken}` } })
                    console.log(res.data)
                    LatestDataBloodPressureFromDB() // <-- Ini akan menyebabkan 404
                    GetAllDataFromDB() // <-- Ini akan menyebabkan 404
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

    useEffect(() => {
        const getLocalBloodPressure = async () => {
           const data = JSON.parse(await AsyncStorage.getItem('blood-pressure-data')) || [] 
           setLocalDataBP(data)
        }
        getLocalBloodPressure()
    }, [])

    const latestBP = localDataBP && localDataBP.length > 0 ? localDataBP[localDataBP.length - 1] : null

    const LatestDataBloodPressureFromDB = async () => {
        if (userToken) {
            try {
                const res = await axios.get(
                    `${baseURL}/api/omron/${user.id}`,
                    { headers: { Authorization: `Bearer ${userToken}` } }
                );
                const latestRecord = res?.data?.data?.[0] ?? null
                setLatestBPFromDB(latestRecord)
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
    }
        
    const GetAllDataFromDB = async () => {
        // if (userToken) {
        //     const res = await axios.get(`${baseURL}/api/patients/blood-pressures`,
        //         { headers: { Authorization: `Bearer ${userToken}` } }
        //     )
        //     // console.log("Response API", res.data);
        //     setHistoryDataFromDB(prevDatas => {
        //         return res.data['health_data'] || []
        //     })
        // }
    }

    useEffect(() => {
        // [FIX 8] DIKOMENTARI KARENA FUNGSI DI DALAMNYA TIDAK MEMILIKI ENDPOINT.
        if (userToken) {
            LatestDataBloodPressureFromDB()
            GetAllDataFromDB()
        }
    }, [userToken])

 return {
    refreshing,
    syncData,
    isSuccess,
    latestBP,
    localDataBP,
    latestBPFromDB, // Ini akan selalu kosong
    historyDataFromBP, // Ini akan selalu kosong
    getBloodPressure,
    LatestDataBloodPressureFromDB // Ini tidak melakukan apa-apa
 };
};



