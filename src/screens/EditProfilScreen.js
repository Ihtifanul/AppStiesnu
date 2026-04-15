import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, ScrollView,
  StatusBar, Alert, ActivityIndicator, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import colors from '../constants/colors';
import { useAppContext } from '../context/AppContext';
import api from '../config/api';

const EditProfilScreen = ({ onNavigate }) => {
  const { user, login, token, themeColors } = useAppContext();
  const [passModalVisible, setPassModalVisible] = useState(false);

  const [nama, setNama] = useState(user.nama || user.username || '');
  const [fotoProfil, setFotoProfil] = useState(user.foto_profil || null);
  const [fotoMode, setFotoMode] = useState('app'); // 'app' = kamera/galeri, 'url' = tautan

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');

  const handlePickImage = () => {
    Alert.alert('Pilih Foto Profil', 'Pilih sumber gambar', [
      { text: 'Kamera', onPress: () => openImagePicker(true) },
      { text: 'Galeri', onPress: () => openImagePicker(false) },
      { text: 'Batal', style: 'cancel' },
    ]);
  };

  const openImagePicker = async (useCamera) => {
    const options = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    };
    let result;
    if (useCamera) {
      await ImagePicker.requestCameraPermissionsAsync();
      result = await ImagePicker.launchCameraAsync(options);
    } else {
      await ImagePicker.requestMediaLibraryPermissionsAsync();
      result = await ImagePicker.launchImageLibraryAsync(options);
    }
    if (!result.canceled && result.assets?.[0]?.base64) {
      setFotoProfil('data:image/jpeg;base64,' + result.assets[0].base64);
    }
  };

  const handleSaveProfile = async () => {
    if (!nama.trim()) {
      Alert.alert('Error', 'Nama tidak boleh kosong');
      return;
    }
    setLoading(true);
    try {
      const payload = { nama: nama.trim() };
      if (fotoProfil && fotoProfil !== user.foto_profil) {
        payload.foto_profil = fotoProfil;
      }
      const res = await api.put('/user/profile', payload);
      if (res.data?.success) {
        const updated = res.data.data;
        // Perbarui context dengan data terbaru dari server
        await login(
          {
            ...user,
            nama: updated?.nama || nama,
            foto_profil: updated?.foto_profil || fotoProfil,
          },
          token
        );
        Alert.alert('Sukses', 'Profil berhasil diperbarui!', [
          { text: 'OK', onPress: () => onNavigate('Menu') },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Gagal mengubah profil.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setPassError('');
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPassError('Semua field wajib diisi');
      return;
    }
    if (newPassword.length < 6) {
      setPassError('Password baru minimal 6 karakter');
      return;
    }
    if (newPassword === oldPassword) {
      setPassError('Password baru tidak boleh sama dengan password lama');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('Password baru dan konfirmasi tidak cocok');
      return;
    }
    setPassLoading(true);
    try {
      const res = await api.put('/user/profile', { oldPassword, password: newPassword });
      if (res.data?.success) {
        Alert.alert('Sukses', 'Password berhasil diubah!');
        setPassModalVisible(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      setPassError(error.response?.data?.error || 'Password lama salah');
    } finally {
      setPassLoading(false);
    }
  };

  const currentPhoto = fotoProfil || null;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('Menu')} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profil</Text>
        <TouchableOpacity onPress={handleSaveProfile} style={styles.headerBtn} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Ionicons name="checkmark" size={24} color={colors.white} />}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar Preview */}
        <View style={styles.avatarSection}>
          {currentPhoto ? (
            <Image source={{ uri: currentPhoto }} style={styles.avatarImg} />
          ) : (
            <View style={[styles.avatarImg, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={48} color={colors.gray400} />
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={[styles.label, { color: themeColors.text }]}>Username / Nama</Text>
          <TextInput
            style={[styles.input, { backgroundColor: themeColors.cardBg, color: themeColors.text }]}
            value={nama}
            onChangeText={setNama}
            placeholder="Nama Anda"
            placeholderTextColor={colors.gray400}
          />

          {/* Foto Profil */}
          <Text style={[styles.label, { color: themeColors.text }]}>Foto Profil</Text>

          {/* Mode selector */}
          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[styles.modeBtn, fotoMode === 'app' && styles.modeBtnActive]}
              onPress={() => setFotoMode('app')}
            >
              <Ionicons name="camera-outline" size={14} color={fotoMode === 'app' ? colors.white : colors.primary} />
              <Text style={[styles.modeBtnText, fotoMode === 'app' && { color: colors.white }]}>Kamera / Galeri</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeBtn, fotoMode === 'url' && styles.modeBtnActive]}
              onPress={() => setFotoMode('url')}
            >
              <Ionicons name="link-outline" size={14} color={fotoMode === 'url' ? colors.white : colors.primary} />
              <Text style={[styles.modeBtnText, fotoMode === 'url' && { color: colors.white }]}>Tautan URL</Text>
            </TouchableOpacity>
          </View>

          {fotoMode === 'app' ? (
            <TouchableOpacity style={styles.uploadBox} onPress={handlePickImage}>
              <Ionicons name="image-outline" size={32} color={colors.gray400} />
              <Text style={{ color: colors.gray400, marginTop: 6, fontSize: 13 }}>Ketuk untuk pilih foto</Text>
            </TouchableOpacity>
          ) : (
            <TextInput
              style={[styles.input, { backgroundColor: themeColors.cardBg, color: themeColors.text }]}
              value={typeof fotoProfil === 'string' && fotoProfil.startsWith('http') ? fotoProfil : ''}
              onChangeText={(text) => setFotoProfil(text)}
              placeholder="https://contoh.com/foto.jpg"
              placeholderTextColor={colors.gray400}
              autoCapitalize="none"
              keyboardType="url"
            />
          )}

          <TouchableOpacity style={styles.changePassBtn} onPress={() => setPassModalVisible(true)}>
            <Ionicons name="lock-closed-outline" size={16} color={colors.white} style={{ marginRight: 6 }} />
            <Text style={styles.changePassBtnText}>Ubah Password</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Password Modal */}
      <Modal animationType="fade" transparent visible={passModalVisible} onRequestClose={() => setPassModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: themeColors.cardBg }]}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>Ubah Password</Text>
            {passError ? (
              <View style={styles.alertBox}>
                <Ionicons name="alert-circle" size={14} color="#ef4444" />
                <Text style={styles.alertText}>{passError}</Text>
              </View>
            ) : null}

            {[
              { label: 'Password Lama', val: oldPassword, set: setOldPassword, show: showOld, toggle: setShowOld },
              { label: 'Password Baru (min. 6 karakter)', val: newPassword, set: setNewPassword, show: showNew, toggle: setShowNew },
              { label: 'Ulangi Password Baru', val: confirmPassword, set: setConfirmPassword, show: showConfirm, toggle: setShowConfirm },
            ].map(({ label, val, set, show, toggle }) => (
              <View key={label}>
                <Text style={[styles.modalLabel, { color: themeColors.text }]}>{label}</Text>
                <View style={[styles.passRow, { backgroundColor: themeColors.background }]}>
                  <TextInput
                    style={[styles.passInput, { color: themeColors.text }]}
                    placeholder={label}
                    placeholderTextColor={colors.gray400}
                    secureTextEntry={!show}
                    value={val}
                    onChangeText={set}
                  />
                  <TouchableOpacity onPress={() => toggle(p => !p)} style={{ padding: 8 }}>
                    <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={16} color={colors.gray400} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <TouchableOpacity style={styles.modalBtn} onPress={handleChangePassword} disabled={passLoading}>
              {passLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>Simpan Password</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary, marginTop: 8 }]}
              onPress={() => { setPassModalVisible(false); setPassError(''); }}
            >
              <Text style={[styles.modalBtnText, { color: colors.primary }]}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingTop: 52, paddingBottom: 24,
    paddingHorizontal: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32
  },
  headerBtn: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: colors.white, fontSize: 18, fontWeight: '800' },

  avatarSection: { alignItems: 'center', paddingTop: 28, paddingBottom: 8 },
  avatarImg: { width: 96, height: 96, borderRadius: 48, borderWidth: 3, borderColor: colors.primary },
  avatarPlaceholder: { backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' },

  scroll: { flex: 1 },
  content: { padding: 24 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: colors.gray200, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, marginBottom: 20 },

  modeRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  modeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.primary },
  modeBtnActive: { backgroundColor: colors.primary },
  modeBtnText: { fontSize: 12, fontWeight: '600', color: colors.primary },

  uploadBox: { height: 100, borderWidth: 1, borderColor: colors.gray200, borderStyle: 'dashed', borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gray50, marginBottom: 20 },

  changePassBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, alignSelf: 'flex-start', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  changePassBtnText: { color: colors.white, fontSize: 13, fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 16, fontWeight: '800', marginBottom: 16, textAlign: 'center' },
  alertBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fef2f2', borderRadius: 8, padding: 10, marginBottom: 12 },
  alertText: { color: '#ef4444', fontSize: 12, flex: 1 },
  modalLabel: { fontSize: 12, fontWeight: '700', marginBottom: 6 },
  passRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.gray200, borderRadius: 8, marginBottom: 14, paddingRight: 8 },
  passInput: { flex: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
  modalBtn: { backgroundColor: colors.primary, alignItems: 'center', paddingVertical: 13, borderRadius: 10, marginTop: 6 },
  modalBtnText: { color: colors.white, fontSize: 14, fontWeight: '700' },
});

export default EditProfilScreen;
