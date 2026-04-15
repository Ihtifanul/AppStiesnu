import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppContext } from '../context/AppContext';
import api from '../config/api';

const RegisterScreen = ({ onNavigate }) => {
  const { login } = useAppContext();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleRequestOtp = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!email) {
      setErrorMsg('Email wajib diisi untuk meminta OTP');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Format email tidak valid');
      return;
    }
    setOtpLoading(true);
    try {
      await api.post('/auth/request-otp', { email });
      setSuccessMsg('OTP telah dikirim ke email Anda! Berlaku 10 menit.');
      setOtpSent(true);
    } catch (e) {
      setErrorMsg(e.response?.data?.error || 'Gagal meminta OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleRegister = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!username || !password || !email || !otp) {
      setErrorMsg('Semua field wajib diisi.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password minimal 6 karakter.');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        username,
        email,
        password,
        otp
      });
      if (response.data.success) {
        const { token, user } = response.data.data;
        await login(user, token);
        onNavigate('Home');
      }
    } catch (error) {
      if (error.response?.data?.error) {
        setErrorMsg(error.response.data.error);
      } else if (error.response?.data?.errors) {
        setErrorMsg(Object.values(error.response.data.errors)[0]);
      } else {
        setErrorMsg('Gagal terhubung ke server.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar barStyle="light-content" backgroundColor="#059669" />
      <LinearGradient colors={['#059669', '#047857']} style={styles.gradient}>
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { flexGrow: 1 }]} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.headerSection}>
            <View style={styles.logoCircle}>
              <Ionicons name="school" size={36} color="#fff" />
            </View>
            <Text style={styles.headerTitle}>Buat Akun Baru</Text>
            <Text style={styles.headerSubtitle}>STIESNU Bengkulu</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {errorMsg !== '' && (
              <View style={styles.alertBox}>
                <Ionicons name="alert-circle" size={16} color="#ef4444" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}
            {successMsg !== '' && (
              <View style={[styles.alertBox, { backgroundColor: '#ecfdf5', borderColor: '#6ee7b7' }]}>
                <Ionicons name="checkmark-circle" size={16} color="#059669" />
                <Text style={[styles.errorText, { color: '#059669' }]}>{successMsg}</Text>
              </View>
            )}

            <Text style={styles.label}>Username</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={18} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Masukkan username"
                placeholderTextColor="#9ca3af"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            <Text style={styles.label}>Password <Text style={styles.labelHint}>(min. 6 karakter)</Text></Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Masukkan password"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity onPress={() => setShowPass(p => !p)} style={styles.eyeBtn}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Email</Text>
            <View style={styles.emailRow}>
              <View style={[styles.inputWrapper, { flex: 1, marginBottom: 0 }]}>
                <Ionicons name="mail-outline" size={18} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="email@contoh.com"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <TouchableOpacity
                style={[styles.otpBtn, otpSent && { backgroundColor: '#6ee7b7' }]}
                onPress={handleRequestOtp}
                disabled={otpLoading}
              >
                {otpLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.otpBtnText}>{otpSent ? 'Kirim Ulang' : 'Kirim OTP'}</Text>
                )}
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { marginTop: 16 }]}>Kode OTP</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Masukkan kode OTP dari email"
                placeholderTextColor="#9ca3af"
                value={otp}
                onChangeText={setOtp}
                keyboardType="default"
              />
            </View>

            <TouchableOpacity
              style={[styles.registerBtn, loading && { opacity: 0.7 }]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerBtnText}>Daftar Sekarang</Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Sudah punya akun? </Text>
              <TouchableOpacity onPress={() => onNavigate('Login')}>
                <Text style={styles.loginLink}>Masuk di sini</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },

  headerSection: { alignItems: 'center', marginBottom: 28 },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff' },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },

  card: {
    backgroundColor: '#fff', borderRadius: 24, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12, shadowRadius: 24, elevation: 8
  },

  alertBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fca5a5',
    borderRadius: 10, padding: 10, marginBottom: 14
  },
  errorText: { color: '#ef4444', fontSize: 12, flex: 1 },

  label: { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 8 },
  labelHint: { fontWeight: '400', color: '#9ca3af' },

  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb',
    borderRadius: 12, marginBottom: 16, paddingRight: 12
  },
  inputIcon: { paddingHorizontal: 12 },
  input: { flex: 1, paddingVertical: 13, fontSize: 14, color: '#1f2937' },
  eyeBtn: { padding: 4 },

  emailRow: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 0 },
  otpBtn: {
    backgroundColor: '#059669', borderRadius: 12,
    paddingHorizontal: 12, height: 50,
    justifyContent: 'center', alignItems: 'center', minWidth: 80
  },
  otpBtnText: { color: '#fff', fontSize: 11, fontWeight: '700', textAlign: 'center' },

  registerBtn: {
    backgroundColor: '#059669', borderRadius: 12,
    paddingVertical: 15, alignItems: 'center', marginTop: 6,
    shadowColor: '#059669', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4
  },
  registerBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  loginText: { color: '#6b7280', fontSize: 13 },
  loginLink: { color: '#059669', fontSize: 13, fontWeight: '700' },
});

export default RegisterScreen;
