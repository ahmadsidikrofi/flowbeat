import AsyncStorage from "@react-native-async-storage/async-storage"
import { createContext, useContext, useEffect, useState } from "react"
import { authApi, profileApi, doctorApi } from "../services/api"
import { hitungUmur } from "../utils/dateHelpers"
import Config from "../utils/Config"

const AppContext = createContext()

function backendProfileToLocal(bp) {
    let imageUrl = null;
    if (bp.image_url) {
        imageUrl = bp.image_url.startsWith('http') ? bp.image_url : `${Config.BASE_URL}${bp.image_url}`;
    } else if (bp.name) {
        imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(bp.name)}&background=e2e8f0&color=64748b&size=200&bold=true`;
    }
    return {
        id: String(bp.id),
        backendId: bp.id,
        name: bp.name,
        tanggal_lahir: bp.date_of_birth || null,
        umur: bp.date_of_birth ? hitungUmur(bp.date_of_birth) : (bp.age || 0),
        gender: bp.gender || 'Laki-laki',
        tinggi_badan: bp.tb || 0,
        berat_badan: bp.bb || 0,
        imageUrl: imageUrl,
    }
}

export const AppProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null)
    const [profiles, setProfiles] = useState([])
    const [currentProfile, setCurrentProfile] = useState(null)
    const [doctorInfo, setDoctorInfo] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    // Restore session on mount
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const userData = await AsyncStorage.getItem('UserData')
                const profileData = await AsyncStorage.getItem('CurrentProfile')
                if (userData) {
                    const user = JSON.parse(userData)
                    setCurrentUser(user)
                    // Load profiles
                    const profilesRes = await profileApi.list(user.id, user.token)
                    if (profilesRes.success && profilesRes.data) {
                        setProfiles(profilesRes.data.map(backendProfileToLocal))
                    }
                    if (profileData) {
                        setCurrentProfile(JSON.parse(profileData))
                    }
                }
            } catch (err) {
                console.log('Error restoring session:', err)
            }
            setIsLoading(false)
        }
        restoreSession()
    }, [])

    const login = async (identifier, password) => {
        const res = await authApi.login(identifier, password)
        if (res.success && res.data) {
            const user = {
                id: res.data.id_user,
                name: res.data.name,
                email: res.data.email,
                phone: '',
                token: res.data.token,
            }
            setCurrentUser(user)
            await AsyncStorage.setItem('UserData', JSON.stringify(user))
            // Load profiles after login
            const profilesRes = await profileApi.list(user.id, user.token)
            if (profilesRes.success && profilesRes.data) {
                setProfiles(profilesRes.data.map(backendProfileToLocal))
            }
            return { success: true }
        }
        return { success: false, error: res.error || 'Login gagal.' }
    }

    const register = async (name, email, phone, password) => {
        const res = await authApi.register(name, email, phone, password)
        if (res.success && res.data) {
            // Auto-login after register
            const loginRes = await authApi.login(email, password)
            if (loginRes.success && loginRes.data) {
                const user = {
                    id: loginRes.data.id_user,
                    name: loginRes.data.name,
                    email: loginRes.data.email,
                    phone,
                    token: loginRes.data.token,
                }
                setCurrentUser(user)
                await AsyncStorage.setItem('UserData', JSON.stringify(user))
                setProfiles([])
                return { success: true }
            }
            // Register succeeded but auto-login failed — still success
            const user = {
                id: res.data.id_user,
                name,
                email,
                phone,
            }
            setCurrentUser(user)
            await AsyncStorage.setItem('UserData', JSON.stringify(user))
            setProfiles([])
            return { success: true }
        }
        return { success: false, error: res.error || 'Registrasi gagal.' }
    }

    const logout = async () => {
        setCurrentUser(null)
        setCurrentProfile(null)
        setProfiles([])
        setDoctorInfo(null)
        await AsyncStorage.removeItem('UserData')
        await AsyncStorage.removeItem('CurrentProfile')
    }

    const loadProfiles = async () => {
        if (!currentUser) return
        const res = await profileApi.list(currentUser.id, currentUser.token)
        if (res.success && res.data) {
            setProfiles(res.data.map(backendProfileToLocal))
        }
    }

    const addProfile = async (data) => {
        if (!currentUser) return { success: false, error: 'User belum login.' }

        const res = await profileApi.create(
            currentUser.id,
            data.name,
            data.umur,
            data.gender,
            data.tinggi_badan,
            data.berat_badan,
            currentUser.token,
            data.tanggal_lahir
        )
        if (res.success && res.data) {
            const createdLocal = backendProfileToLocal(res.data);
            setProfiles((prev) => [...prev, createdLocal])
            return { success: true }
        }
        return { success: false, error: res.error || 'Gagal membuat profil.' }
    }

    const updateProfile = async (id, data) => {
        if (!currentUser) return { success: false, error: 'User belum login.' }
        const profile = profiles.find(p => p.id === id)
        const backendId = profile?.backendId || parseInt(id)

        const payload = {
            name: data.name,
            umur: data.umur,
            tanggal_lahir: data.tanggal_lahir || null,
            gender: data.gender,
            tinggi_badan: data.tinggi_badan,
            berat_badan: data.berat_badan,
        };

        const res = await profileApi.update(backendId, payload, currentUser.token)
        if (res.success && res.data) {
            const updatedProfile = backendProfileToLocal(res.data)
            setProfiles((prev) => prev.map(p => p.id === id ? updatedProfile : p))
            if (currentProfile?.id === id) {
                setCurrentProfile(updatedProfile)
                await AsyncStorage.setItem('CurrentProfile', JSON.stringify(updatedProfile))
            }
            return { success: true }
        }
        return { success: false, error: res.error || 'Gagal mengubah profil.' }
    }

    const deleteProfile = async (id) => {
        const profile = profiles.find(p => p.id === id)
        const backendId = profile?.backendId || parseInt(id)

        const res = await profileApi.delete(backendId, currentUser?.token)
        if (res.success) {
            setProfiles((prev) => prev.filter(p => p.id !== id))
            if (currentProfile?.id === id) {
                setCurrentProfile(null)
                await AsyncStorage.removeItem('CurrentProfile')
            }
            return { success: true }
        }
        return { success: false, error: res.error || 'Gagal menghapus profil.' }
    }

    const loadDoctorInfo = async (profileId) => {
        const res = await doctorApi.getByProfile(profileId)
        if (res.success && res.data) {
            setDoctorInfo(res.data)
        } else {
            setDoctorInfo(null)
        }
    }

    const selectProfile = async (profile) => {
        setCurrentProfile(profile)
        if (profile) {
            await AsyncStorage.setItem('CurrentProfile', JSON.stringify(profile))
            // Auto-load doctor info when profile is selected
            if (profile?.backendId) {
                loadDoctorInfo(profile.backendId)
            }
        } else {
            await AsyncStorage.removeItem('CurrentProfile')
            setDoctorInfo(null)
        }
    }

    return (
        <AppContext.Provider value={{
            currentUser,
            login,
            register,
            logout,
            profiles,
            loadProfiles,
            addProfile,
            updateProfile,
            deleteProfile,
            currentProfile,
            selectProfile,
            doctorInfo,
            loadDoctorInfo,
            isLoading,
        }}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = () => {
    const context = useContext(AppContext)
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider')
    }
    return context
}

// Backward compatibility alias
export const useAuth = () => {
    const ctx = useAppContext()
    return {
        signIn: async (token) => { /* no-op, use login instead */ },
        signOut: ctx.logout,
        isLoading: ctx.isLoading,
        userToken: ctx.currentUser?.token || null,
        user: ctx.currentUser,
        currentUser: ctx.currentUser,
        currentProfile: ctx.currentProfile,
    }
}