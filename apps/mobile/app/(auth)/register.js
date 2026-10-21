import { useState } from 'react';
import { TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppContext } from '../../utils/AuthProvider';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const { register } = useAppContext();
  const router = useRouter();

  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const validatePhone = (value) => /^[0-9+\-\s]+$/.test(value) && value.replace(/[^0-9]/g, '').length >= 8;

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) newErrors.name = 'Nama wajib diisi.';
    if (!email.trim()) newErrors.email = 'Email wajib diisi.';
    else if (!validateEmail(email.trim())) newErrors.email = 'Format email tidak valid. Contoh: nama@email.com';
    if (!phone.trim()) newErrors.phone = 'Nomor HP wajib diisi.';
    else if (!validatePhone(phone.trim())) newErrors.phone = 'Nomor HP harus berupa angka (minimal 8 digit).';
    if (!password.trim()) newErrors.password = 'Password wajib diisi.';
    else if (password.trim().length < 8) newErrors.password = 'Password minimal 8 karakter.';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Password dan konfirmasi password harus sama';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (validate()) {
      setIsLoading(true);
      setApiError('');
      const result = await register(name.trim(), email.trim(), phone.trim(), password.trim());
      setIsLoading(false);
      if (!result.success) {
        setApiError(result.error || 'Registrasi gagal.');
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0b0f19' }}>
      <StatusBar style="light" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 16 }} keyboardShouldPersistTaps="handled">
          
          {/* Header Back */}
          <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#334155', marginBottom: 20 }}>
            <Ionicons size={22} name="arrow-back" color="#f8fafc" />
          </TouchableOpacity>

          {/* Title & Subtitle */}
          <Text style={{ fontSize: 28, fontWeight: '800', color: '#f8fafc', marginBottom: 8, textAlign: 'center' }}>Daftarkan Dirimu</Text>
          <Text style={{ fontSize: 15, color: '#94a3b8', textAlign: 'center', marginBottom: 24 }}>Buat akun baru untuk mulai memantau kesehatan</Text>

          {/* Form Fields */}
          <View style={{ gap: 16 }}>
            {/* Nama */}
            <View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#cbd5e1', marginBottom: 6 }}>Nama Lengkap</Text>
              <TextInput
                style={{
                  borderWidth: 1.5,
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  backgroundColor: '#1e293b',
                  fontSize: 16,
                  color: '#f8fafc',
                  borderColor: errors.name ? '#ef4444' : (isNameFocused ? '#38bdf8' : '#334155'),
                }}
                placeholder="Masukkan nama lengkap"
                placeholderTextColor="#64748b"
                onFocus={() => setIsNameFocused(true)}
                onBlur={() => setIsNameFocused(false)}
                onChangeText={(v) => { setName(v); if (errors.name) setErrors(e => ({ ...e, name: '' })); }}
                value={name}
              />
              {errors.name ? <Text style={{ color: '#f87171', fontSize: 13, marginTop: 4, fontWeight: '600' }}>{errors.name}</Text> : null}
            </View>

            {/* Email */}
            <View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#cbd5e1', marginBottom: 6 }}>Alamat Email</Text>
              <TextInput
                style={{
                  borderWidth: 1.5,
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  backgroundColor: '#1e293b',
                  fontSize: 16,
                  color: '#f8fafc',
                  borderColor: errors.email ? '#ef4444' : (isEmailFocused ? '#38bdf8' : '#334155'),
                }}
                placeholder="nama@email.com"
                placeholderTextColor="#64748b"
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => setIsEmailFocused(false)}
                onChangeText={(v) => { setEmail(v); if (errors.email) setErrors(e => ({ ...e, email: '' })); }}
                value={email}
              />
              {errors.email ? <Text style={{ color: '#f87171', fontSize: 13, marginTop: 4, fontWeight: '600' }}>{errors.email}</Text> : null}
            </View>

            {/* Nomor HP */}
            <View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#cbd5e1', marginBottom: 6 }}>Nomor Handphone</Text>
              <TextInput
                style={{
                  borderWidth: 1.5,
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  backgroundColor: '#1e293b',
                  fontSize: 16,
                  color: '#f8fafc',
                  borderColor: errors.phone ? '#ef4444' : (isPhoneFocused ? '#38bdf8' : '#334155'),
                }}
                placeholder="08123456789"
                placeholderTextColor="#64748b"
                keyboardType="phone-pad"
                onFocus={() => setIsPhoneFocused(true)}
                onBlur={() => setIsPhoneFocused(false)}
                onChangeText={(v) => { setPhone(v); if (errors.phone) setErrors(e => ({ ...e, phone: '' })); }}
                value={phone}
              />
              {errors.phone ? <Text style={{ color: '#f87171', fontSize: 13, marginTop: 4, fontWeight: '600' }}>{errors.phone}</Text> : null}
            </View>

            {/* Password */}
            <View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#cbd5e1', marginBottom: 6 }}>Password</Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1.5,
                borderRadius: 14,
                backgroundColor: '#1e293b',
                borderColor: errors.password ? '#ef4444' : (isPasswordFocused ? '#38bdf8' : '#334155'),
              }}>
                <TextInput
                  style={{ fontSize: 16, paddingHorizontal: 16, paddingVertical: 14, flex: 1, color: '#f8fafc' }}
                  placeholder="Minimal 8 karakter"
                  placeholderTextColor="#64748b"
                  secureTextEntry={!showPassword}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  onChangeText={(v) => { setPassword(v); if (errors.password) setErrors(e => ({ ...e, password: '' })); }}
                  value={password}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ paddingHorizontal: 16 }}>
                  <Ionicons size={22} name={!showPassword ? 'eye-outline' : 'eye'} color="#94a3b8" />
                </TouchableOpacity>
              </View>
              {errors.password ? <Text style={{ color: '#f87171', fontSize: 13, marginTop: 4, fontWeight: '600' }}>{errors.password}</Text> : null}
            </View>

            {/* Confirm Password */}
            <View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#cbd5e1', marginBottom: 6 }}>Konfirmasi Password</Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1.5,
                borderRadius: 14,
                backgroundColor: '#1e293b',
                borderColor: errors.confirmPassword ? '#ef4444' : (isConfirmPasswordFocused ? '#38bdf8' : '#334155'),
              }}>
                <TextInput
                  style={{ fontSize: 16, paddingHorizontal: 16, paddingVertical: 14, flex: 1, color: '#f8fafc' }}
                  placeholder="Ulangi kata sandi"
                  placeholderTextColor="#64748b"
                  secureTextEntry={!showConfirmPassword}
                  onFocus={() => setIsConfirmPasswordFocused(true)}
                  onBlur={() => setIsConfirmPasswordFocused(false)}
                  onChangeText={(v) => { setConfirmPassword(v); if (errors.confirmPassword) setErrors(e => ({ ...e, confirmPassword: '' })); }}
                  value={confirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={{ paddingHorizontal: 16 }}>
                  <Ionicons size={22} name={!showConfirmPassword ? 'eye-outline' : 'eye'} color="#94a3b8" />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword ? <Text style={{ color: '#f87171', fontSize: 13, marginTop: 4, fontWeight: '600' }}>{errors.confirmPassword}</Text> : null}
            </View>

            {/* Api Error Alert */}
            {apiError ? (
              <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#ef4444' }}>
                <Text style={{ color: '#fca5a5', fontSize: 14, fontWeight: '600' }}>{apiError}</Text>
              </View>
            ) : null}
          </View>

          {/* Action Buttons */}
          <View style={{ marginTop: 32, gap: 12, paddingBottom: 20 }}>
            <TouchableOpacity
              onPress={handleRegister}
              disabled={isLoading}
              style={{
                paddingVertical: 16,
                borderRadius: 14,
                backgroundColor: '#0ea5e9',
                alignItems: 'center',
                justifyContent: 'center',
                elevation: 2,
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={{ fontWeight: '700', fontSize: 16, color: '#ffffff' }}>Sign Up</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(auth)/login')}
              style={{
                paddingVertical: 16,
                borderRadius: 14,
                backgroundColor: '#1e293b',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1.5,
                borderColor: '#334155',
              }}
            >
              <Text style={{ fontWeight: '700', fontSize: 16, color: '#38bdf8' }}>Kembali ke Login</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
