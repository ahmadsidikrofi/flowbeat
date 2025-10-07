import { ThemedText } from '../ui/ThemedText';
import { ThemedView } from '../ui/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useState } from 'react';
import { ActivityIndicator, Pressable, TextInput, TouchableOpacity } from 'react-native';
import Config from "@/utils/Config"

const SignUp = ({ setSignUpModal, setSignInModal }) => {
    const [ isLoading, setIsLoading ] = useState(false)
    const [ peekPassword, setPeekPassword ] = useState(true)
    const [ peekRetypePassword, setPeekRetypePassword ] = useState(true)
    const [ isFirstNameFocused, setIsFirstNameFocused ] = useState(false)
    const [ isLastNameFocused, setIsLastNameFocused ] = useState(false)
    const [ isPhoneFocused, setIsPhoneFocused ] = useState(false)
    const [ isPasswordFocused, setIsPasswordFocused ] = useState(false)
    const [ isRetypePasswordFocused, setIsRetypePasswordFocused ] = useState(false)
    const [ firstName, setFirstName ] = useState('')
    const [ lastName, setLastName ] = useState('')
    const [ phoneNumber, setPhoneNumber ] = useState('')
    const [ password, setPassword ] = useState('')
    const [ confirmPassword, setConfirmPassword ] = useState('')
    const [ error, setError ] = useState('')
    const baseURL = Config.BASE_URL

    const handleSignUpPatient = async () => {
        if (password !== confirmPassword) {
			setError('Password dan konfirmasi password harus sama');
			return;
		}
        setIsLoading(true)
        await axios.post(`${baseURL}/api/auth/sign-up`, {
            first_name: firstName,
            last_name: lastName,
            phone_number: phoneNumber,
            password: password
        }).then(() => {
            setIsLoading(false)
            setSignInModal(true)
        }).catch((err) => {
            setError('Gagal mendaftar. Silahkan coba lagi.')
            setIsLoading(false)
        })
    }
    return (
        <ThemedView style={{ flex: 1, padding: 10 }}>
            <ThemedView style={{ marginTop: 20 }}>
                <Pressable onPress={() => setSignUpModal(false)}>
                    <ThemedText style={{ padding: 4 }}><Ionicons size={25} name='arrow-back' /></ThemedText>
                </Pressable>
            </ThemedView>
            <ThemedText style={{ fontWeight: '600', fontSize: 25, textAlign: 'center', marginVertical: 25 }}>Daftarkan Dirimu</ThemedText>
            <ThemedView style={{ marginTop: 20 }}>
                <TextInput
                    style={{ borderWidth: 0.1, borderRadius: 15, elevation: isFirstNameFocused ? 10 : 1, padding: 20, backgroundColor: '#fff', fontSize: 18 }}
                    placeholder="Nama Depan"
                    onFocus={() => setIsFirstNameFocused(true)}
                    onBlur={() => setIsFirstNameFocused(false)}
                    onChangeText={(e) => setFirstName(e)}
                />
                <TextInput
                    style={{ borderWidth: 0.1, borderRadius: 15, elevation: isLastNameFocused ? 10 : 1, padding: 20, backgroundColor: '#fff', fontSize: 18, marginVertical: 10 }}
                    placeholder="Nama Belakang"
                    onFocus={() => setIsLastNameFocused(true)}
                    onBlur={() => setIsLastNameFocused(false)}
                    onChangeText={(e) => setLastName(e)}
                />
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
                    <ThemedView style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 0.1, borderRadius: 15, elevation: isRetypePasswordFocused ? 6 : 1, backgroundColor: '#fff', marginTop: 10, }}>
                        <TextInput
                            style={{ fontSize: 14, padding: 20, flex: 1 }}
                            placeholder="Retype-password"
                            secureTextEntry={peekRetypePassword}
                            onFocus={() => setIsRetypePasswordFocused(true)}
                            onBlur={() => setIsRetypePasswordFocused(false)}
                            onChangeText={(e) => setConfirmPassword(e)}
                        />
                        <TouchableOpacity onPress={() => setPeekRetypePassword(!peekRetypePassword)}>
                            <ThemedText style={{ paddingRight: 20 }}><Ionicons size={25} name={peekRetypePassword ? 'eye-outline' : 'eye'} /></ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                    <ThemedText style={{ color: '#ef4444', paddingHorizontal: 10, marginTop: 10, fontSize: 13 }}>Password dibuat berkisar 8-12 karakter disertai angka atau simbol</ThemedText>
                    <ThemedText style={{ color: '#ef4444', paddingHorizontal: 10, marginTop: 10, fontSize: 13 }}>{error}</ThemedText>
                </ThemedView>
            </ThemedView>
            <ThemedView style={{ alignItems: 'center', marginTop: 'auto', paddingBottom: 20 }}>
                <ThemedView style={{ flexDirection: 'col', justifyContent: 'center', alignItems: 'center', gap: 20 }}>
                    <TouchableOpacity onPress={handleSignUpPatient} style={{ padding: 10, width: 250, borderRadius: 15, borderWidth: 0.1, elevation: 2, backgroundColor: '#fff' }}>
                        {isLoading ? (
                            <ActivityIndicator color='#404040'/>
                        ) : (
                            <ThemedText style={{ textAlign: 'center', fontWeight: '500' }}>Sign Up</ThemedText>
                        )}
                    </TouchableOpacity>
                </ThemedView>
            </ThemedView>
        </ThemedView>
    );
}
 
export default SignUp;