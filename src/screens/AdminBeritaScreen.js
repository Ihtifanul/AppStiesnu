import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Image, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import { useAppContext } from '../context/AppContext';
import api from '../config/api';

const AdminBeritaScreen = ({ onNavigate }) => {
  const { themeColors, user } = useAppContext();
  const [berita, setBerita] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchBerita = async () => {
    try {
      const response = await api.get('/berita');
      if (response.data?.success) {
        setBerita(response.data.data.berita || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBerita();
  }, []);

  const handleDelete = (id_berita) => {
    Alert.alert('Konfirmasi Hapus', 'Yakin ingin menghapus berita ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus', style: 'destructive', onPress: async () => {
          try {
            const res = await api.delete(`/berita/${id_berita}`);
            if (res.data?.success) {
              Alert.alert('Sukses', 'Berita berhasil dihapus');
              fetchBerita();
            }
          } catch (e) {
            Alert.alert('Error', e.response?.data?.error || 'Gagal menghapus berita.');
          }
        }
      }
    ]);
  };

  const getImageUrl = (path) => {
    if (!path) return 'https://picsum.photos/200/100?grayscale';
    if (path.startsWith('http') || path.startsWith('data:image/')) return path;
    const baseUrl = api.defaults.baseURL?.replace('/api', '') || 'http://10.0.2.2:3001';
    return `${baseUrl}${path}`;
  };

  const filteredBerita = berita.filter(b =>
    b?.judul?.toLowerCase()?.includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <View style={[styles.newsCard, { backgroundColor: themeColors.cardBg }]}>
      <Image source={{ uri: getImageUrl(item.gambar) }} style={styles.newsImage} />
      <View style={styles.newsInfo}>
        <Text style={[styles.newsTitle, { color: themeColors.text }]} numberOfLines={3}>{item.judul}</Text>
        <View style={styles.actionBtns}>
          <TouchableOpacity style={[styles.btnSmall, { backgroundColor: colors.primary }]} onPress={() => onNavigate('AdminEditBerita', { beritaData: item })}>
            <Text style={styles.btnSmallText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnSmall, { backgroundColor: '#ef4444' }]} onPress={() => handleDelete(item.id_berita)}>
            <Text style={styles.btnSmallText}>Hapus</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate(user?.role === 'admin' ? 'AdminHome' : 'Home')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manajemen Berita</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search & Add */}
      <View style={styles.topControls}>
        <View style={[styles.searchBox, { backgroundColor: themeColors.cardBg }]}>
          <Ionicons name="search" size={20} color={themeColors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: themeColors.text }]}
            placeholder="Cari Berita"
            placeholderTextColor={themeColors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <View style={{ alignItems: 'center', marginVertical: 12 }}>
          <TouchableOpacity style={styles.addBtn} onPress={() => onNavigate('AdminAddBerita')}>
            <Ionicons name="add" size={16} color={colors.white} />
            <Text style={styles.addBtnText}>Tambahkan Berita</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredBerita}
          keyExtractor={item => item.id_berita.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: themeColors.textMuted }}>Tidak ada berita.</Text>}
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

  listContent: { padding: 20, paddingBottom: 100 },
  newsCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 12, padding: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  newsImage: { width: 100, height: 75, borderRadius: 8, marginRight: 12, backgroundColor: colors.gray200 },
  newsInfo: { flex: 1 },
  newsTitle: { fontSize: 12, fontWeight: '700', color: colors.gray800, lineHeight: 18 },

  actionBtns: { flexDirection: 'row', gap: 6, marginTop: 8 },
  btnSmall: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, alignItems: 'center' },
  btnSmallText: { color: colors.white, fontSize: 11, fontWeight: '600' }
});

export default AdminBeritaScreen;
