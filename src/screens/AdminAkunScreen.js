import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Image, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import { useAppContext } from '../context/AppContext';
import api from '../config/api';

const AdminAkunScreen = ({ onNavigate }) => {
  const { themeColors, user } = useAppContext();
  const [filter, setFilter] = useState('user');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      if (res.data?.success) {
        setUsers(res.data.data);
      }
    } catch (e) {
      console.error('Fetch users error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const handleDelete = (id_user) => {
    if (id_user === user.id_user) {
       Alert.alert('Gagal', 'Anda tidak bisa menghapus akun Anda sendiri.');
       return;
    }
    Alert.alert('Konfirmasi Hapus', 'Yakin ingin menghapus pengguna ini?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: async () => {
         try {
           const res = await api.delete(`/admin/users/${id_user}`);
           if (res.data?.success) {
              Alert.alert('Sukses', 'Akun berhasil dihapus');
              fetchUsers();
           }
         } catch (e) {
           Alert.alert('Error', e.response?.data?.error || 'Gagal menghapus pengguna.');
         }
      }}
    ]);
  };

  const filteredUsers = users.filter(u => {
    const matchRole = u.role === filter;
    const matchSearch = u.nama.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchRole && matchSearch;
  });

  const renderItem = ({ item }) => (
    <View style={[styles.userCard, { backgroundColor: themeColors.cardBg }]}>
      {item.foto_profil ? (
        <Image source={{ uri: item.foto_profil }} style={styles.userAvatar} />
      ) : (
        <View style={[styles.userAvatar, { backgroundColor: themeColors.background, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' }]}>
          <Ionicons name="person" size={24} color={themeColors.textMuted || '#9ca3af'} />
        </View>
      )}
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: themeColors.text }]}>{item.nama}</Text>
        <Text style={{ color: themeColors.textMuted, fontSize: 11, marginBottom: 4 }}>{item.email}</Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: '#10b981' }]} />
          <Text style={styles.statusText}>Aktif</Text>
        </View>
      </View>
      <View style={styles.actionBtns}>
        <TouchableOpacity style={[styles.btnSmall, { backgroundColor: colors.primary }]} onPress={() => onNavigate('AdminEditAkun', { userData: item })}>
          <Text style={styles.btnSmallText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btnSmall, { backgroundColor: '#ef4444' }]} onPress={() => handleDelete(item.id_user)}>
          <Text style={styles.btnSmallText}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('AdminHome')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manajemen Akun</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search & Add */}
      <View style={styles.topControls}>
        <View style={[styles.searchBox, { backgroundColor: themeColors.cardBg }]}>
          <Ionicons name="search" size={20} color={themeColors.textMuted} />
          <TextInput 
            style={[styles.searchInput, { color: themeColors.text }]} 
            placeholder="Cari Pengguna" 
            placeholderTextColor={themeColors.textMuted} 
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.tabRow}>
          {['user', 'staff', 'admin'].map(tab => (
            <TouchableOpacity key={tab} style={[styles.tabBtn, filter === tab && styles.tabBtnActive]} onPress={() => setFilter(tab)}>
              <Text style={[styles.tabText, filter === tab && styles.tabTextActive]}>{tab.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={{ padding: 20 }}><ActivityIndicator color={colors.primary} size="large" /></View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={item => item.id_user.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={{ textAlign: 'center', color: themeColors.textMuted, marginTop: 20 }}>Tidak ada data akun untuk peran ini.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  backBtn: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: colors.white, fontSize: 18, fontWeight: '800' },
  
  topControls: { paddingHorizontal: 20, marginTop: -15 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 12, paddingHorizontal: 12, height: 46, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: colors.gray800 },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: colors.white, fontSize: 12, fontWeight: '700', marginLeft: 4 },
  
  tabRow: { flexDirection: 'row', backgroundColor: 'transparent', borderRadius: 12, padding: 4, marginTop: 12 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabBtnActive: { backgroundColor: colors.primary + '20' },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.gray500 },
  tabTextActive: { color: colors.primary, fontWeight: '700' },
  
  listContent: { padding: 20, paddingBottom: 100 },
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 16, padding: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  userAvatar: { width: 50, height: 50, borderRadius: 8, marginRight: 12 },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '700', color: colors.gray800, marginBottom: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  statusText: { fontSize: 11, color: colors.gray500 },
  
  actionBtns: { gap: 6 },
  btnSmall: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, alignItems: 'center' },
  btnSmallText: { color: colors.white, fontSize: 11, fontWeight: '600' }
});

export default AdminAkunScreen;
