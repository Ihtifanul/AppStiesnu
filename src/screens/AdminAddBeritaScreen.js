import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, StatusBar, ActivityIndicator, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import colors from '../constants/colors';
import api from '../config/api';
import { useAppContext } from '../context/AppContext';

const AdminAddBeritaScreen = ({ onNavigate }) => {
  const { themeColors, user } = useAppContext();
  const returnRoute = user.role === 'admin' ? 'AdminBerita' : 'Berita';
  
  const [judul, setJudul] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  
  const [gambarUrl, setGambarUrl] = useState('');
  const [gambarMode, setGambarMode] = useState('app'); // 'app' atau 'url'
  
  const [loading, setLoading] = useState(false);

  const handlePickImage = () => {
    Alert.alert('Pilih Gambar', 'Pilih sumber gambar', [
      { text: 'Kamera', onPress: () => openImagePicker(true) },
      { text: 'Galeri', onPress: () => openImagePicker(false) },
      { text: 'Batal', style: 'cancel' },
    ]);
  };

  const openImagePicker = async (useCamera) => {
    const options = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
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
      setGambarUrl('data:image/jpeg;base64,' + result.assets[0].base64);
    }
  };

  const currentPreview = gambarUrl || null;

  const handleSave = async () => {
    if (!judul || !linkUrl) {
      Alert.alert('Error', 'Judul dan Tautan wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        judul,
        link_url: linkUrl,
        gambar: gambarUrl || 'https://picsum.photos/400/200' 
      };

      const res = await api.post('/berita/create', payload);
      if (res.data?.success) {
        Alert.alert('Sukses', 'Berita berhasil dicatat!', [
          { text: 'OK', onPress: () => onNavigate(returnRoute) }
        ]);
      } else {
         Alert.alert('Gagal', 'Tidak berhasil merekam berita.');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', e.response?.data?.error || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate(returnRoute)} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tambahkan Berita</Text>
        <TouchableOpacity onPress={handleSave} style={styles.headerBtn} disabled={loading}>
           {loading ? <ActivityIndicator color="#fff" /> : <Ionicons name="checkmark" size={24} color={colors.white} />}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.formCard, { backgroundColor: themeColors.cardBg }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Detail Berita</Text>

          <TextInput 
            style={[styles.input, { backgroundColor: themeColors.cardBg, color: themeColors.text }]} 
            placeholder="Judul Berita" 
            placeholderTextColor={themeColors.textMuted} 
            value={judul}
            onChangeText={setJudul}
          />
          <TextInput 
            style={[styles.input, { backgroundColor: themeColors.cardBg, color: themeColors.text }]} 
            placeholder="Tautan Berita (Contoh: https://...)" 
            placeholderTextColor={themeColors.textMuted} 
            autoCapitalize="none"
            value={linkUrl}
            onChangeText={setLinkUrl}
          />
          
          <Text style={[styles.label, { color: themeColors.text }]}>Gambar Thumbnail (Opsional)</Text>

          {/* Mode Selector */}
          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[styles.modeBtn, gambarMode === 'app' && styles.modeBtnActive]}
              onPress={() => setGambarMode('app')}
            >
              <Ionicons name="camera-outline" size={14} color={gambarMode === 'app' ? colors.white : colors.primary} />
              <Text style={[styles.modeBtnText, gambarMode === 'app' && { color: colors.white }]}>Kamera / Galeri</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeBtn, gambarMode === 'url' && styles.modeBtnActive]}
              onPress={() => setGambarMode('url')}
            >
              <Ionicons name="link-outline" size={14} color={gambarMode === 'url' ? colors.white : colors.primary} />
              <Text style={[styles.modeBtnText, gambarMode === 'url' && { color: colors.white }]}>Tautan URL</Text>
            </TouchableOpacity>
          </View>

          {gambarMode === 'app' ? (
            <TouchableOpacity style={styles.uploadBox} onPress={handlePickImage}>
              {currentPreview ? (
                <Image source={{ uri: currentPreview }} style={styles.previewImageCover} />
              ) : (
                <>
                  <Ionicons name="image-outline" size={32} color={colors.gray400} />
                  <Text style={{ color: colors.gray400, marginTop: 6, fontSize: 13 }}>Ketuk untuk pilih foto</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <>
              <TextInput 
                style={[styles.input, { backgroundColor: themeColors.cardBg, color: themeColors.text }]} 
                placeholder="https://..." 
                placeholderTextColor={themeColors.textMuted} 
                autoCapitalize="none"
                value={typeof gambarUrl === 'string' && gambarUrl.startsWith('http') ? gambarUrl : ''}
                onChangeText={setGambarUrl}
              />
              {currentPreview && currentPreview.startsWith('http') && (
                <View style={styles.uploadBox}>
                  <Image source={{ uri: currentPreview }} style={styles.previewImageCover} />
                </View>
              )}
            </>
          )}

        </View>
        <View style={{ height: 40 }} />
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
  sectionTitle: { fontSize: 14, fontWeight: '800', marginBottom: 16 },
  
  input: { borderWidth: 1, borderColor: colors.gray200, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, marginBottom: 16 },
  label: { fontSize: 12, marginBottom: 8, fontWeight: '700' },

  modeRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  modeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.primary },
  modeBtnActive: { backgroundColor: colors.primary },
  modeBtnText: { fontSize: 12, fontWeight: '600', color: colors.primary },

  uploadBox: { height: 160, borderWidth: 1, borderColor: colors.gray200, borderStyle: 'dashed', borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gray50, marginBottom: 16, overflow: 'hidden' },
  previewImageCover: { width: '100%', height: '100%', resizeMode: 'cover' },
});

export default AdminAddBeritaScreen;
