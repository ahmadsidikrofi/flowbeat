import { useState } from 'react';
import { TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppContext } from '../../utils/AuthProvider';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const { login } = useAppContext();
  const router = useRouter();

  const [isIdentifierFocused, setIsIdentifierFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const validatePhone = (value) => /^[0-9+]+$/.test(value) && value.length >= 9;
  
  const validate = () => {
    const newErrors = {};
    const val = identifier.trim();
    if (!val) newErrors.identifier = 'Email atau Nomor HP wajib diisi.';
    else if (!val.includes('@') && !validatePhone(val)) newErrors.identifier = 'Format tidak valid. Masukkan Email atau Nomor HP yang benar.';
    else if (val.includes('@') && !validateEmail(val)) newErrors.identifier = 'Format email tidak valid. Contoh: nama@email.com';
    if (!password.trim()) newErrors.password = 'Kata sandi wajib diisi.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (validate()) {
      setIsLoading(true);
      setApiError('');
      const result = await login(identifier.trim(), password.trim());
      setIsLoading(false);
      if (!result.success) setApiError(result.error || 'Login gagal.');
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
          <Text style={{ fontSize: 28, fontWeight: '800', color: '#f8fafc', marginBottom: 8, textAlign: 'center' }}>Selamat Datang Kembali</Text>
          <Text style={{ fontSize: 15, color: '#94a3b8', textAlign: 'center', marginBottom: 32 }}>Masuk untuk mengakses aplikasi dan memantau kesehatan</Text>

          {/* Form */}
          <View style={{ gap: 20 }}>
            {/* Input Identifier */}
            <View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#cbd5e1', marginBottom: 8 }}>Email / Nomor HP</Text>
              <TextInput
                style={{
                  borderWidth: 1.5,
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  backgroundColor: '#1e293b',
                  fontSize: 16,
                  color: '#f8fafc',
                  borderColor: errors.identifier ? '#ef4444' : (isIdentifierFocused ? '#38bdf8' : '#334155'),
                }}
                placeholder="Masukkan email atau nomor HP"
                placeholderTextColor="#64748b"
                keyboardType="default"
                autoCapitalize="none"
                onFocus={() => setIsIdentifierFocused(true)}
                onBlur={() => setIsIdentifierFocused(false)}
                onChangeText={(e) => { setIdentifier(e); if (errors.identifier) setErrors(err => ({ ...err, identifier: '' })); }}
                value={identifier}
              />
              {errors.identifier ? <Text style={{ color: '#f87171', fontSize: 13, marginTop: 6, fontWeight: '600' }}>{errors.identifier}</Text> : null}
            </View>

            {/* Input Password */}
            <View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#cbd5e1', marginBottom: 8 }}>Password</Text>
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
                  placeholder="Masukkan kata sandi"
                  placeholderTextColor="#64748b"
                  secureTextEntry={!showPassword}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  onChangeText={(e) => { setPassword(e); if (errors.password) setErrors(err => ({ ...err, password: '' })); }}
                  value={password}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ paddingHorizontal: 16 }}>
                  <Ionicons size={22} name={!showPassword ? 'eye-outline' : 'eye'} color="#94a3b8" />
                </TouchableOpacity>
              </View>
              {errors.password ? <Text style={{ color: '#f87171', fontSize: 13, marginTop: 6, fontWeight: '600' }}>{errors.password}</Text> : null}

              <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} style={{ alignSelf: 'flex-end', marginTop: 10 }}>
                <Text style={{ color: '#38bdf8', fontSize: 14, fontWeight: '700' }}>Reset Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Api Error Alert */}
            {apiError ? (
              <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#ef4444' }}>
                <Text style={{ color: '#fca5a5', fontSize: 14, fontWeight: '600' }}>{apiError}</Text>
              </View>
            ) : null}
          </View>

          {/* Action Buttons */}
          <View style={{ marginTop: 36, gap: 14, paddingBottom: 20 }}>
            <TouchableOpacity
              onPress={handleLogin}
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
                <Text style={{ fontWeight: '700', fontSize: 16, color: '#ffffff' }}>Sign In</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(auth)/register')}
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
              <Text style={{ fontWeight: '700', fontSize: 16, color: '#38bdf8' }}>Daftar Akun Baru</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
