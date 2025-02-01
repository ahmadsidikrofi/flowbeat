import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
import { createContext, useContext, useEffect, useState } from "react"
import Config from "./Config"

const AuthContext = createContext()
export const AuthProvider = ({ children }) => {
    const [ userToken, setUserToken ] = useState(null)
    const [ isLoading, setIsLoading ] = useState(true)
    const [ user, setUser ] = useState(null)
    const baseURL = Config.BASE_URL

    useEffect(() => {
        const loadTokenAndUser = async () => {
            const token = await AsyncStorage.getItem('UserToken')
            const userData = await AsyncStorage.getItem('UserData')
            if (token) {
                setUserToken(token)
                if (userData) {
                    setUser(JSON.parse(userData))
                } else {
                    await fetchUserData(token)
                }
            }
            setIsLoading(false)
        }
        loadTokenAndUser()
    }, [])

    const fetchUserData = async (token) => {
        try {
            const res = await axios.get(`${baseURL}/api/auth/patient`, {
            // const res = await axios.get('https://35c1-2001-448a-4007-45ff-d0f3-ab3e-9f07-521.ngrok-free.app/api/auth/patient', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setUser(res.data)
            await AsyncStorage.setItem('UserData', JSON.stringify(res.data))
        } catch(err) {
            console.log('Error fetching data',err)
            setUser(null)
            await AsyncStorage.removeItem('UserData')
        }
    }

    const signIn = async (token) => {
        await AsyncStorage.setItem('UserToken', token)
        setUserToken(token)
        await fetchUserData(token)
    }
    const signOut = async () => {
        await AsyncStorage.removeItem('UserToken')
        await AsyncStorage.removeItem('UserData')
        setUserToken(null)
        setUser(null)
    }
    
    return (
        <AuthContext.Provider value={{ signIn, signOut, isLoading, userToken, user }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)