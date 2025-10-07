import { ThemedText } from '../ui/ThemedText';
import { ThemedView } from '../ui/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useState } from 'react';
import { Pressable, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../../utils/AuthProvider';
import Config from '../../utils/Config';

const SignIn = ({ setSignInModal, setAuthModal }) => {
    const [ peekPassword, setPeekPassword ] = useState(true)
    const [ isPhoneFocused, setIsPhoneFocused ] = useState(false)
    const [ isPasswordFocused, setIsPasswordFocused ] = useState(false)
    const [ phoneNumber, setPhoneNumber ] = useState('')
    const [ password, setPassword ] = useState('')
    const [ isLoading, setIsLoading ] = useState(false)
    const [ error, setError ] = useState('')
    const { signIn } = useAuth()
    const baseURL = Config.BASE_URL

    const handleSignInPatient = async () => {
        setIsLoading(true)
        await axios.post(`${baseURL}/api/auth/sign-in`, {
            phone_number: phoneNumber,
            password: password
        }).then(async(res) => {
            const { access_token } = res.data
            await signIn(access_token)
            setIsLoading(false)
            setAuthModal(false)
        })
    }
    return ( 
        <ThemedView style={{ flex: 1, padding: 10 }}>
            <ThemedView style={{ marginTop: 20 }}>
                <Pressable onPress={() => setSignInModal(false)}>
                    <ThemedText style={{ padding: 4 }}><Ionicons size={25} name='arrow-back' /></ThemedText>
                </Pressable>
            </ThemedView>
            <ThemedText style={{ fontWeight: '600', fontSize: 25, textAlign: 'center', marginVertical: 25 }}>Selamat Datang Kembali</ThemedText>
            <ThemedView style={{ marginTop: 20 }}>
                <TextInput
                    style={{ borderWidth: 0.1, borderRadius: 15, elevation: isPhoneFocused ? 10 : 1, padding: 20, backgroundColor: '#fff', fontSize: 18 }}
                    placeholder="Nomor Handphone"
                    keyboardType='number-pad'
                    onFocus={() => setIsPhoneFocused(true)}
                    onBlur={() => setIsPhoneFocused(false)}
                    onChangeText={(e) => setPhoneNumber(e)}
                />
                <ThemedView style={{ height: 0.5, width: '100%', backgroundColor: '#ddd', marginVertical: 10, elevation: 1 }}></ThemedView>
                <ThemedView>
                    <ThemedView style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 0.1, borderRadius: 15, elevation: isPasswordFocused ? 6 : 1, backgroundColor: '#fff', marginTop: 10, }}>
                        <TextInput
                            style={{ fontSize: 18, padding: 20, flex: 1 }}
                            placeholder="Password"
                            secureTextEntry={peekPassword}
                            onFocus={() => setIsPasswordFocused(true)}
                            onBlur={() => setIsPasswordFocused(false)}
                            onChangeText={(e) => setPassword(e)}
                        />
                        <TouchableOpacity onPress={() => setPeekPassword(!peekPassword)}>
                            <ThemedText style={{ paddingRight: 20 }}><Ionicons size={25} name={peekPassword ? 'eye-outline' : 'eye'} /></ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                    <ThemedText style={{ color: '#475569', textAlign: 'center', marginTop: 40, fontSize: 18, fontWeight: '500' }}>Reset Password?</ThemedText>
                </ThemedView>
            </ThemedView>
            <ThemedView style={{ width: '100%', alignItems: 'center', marginTop: 'auto', paddingBottom: 20 }}>
                <ThemedView style={{ flexDirection: 'col', justifyContent: 'center', alignItems: 'center', gap: 20 }}>
                    <TouchableOpacity onPress={handleSignInPatient} style={{ padding: 10, width: 250, borderRadius: 15, borderWidth: 0.1, elevation: 2, backgroundColor: '#fff' }}>
                        {isLoading ? (
                            <ActivityIndicator color='#404040'/>
                        ): (
                            <ThemedText style={{ textAlign: 'center', fontWeight: '500' }}>Sign In</ThemedText>
                        )}
                    </TouchableOpacity>
                </ThemedView>
            </ThemedView>
        </ThemedView>
    );
}
 
export default SignIn;