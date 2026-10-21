import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from './AuthProvider';
import { measurementApi } from '../services/api';
import Config from './Config';

export const useLatestBloodPressure = () => {
    const [refreshing, setRefreshing] = useState(false)
    const [syncData, setSyncData] = useState(false)
    const [localDataBP, setLocalDataBP] = useState([])
    const [latestBPFromDB, setLatestBPFromDB] = useState('')
    const [historyDataFromBP, setHistoryDataFromBP] = useState([])
    const [isSuccess, setIsSuccess] = useState(null)
    const { currentUser, currentProfile } = useAppContext()

    const getBloodPressure = async () => {
        try {
            setRefreshing(true)
            setSyncData(true)
            console.log("Fetching blood pressure data...")

            const res = await measurementApi.readLatestFromDevice(
                Config.DEVICE_MAC,
                Config.DEVICE_NAME,
                0
            )

            if (!res.success) {
                console.log("Error fetching from device:", res.error)
                setIsSuccess(false)
                setTimeout(() => setIsSuccess(null), 4000)
                return
            }

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

                if (currentUser?.token && currentProfile?.backendId) {
                    setSyncData(true)
                    await measurementApi.save({
                        id_user: currentUser.id,
                        id_profile: currentProfile.backendId,
                        sys: latestRecords.sys,
                        dia: latestRecords.dia,
                        bpm: latestRecords.bpm,
                        mov: latestRecords.mov,
                        ihb: latestRecords.ihb,
                        datetime: latestRecords.datetime,
                    }, currentUser.token)
                    LatestDataBloodPressureFromDB()
                    GetAllDataFromDB()
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
            const data = JSON.parse(await AsyncStorage.getItem('blood-pressure-data')) || {}
            setLocalDataBP(data)
        }
        getLocalBloodPressure()
    }, [])

    const latestBP = localDataBP && localDataBP.length > 0 ? localDataBP[localDataBP.length - 1] : null

    const LatestDataBloodPressureFromDB = async () => {
        if (currentUser?.token && currentProfile?.backendId) {
            try {
                const res = await measurementApi.getLatest(currentProfile.backendId, currentUser.token)
                if (res.success && res.data) {
                    setLatestBPFromDB(res.data)
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
    }

    const GetAllDataFromDB = async () => {
        if (currentUser?.token && currentProfile?.backendId) {
            const res = await measurementApi.getAll(currentProfile.backendId, currentUser.token)
            if (res.success && res.data) {
                setHistoryDataFromBP(res.data || [])
            }
        }
    }

    useEffect(() => {
        if (currentUser?.token && currentProfile?.backendId) {
            LatestDataBloodPressureFromDB()
            GetAllDataFromDB()
        }
    }, [currentUser?.token, currentProfile?.backendId])

    return {
        refreshing,
        syncData,
        isSuccess,
        latestBP,
        localDataBP,
        latestBPFromDB,
        historyDataFromBP,
        getBloodPressure,
        LatestDataBloodPressureFromDB
    };
};