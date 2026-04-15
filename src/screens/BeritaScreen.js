import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Image, StatusBar, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import api from '../config/api';
import { useAppContext } from '../context/AppContext';

const BeritaScreen = ({ onNavigate }) => {
  const { user, themeColors } = useAppContext();
  const [berita, setBerita] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const isAdminOrStaff = user?.role === 'admin' || user?.role === 'staff';

  useEffect(() => {
    fetchBerita();
  }, []);

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

  const filteredBerita = berita.filter(b => 
    b?.judul?.toLowerCase()?.includes(search.toLowerCase())
  );

  // Fallback to absolute URLs or append to BASE_URL. Since we handle network errors too, default to picsum
  const getImageUrl = (path) => {
    if (!path) return 'https://picsum.photos/200/100?grayscale';
    if (path.startsWith('http')) return path;
    const baseUrl = api.defaults.baseURL?.replace('/api', '') || 'http://10.0.2.2:3001'; // Default emulator port
    return `${baseUrl}${path}`;
  };

  const handlePress = (item) => {
    if (item.link_url) {
      Linking.openURL(item.link_url).catch(err => console.error("Couldn't load page", err));
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={[styles.newsCard, { backgroundColor: themeColors.cardBg }]} activeOpacity={0.8} onPress={() => handlePress(item)}>
      <Image source={{ uri: getImageUrl(item.gambar) }} style={styles.newsImage} />
      <View style={styles.newsInfo}>
        <Text style={[styles.newsTitle, { color: themeColors.text }]} numberOfLines={4}>{item.judul}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('Home')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Berita Kampus</Text>
        {isAdminOrStaff ? (
          <TouchableOpacity
            onPress={() => onNavigate('AdminBerita')}
            style={styles.backBtn}
          >
            <Ionicons name="add" size={24} color={colors.white} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* Search */}
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
          ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 20, color: themeColors.textMuted}}>Berita tidak ditemukan.</Text>}
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
  
  topControls: { paddingHorizontal: 20, marginTop: -20 },
  searchBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, height: 46, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14 },
  
  listContent: { padding: 20, paddingBottom: 100 },
  newsCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  newsImage: { width: 100, height: 75, borderRadius: 8, marginRight: 12, backgroundColor: colors.gray200 },
  newsInfo: { flex: 1 },
  newsTitle: { fontSize: 12, fontWeight: '700', lineHeight: 18 },
});

export default BeritaScreen;
