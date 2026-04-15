import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, StatusBar,
  Modal, ScrollView, Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppContext } from '../context/AppContext';
import api from '../config/api';

const MAX_ATTEMPTS = 3;

const LoginScreen = ({ onNavigate }) => {
  const { login } = useAppContext();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    setErrorMsg('');
    if (!username || !password) {
      setErrorMsg('Username/Email dan password wajib diisi.');
      shake();
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        username_or_email: username,
        password,
      });

      if (response.data.success) {
        const { token, user } = response.data.data;
        setFailCount(0);
        await login(user, token);
        if (user.role === 'admin') {
          onNavigate('AdminHome');
        } else {
          onNavigate('Home');
        }
      }
    } catch (error) {
      const newCount = failCount + 1;
      setFailCount(newCount);
      shake();

      if (error.response?.status === 401) {
        if (newCount >= MAX_ATTEMPTS) {
          setErrorMsg(`Password salah ${newCount}x. Akun diblokir sementara.`);
          setShowForgotModal(true);
        } else {
          setErrorMsg(`Username/Email atau password salah. (${newCount}/${MAX_ATTEMPTS})`);
        }
      } else {
        setErrorMsg('Gagal terhubung ke server. Coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#059669" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LinearGradient colors={['#059669', '#047857', '#065f46']} style={styles.gradient}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* TOP DECORATION */}
            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />

            {/* Logo */}
            <View style={styles.logoSection}>
              <View style={styles.logoCircle}>
                <Ionicons name="school" size={40} color="#fff" />
              </View>
              <Text style={styles.appName}>STIESNU</Text>
              <Text style={styles.appTagline}>Bengkulu</Text>
            </View>

            {/* Card */}
            <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}>
              <Text style={styles.cardTitle}>Selamat Datang</Text>
              <Text style={styles.cardSub}>Masuk ke akun Anda</Text>

              {errorMsg !== '' && (
                <View style={styles.alertBox}>
                  <Ionicons name="warning-outline" size={15} color="#ef4444" />
                  <Text style={styles.alertText}>{errorMsg}</Text>
                </View>
              )}

              {/* Username */}
              <Text style={styles.label}>Username / Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={18} color="#9ca3af" style={styles.ico} />
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan username atau email"
                  placeholderTextColor="#9ca3af"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  returnKeyType="next"
                />
              </View>

              {/* Password */}
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color="#9ca3af" style={styles.ico} />
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan password"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity onPress={() => setShowPass(p => !p)} style={styles.eyeBtn}>
                  <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9ca3af" />
                </TouchableOpacity>
              </View>

              {/* Forgot password link */}
              <TouchableOpacity
                style={styles.forgotLink}
                onPress={() => onNavigate('ForgotPassword')}
              >
                <Text style={styles.forgotLinkText}>Lupa Password?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.loginBtn, loading && { opacity: 0.75 }, failCount >= MAX_ATTEMPTS && { backgroundColor: '#6b7280' }]}
                onPress={failCount >= MAX_ATTEMPTS ? () => setShowForgotModal(true) : handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : failCount >= MAX_ATTEMPTS ? (
                  <Text style={styles.loginBtnText}>Akun Terblokir — Lupa Password?</Text>
                ) : (
                  <Text style={styles.loginBtnText}>Masuk</Text>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>atau</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Register link */}
              <View style={styles.registerRow}>
                <Text style={styles.registerText}>Belum punya akun? </Text>
                <TouchableOpacity onPress={() => onNavigate('Register')}>
                  <Text style={styles.registerLink}>Daftar Sekarang</Text>
                </TouchableOpacity>
              </View>

              {/* Guest access */}
              <TouchableOpacity style={styles.guestBtn} onPress={() => onNavigate('Home')}>
                <Ionicons name="eye-outline" size={14} color="#6b7280" />
                <Text style={styles.guestText}>Lanjut sebagai Tamu</Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>

      {/* Forgot Password modal — muncul setelah 3x gagal */}
      <Modal
        visible={showForgotModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowForgotModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconRow}>
              <View style={styles.modalIconBox}>
                <Ionicons name="lock-open-outline" size={32} color="#059669" />
              </View>
            </View>
            <Text style={styles.modalTitle}>Lupa Password?</Text>
            <Text style={styles.modalBody}>
              Anda telah {failCount}x salah memasukkan password. Apakah Anda ingin mereset password?
            </Text>
            <TouchableOpacity
              style={styles.modalBtnPrimary}
              onPress={() => {
                setShowForgotModal(false);
                onNavigate('ForgotPassword');
              }}
            >
              <Text style={styles.modalBtnPrimaryText}>Reset Password</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalBtnSecondary}
              onPress={() => {
                setShowForgotModal(false);
                setFailCount(0);
                setErrorMsg('');
              }}
            >
              <Text style={styles.modalBtnSecondaryText}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 },

  decorCircle1: {
    position: 'absolute', top: -60, right: -60,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  decorCircle2: {
    position: 'absolute', bottom: 120, left: -80,
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },

  logoSection: { alignItems: 'center', marginBottom: 32 },
  logoCircle: {
    width: 82, height: 82, borderRadius: 41,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
  },
  appName: { fontSize: 30, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  appTagline: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  card: {
    backgroundColor: '#fff', borderRadius: 28, padding: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15, shadowRadius: 30, elevation: 10,
  },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#1f2937', marginBottom: 4 },
  cardSub: { fontSize: 13, color: '#6b7280', marginBottom: 20 },

  alertBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fca5a5',
    borderRadius: 10, padding: 10, marginBottom: 16,
  },
  alertText: { color: '#dc2626', fontSize: 12, flex: 1 },

  label: { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f9fafb', borderWidth: 1.5, borderColor: '#e5e7eb',
    borderRadius: 14, marginBottom: 16, paddingRight: 12,
  },
  ico: { paddingHorizontal: 12 },
  input: { flex: 1, paddingVertical: 14, fontSize: 14, color: '#1f2937' },
  eyeBtn: { padding: 4 },

  forgotLink: { alignSelf: 'flex-end', marginTop: -8, marginBottom: 20 },
  forgotLinkText: { color: '#059669', fontSize: 12, fontWeight: '700' },

  loginBtn: {
    backgroundColor: '#059669', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
    shadowColor: '#059669', shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 5,
  },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e5e7eb' },
  dividerText: { fontSize: 12, color: '#9ca3af' },

  registerRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 12 },
  registerText: { color: '#6b7280', fontSize: 13 },
  registerLink: { color: '#059669', fontSize: 13, fontWeight: '700' },

  guestBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 8,
  },
  guestText: { color: '#6b7280', fontSize: 12 },

  // Modal styles
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalCard: {
    backgroundColor: '#fff', borderRadius: 24,
    padding: 28, width: '100%', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
  },
  modalIconRow: { marginBottom: 16 },
  modalIconBox: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: '#ecfdf5',
    alignItems: 'center', justifyContent: 'center',
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#1f2937', marginBottom: 8, textAlign: 'center' },
  modalBody: { fontSize: 13, color: '#6b7280', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  modalBtnPrimary: {
    backgroundColor: '#059669', borderRadius: 12,
    paddingVertical: 14, width: '100%', alignItems: 'center', marginBottom: 10,
  },
  modalBtnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  modalBtnSecondary: {
    backgroundColor: '#f3f4f6', borderRadius: 12,
    paddingVertical: 14, width: '100%', alignItems: 'center',
  },
  modalBtnSecondaryText: { color: '#374151', fontSize: 15, fontWeight: '600' },
});

export default LoginScreen;