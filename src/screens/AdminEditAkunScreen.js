import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, StatusBar, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import api from '../config/api';
import { useAppContext } from '../context/AppContext';

const AdminEditAkunScreen = ({ routeParams, onNavigate }) => {
  const userData = routeParams?.userData || {};
  const { themeColors } = useAppContext();
  
  const [nama, setNama] = useState(userData.nama || '');
  const [email, setEmail] = useState(userData.email || '');
  const [role, setRole] = useState(userData.role || 'user');

  const [password, setPassword] = useState(''); // Optional to update

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!nama || !email || !role) {
      Alert.alert('Error', 'Nama, email, dan peran wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nama,
        email,
        role
      };
      if (password) {
         payload.password = password;
      }
      const res = await api.put(`/admin/users/${userData.id_user}`, payload);
      
      if (res.data?.success) {
        Alert.alert('Sukses', 'Akun berhasil diperbarui!', [
          { text: 'OK', onPress: () => onNavigate('AdminAkun') }
        ]);
      } else {
        Alert.alert('Gagal', 'Tidak berhasil mengubah akun.');
      }
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('AdminAkun')} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Akun</Text>
        <TouchableOpacity onPress={handleSave} style={styles.headerBtn} disabled={loading}>
           {loading ? <ActivityIndicator color="#fff" /> : <Ionicons name="checkmark" size={24} color={colors.white} />}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.formCard, { backgroundColor: themeColors.cardBg }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Informasi Pengguna</Text>

          <Text style={[styles.label, { color: themeColors.text }]}>Nama Lengkap</Text>
          <TextInput 
            style={[styles.input, { backgroundColor: themeColors.cardBg, color: themeColors.text }]} 
            placeholder="John Doe" 
            placeholderTextColor={themeColors.textMuted} 
            value={nama}
            onChangeText={setNama}
          />
          
          <Text style={[styles.label, { color: themeColors.text }]}>Email</Text>
          <TextInput 
            style={[styles.input, { backgroundColor: themeColors.cardBg, color: themeColors.text }]} 
            placeholder="email@example.com" 
            placeholderTextColor={themeColors.textMuted} 
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={[styles.label, { color: themeColors.text }]}>Peran (Role)</Text>
          <View style={styles.roleContainer}>
             {['user', 'staff', 'admin'].map(r => (
               <TouchableOpacity 
                 key={r} 
                 style={[styles.roleBtn, role === r && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                 onPress={() => setRole(r)}
               >
                 <Text style={[styles.roleText, role === r && { color: colors.white }]}>{r.toUpperCase()}</Text>
               </TouchableOpacity>
             ))}
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 20, color: themeColors.text }]}>Keamanan</Text>
          <Text style={[styles.label, { color: themeColors.text }]}>Password Baru (Opsional)</Text>
          <TextInput 
            style={[styles.input, { backgroundColor: themeColors.cardBg, color: themeColors.text }]} 
            placeholder="Kosongkan jika tidak ingin diubah" 
            placeholderTextColor={themeColors.textMuted} 
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headerBtn: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: colors.white, fontSize: 18, fontWeight: '800' },
  
  content: { padding: 20 },
  formCard: { backgroundColor: colors.white, borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: colors.gray800, marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', color: colors.gray600, marginBottom: 8 },
  input: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray200, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: colors.gray800, marginBottom: 16 },
  
  roleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, gap: 10 },
  roleBtn: { flex: 1, paddingVertical: 12, borderWidth: 1, borderColor: colors.gray300, borderRadius: 8, alignItems: 'center' },
  roleText: { fontSize: 12, fontWeight: '700', color: colors.gray500 },
  
  inputIconWrapper: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 14, borderRadius: 8, marginBottom: 16 },
  inputIcon: { position: 'absolute', right: 14 },
});

export default AdminEditAkunScreen;
