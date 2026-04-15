import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../config/api';

const ForgotPasswordScreen = ({ onNavigate }) => {
  const [step, setStep] = useState(1); // 1 = masukkan email, 2 = masukkan OTP + password baru
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRequestOtp = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!email) {
      setErrorMsg('Email wajib diisi');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { step: 'request', email });
      if (res.data?.success) {
        setSuccessMsg('Kode OTP telah dikirim ke email Anda. Berlaku 10 menit.');
        setStep(2);
      }
    } catch (e) {
      setErrorMsg(e.response?.data?.error || 'Gagal mengirim OTP. Periksa email Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!otp || !newPassword || !confirmPassword) {
      setErrorMsg('Semua field wajib diisi');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('Password minimal 6 karakter');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', {
        step: 'reset',
        email,
        otp,
        newPassword,
        confirmPassword
      });
      if (res.data?.success) {
        setSuccessMsg('Password berhasil direset!');
        setTimeout(() => onNavigate('Login'), 1500);
      }
    } catch (e) {
      setErrorMsg(e.response?.data?.error || 'Gagal mereset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor="#059669" />
      <LinearGradient colors={['#059669', '#047857']} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <TouchableOpacity style={styles.backBtn} onPress={() => (step === 2 ? setStep(1) : onNavigate('Login'))}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerSection}>
            <View style={styles.iconCircle}>
              <Ionicons name="lock-open-outline" size={36} color="#fff" />
            </View>
            <Text style={styles.headerTitle}>Lupa Password</Text>
            <Text style={styles.headerSub}>
              {step === 1
                ? 'Masukkan email Anda untuk menerima kode OTP'
                : `OTP dikirim ke ${email}`}
            </Text>
          </View>

          {/* Steps indicator */}
          <View style={styles.stepRow}>
            <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]}>
              <Text style={[styles.stepNum, step >= 1 && { color: '#059669' }]}>1</Text>
            </View>
            <View style={[styles.stepLine, step === 2 && styles.stepLineActive]} />
            <View style={[styles.stepDot, step === 2 && styles.stepDotActive]}>
              <Text style={[styles.stepNum, step === 2 && { color: '#059669' }]}>2</Text>
            </View>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {errorMsg !== '' && (
              <View style={styles.alertError}>
                <Ionicons name="alert-circle" size={16} color="#ef4444" />
                <Text style={styles.alertErrorText}>{errorMsg}</Text>
              </View>
            )}
            {successMsg !== '' && (
              <View style={styles.alertSuccess}>
                <Ionicons name="checkmark-circle" size={16} color="#059669" />
                <Text style={styles.alertSuccessText}>{successMsg}</Text>
              </View>
            )}

            {step === 1 ? (
              <>
                <Text style={styles.label}>Alamat Email</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="mail-outline" size={18} color="#9ca3af" style={styles.ico} />
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
                  style={[styles.btn, loading && { opacity: 0.7 }]}
                  onPress={handleRequestOtp}
                  disabled={loading}
                >
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.btnText}>Kirim Kode OTP</Text>}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.label}>Kode OTP</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="shield-checkmark-outline" size={18} color="#9ca3af" style={styles.ico} />
                  <TextInput
                    style={styles.input}
                    placeholder="Kode 6 digit dari email"
                    placeholderTextColor="#9ca3af"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                  />
                </View>

                <Text style={styles.label}>Password Baru <Text style={styles.hint}>(min. 6 karakter)</Text></Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="lock-closed-outline" size={18} color="#9ca3af" style={styles.ico} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password baru"
                    placeholderTextColor="#9ca3af"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showPass}
                  />
                  <TouchableOpacity onPress={() => setShowPass(p => !p)} style={styles.eyeBtn}>
                    <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9ca3af" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>Konfirmasi Password Baru</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="lock-closed-outline" size={18} color="#9ca3af" style={styles.ico} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ulangi password baru"
                    placeholderTextColor="#9ca3af"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPass}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPass(p => !p)} style={styles.eyeBtn}>
                    <Ionicons name={showConfirmPass ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9ca3af" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.btn, loading && { opacity: 0.7 }]}
                  onPress={handleReset}
                  disabled={loading}
                >
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.btnText}>Reset Password</Text>}
                </TouchableOpacity>

                <TouchableOpacity style={{ marginTop: 12 }} onPress={() => { setStep(1); setErrorMsg(''); }}>
                  <Text style={styles.resendText}>Tidak menerima OTP? Kirim ulang</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity style={{ marginTop: 20 }} onPress={() => onNavigate('Login')}>
              <Text style={styles.backToLogin}>← Kembali ke Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 56, paddingBottom: 40 },

  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },

  headerSection: { alignItems: 'center', marginBottom: 24 },
  iconCircle: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 6, textAlign: 'center', lineHeight: 20 },

  stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  stepDot: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center'
  },
  stepDotActive: { backgroundColor: '#fff' },
  stepNum: { fontSize: 14, fontWeight: '800', color: 'rgba(255,255,255,0.6)' },
  stepLine: { width: 40, height: 2, backgroundColor: 'rgba(255,255,255,0.25)', marginHorizontal: 8 },
  stepLineActive: { backgroundColor: '#fff' },

  card: {
    backgroundColor: '#fff', borderRadius: 24, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12, shadowRadius: 24, elevation: 8,
  },

  alertError: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fca5a5',
    borderRadius: 10, padding: 10, marginBottom: 14,
  },
  alertErrorText: { color: '#ef4444', fontSize: 12, flex: 1 },
  alertSuccess: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#ecfdf5', borderWidth: 1, borderColor: '#6ee7b7',
    borderRadius: 10, padding: 10, marginBottom: 14,
  },
  alertSuccessText: { color: '#059669', fontSize: 12, flex: 1 },

  label: { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 8 },
  hint: { fontWeight: '400', color: '#9ca3af' },

  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb',
    borderRadius: 12, marginBottom: 16, paddingRight: 12,
  },
  ico: { paddingHorizontal: 12 },
  input: { flex: 1, paddingVertical: 13, fontSize: 14, color: '#1f2937' },
  eyeBtn: { padding: 4 },

  btn: {
    backgroundColor: '#059669', borderRadius: 12,
    paddingVertical: 15, alignItems: 'center', marginTop: 4,
    shadowColor: '#059669', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  resendText: { color: '#059669', textAlign: 'center', fontSize: 13, fontWeight: '600' },
  backToLogin: { color: '#6b7280', textAlign: 'center', fontSize: 13 },
});

export default ForgotPasswordScreen;
