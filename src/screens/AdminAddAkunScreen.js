import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import api from '../config/api';

const AdminAddAkunScreen = ({ onNavigate }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username || !email || !password) {
      Alert.alert("Error", "Semua kolom harus diisi.");
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/users', { username, email, password, role });
      if (response.data.success) {
        Alert.alert("Sukses", "Akun berhasil ditambahkan.");
        onNavigate('AdminAkun');
      }
    } catch (error) {
       Alert.alert("Error", error.response?.data?.message || "Gagal menambahkan akun.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('AdminAkun')} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tambahkan Akun</Text>
        <TouchableOpacity onPress={handleSubmit} style={styles.headerBtn} disabled={loading}>
           {loading ? <ActivityIndicator color={colors.white} size="small"/> : <Ionicons name="checkmark" size={24} color={colors.white} />}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Detail Akun</Text>

          <TextInput style={styles.input} placeholder="Username" placeholderTextColor={colors.gray400} value={username} onChangeText={setUsername}/>
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor={colors.gray400} keyboardType="email-address" value={email} onChangeText={setEmail}/>
          <TextInput style={styles.input} placeholder="Password" placeholderTextColor={colors.gray400} secureTextEntry value={password} onChangeText={setPassword}/>

          <Text style={styles.label}>Pilih Role</Text>
          <View style={styles.roleContainer}>
            {['user', 'admin', 'staff'].map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.roleBtn, role === r && styles.roleBtnActive]}
                onPress={() => setRole(r)}
              >
                <Text style={[styles.roleText, role === r && styles.roleTextActive]}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Masukkan Foto Profil</Text>
          <TouchableOpacity style={styles.uploadBox}>
             <Ionicons name="image-outline" size={40} color={colors.gray400} />
             <View style={styles.uploadIconBadge}>
                <Ionicons name="arrow-up" size={14} color={colors.white} />
             </View>
          </TouchableOpacity>
        </View>
        <View style={{height:40}}/>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { 
    backgroundColor: colors.primary, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingTop: 52, 
    paddingBottom: 24, 
    paddingHorizontal: 20, 
    borderBottomLeftRadius: 32, 
    borderBottomRightRadius: 32 
  },
  headerBtn: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: colors.white, fontSize: 18, fontWeight: '800' },
  
  content: { padding: 20 },
  formCard: { backgroundColor: colors.white, borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: colors.gray800, marginBottom: 16 },
  
  input: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray200, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: colors.gray800, marginBottom: 12 },
  label: { fontSize: 12, color: colors.gray400, marginTop: 4, marginBottom: 8 },
  
  roleContainer: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  roleBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.gray200, alignItems: 'center' },
  roleBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  roleText: { fontSize: 13, fontWeight: '600', color: colors.gray500 },
  roleTextActive: { color: colors.white },

  uploadBox: { height: 120, borderWidth: 1, borderColor: colors.gray200, borderStyle: 'dashed', borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gray50 },
  uploadIconBadge: { position: 'absolute', width: 24, height: 24, backgroundColor: '#ef4444', borderRadius: 12, alignItems: 'center', justifyContent: 'center', right: '40%', top: '35%' }
});

export default AdminAddAkunScreen;
