import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen() {
  const [identifier, setIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  const validate = () => {
    const newErrors = {};

    if (!identifier.trim()) {
      newErrors.identifier = 'Email atau Nomor HP wajib diisi.';
    }
    if (!newPassword.trim()) {
      newErrors.newPassword = 'Kata sandi baru wajib diisi.';
    } else if (newPassword.trim().length < 8) {
      newErrors.newPassword = 'Password minimal 8 karakter.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = () => {
    if (validate()) {
      setIsLoading(true);
      // Simulate API call for prototype
      setTimeout(() => {
        setIsLoading(false);
        setIsSuccess(true);
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 2000);
      }, 1500);
    }
  };

  // Determine icon for identifier based on input
  const getIdentifierIcon = () => {
    const val = identifier.trim();
    if (val.includes('@')) return 'mail-outline';
    if (/^\d+$/.test(val.replace(/\s/g, ''))) return 'phone-portrait-outline';
    return 'at-outline';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0b0f19' }}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Flexible Top AppBar */}
        <View style={styles.appBar}>
          <View style={styles.appBarLeft}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={22} color="#f8fafc" />
            </TouchableOpacity>
            <Text style={styles.appBarTitle}>Lupa Password</Text>
          </View>
          <TouchableOpacity style={styles.helpButton}>
            <Ionicons name="help-circle-outline" size={24} color="#38bdf8" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="key-outline" size={40} color="#38bdf8" />
            </View>
            <Text style={styles.title}>Lupa Kata Sandi?</Text>
            <Text style={styles.subtitle}>
              Jangan khawatir. Masukkan Email atau Nomor HP Anda beserta kata sandi baru untuk mereset akun Anda.
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.statusAccent} />
              <View style={styles.cardHeaderTextContainer}>
                <Text style={styles.cardHeaderTitle}>Pemulihan Langsung</Text>
                <Text style={styles.cardHeaderSubtitle}>
                  Pastikan data yang dimasukkan sudah benar dan aktif.
                </Text>
              </View>
            </View>

            <View style={styles.formSpace}>

              {/* Email / Phone Field */}
              <View style={styles.inputGroup}>
                <View style={[styles.inputContainer, errors.identifier && styles.inputContainerError]}>
                  <Ionicons name={getIdentifierIcon()} size={22} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="0812... atau joe@email.com"
                    placeholderTextColor="#64748b"
                    value={identifier}
                    onChangeText={(v) => { setIdentifier(v); if (errors.identifier) setErrors(e => ({ ...e, identifier: '' })); }}
                    autoCapitalize="none"
                  />
                </View>
                {errors.identifier ? <Text style={styles.errorText}>{errors.identifier}</Text> : null}
              </View>

              {/* New Password Field */}
              <View style={styles.inputGroup}>
                <View style={[styles.inputContainer, errors.newPassword && styles.inputContainerError]}>
                  <Ionicons name="lock-closed-outline" size={22} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Kata Sandi Baru"
                    placeholderTextColor="#64748b"
                    value={newPassword}
                    onChangeText={(v) => { setNewPassword(v); if (errors.newPassword) setErrors(e => ({ ...e, newPassword: '' })); }}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.visibilityButton}
                  >
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
                {errors.newPassword ? <Text style={styles.errorText}>{errors.newPassword}</Text> : null}
              </View>

              {/* Primary Action Button */}
              <TouchableOpacity
                style={[
                  styles.button,
                  isSuccess ? styles.buttonSuccess : {},
                  (isLoading || isSuccess) && styles.buttonDisabled
                ]}
                onPress={handleResetPassword}
                disabled={isLoading || isSuccess}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <>
                    <ActivityIndicator color="#ffffff" size="small" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Memproses...</Text>
                  </>
                ) : isSuccess ? (
                  <>
                    <Ionicons name="checkmark-circle" size={22} color="#ffffff" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Berhasil Diubah!</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="save-outline" size={22} color="#ffffff" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Simpan Kata Sandi Baru</Text>
                  </>
                )}
              </TouchableOpacity>

            </View>
          </View>

          {/* Secondary Guidance */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Sudah ingat kata sandi Anda?</Text>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.push('/(auth)/login')}
              activeOpacity={0.8}
            >
              <Ionicons name="log-in-outline" size={22} color="#38bdf8" style={styles.loginButtonIcon} />
              <Text style={styles.loginButtonText}>Kembali ke Login</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 54,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  appBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    marginRight: 12,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  appBarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#38bdf8',
  },
  helpButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
    paddingVertical: 24,
  },
  header: {
    width: '100%',
    maxWidth: 512,
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#1e293b',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#f8fafc',
  },
  subtitle: {
    fontSize: 15,
    color: '#94a3b8',
    marginTop: 6,
    fontWeight: '500',
    lineHeight: 22,
  },
  card: {
    width: '100%',
    maxWidth: 512,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  statusAccent: {
    width: 4,
    backgroundColor: '#38bdf8',
    borderRadius: 4,
    marginRight: 12,
  },
  cardHeaderTextContainer: {
    flex: 1,
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#38bdf8',
    marginBottom: 2,
  },
  cardHeaderSubtitle: {
    fontSize: 13,
    color: '#cbd5e1',
  },
  formSpace: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderWidth: 1.5,
    borderColor: '#334155',
    borderRadius: 14,
    height: 54,
  },
  inputContainerError: {
    borderColor: '#ef4444',
  },
  inputIcon: {
    marginLeft: 14,
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#f8fafc',
  },
  visibilityButton: {
    padding: 12,
    marginRight: 4,
  },
  errorText: {
    color: '#f87171',
    fontSize: 13,
    marginTop: 4,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#0ea5e9',
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    elevation: 2,
  },
  buttonSuccess: {
    backgroundColor: '#10b981',
  },
  buttonDisabled: {
    opacity: 0.8,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    marginTop: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 512,
    gap: 14,
  },
  footerText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#334155',
    borderRadius: 14,
    height: 50,
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#1e293b',
  },
  loginButtonIcon: {
    marginRight: 8,
  },
  loginButtonText: {
    color: '#38bdf8',
    fontSize: 15,
    fontWeight: '700',
  },
});
