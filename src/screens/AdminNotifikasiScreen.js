import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, ActivityIndicator, Alert, Modal, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../constants/colors';
import api from '../config/api';
import { useAppContext } from '../context/AppContext';
import { formatDateID } from '../utils/formatDate';

const AdminNotifikasiScreen = ({ onNavigate }) => {
  const { themeColors } = useAppContext();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [formJudul, setFormJudul] = useState('');
  const [formIsi, setFormIsi] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await api.get('/notifikasi');
      if (res.data?.success) {
        setNotifs(res.data.data.notifikasi || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifs();
  }, []);

  const openAdd = () => {
    setEditTarget(null);
    setFormJudul('');
    setFormIsi('');
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditTarget(item);
    setFormJudul(item.judul);
    setFormIsi(item.isi || '');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formJudul.trim()) {
      Alert.alert('Error', 'Judul notifikasi wajib diisi!');
      return;
    }
    setSaving(true);
    try {
      if (editTarget) {
        await api.put(`/notifikasi/${editTarget.id_notifikasi}`, {
          judul: formJudul,
          isi: formIsi,
        });
      } else {
        await api.post('/notifikasi', {
          judul: formJudul,
          isi: formIsi,
        });
      }
      setShowModal(false);
      fetchNotifs();
    } catch (e) {
      Alert.alert('Gagal', e.response?.data?.error || 'Terjadi kesalahan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item) => {
    Alert.alert(
      'Hapus Notifikasi',
      `Yakin ingin menghapus notifikasi "${item.judul}"? Notifikasi ini akan hilang dari semua pengguna.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus', style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/notifikasi/${item.id_notifikasi}`);
              fetchNotifs();
            } catch (e) {
              Alert.alert('Gagal', 'Tidak dapat menghapus notifikasi.');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateStr) => {
    try {
      return formatDateID(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header */}
      <LinearGradient colors={[colors.primary, colors.primaryMid]} style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('AdminHome')} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manajemen Notifikasi</Text>
        <TouchableOpacity onPress={openAdd} style={styles.headerBtn}>
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Removed Info Bar */}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 40 }} />
        ) : notifs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={64} color={themeColors.textMuted} />
            <Text style={[styles.emptyTitle, { color: themeColors.text }]}>Belum Ada Notifikasi</Text>
            <Text style={[styles.emptyDesc, { color: themeColors.textMuted }]}>
              Tekan tombol + untuk membuat notifikasi baru
            </Text>
          </View>
        ) : (
          notifs.map((item) => (
            <View key={item.id_notifikasi} style={[styles.card, { backgroundColor: themeColors.cardBg }]}>
              <View style={styles.cardIconWrap}>
                <Ionicons name="notifications" size={20} color={colors.primary} />
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: themeColors.text }]} numberOfLines={2}>
                  {item.judul}
                </Text>
                {item.isi ? (
                  <Text style={[styles.cardIsi, { color: themeColors.textMuted }]} numberOfLines={2}>
                    {item.isi}
                  </Text>
                ) : null}
                <Text style={[styles.cardDate, { color: themeColors.textMuted }]}>
                  {formatDate(item.createdAt)}
                </Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => openEdit(item)} style={[styles.actionBtn, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="pencil" size={16} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item)} style={[styles.actionBtn, { backgroundColor: '#ef444415' }]}>
                  <Ionicons name="trash" size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} onPress={openAdd}>
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>

      {/* Add / Edit Modal */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: themeColors.cardBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.text }]}>
                {editTarget ? 'Edit Notifikasi' : 'Notifikasi Baru'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={themeColors.textMuted} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.inputField, { backgroundColor: themeColors.background, color: themeColors.text, borderColor: colors.gray200 }]}
              placeholder="Judul Notifikasi *"
              placeholderTextColor={themeColors.textMuted}
              value={formJudul}
              onChangeText={setFormJudul}
            />
            <TextInput
              style={[styles.inputField, styles.textArea, { backgroundColor: themeColors.background, color: themeColors.text, borderColor: colors.gray200 }]}
              placeholder="Isi / Pesan (opsional)"
              placeholderTextColor={themeColors.textMuted}
              value={formIsi}
              onChangeText={setFormIsi}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.saveBtnText}>{editTarget ? 'Simpan Perubahan' : 'Kirim Notifikasi'}</Text>
              }
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  headerBtn: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: colors.white, fontSize: 18, fontWeight: '800' },

  infoBar: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20, marginTop: 16, borderRadius: 12, padding: 12 },
  infoText: { fontSize: 12, flex: 1 },

  content: { padding: 20 },

  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  emptyDesc: { fontSize: 13, textAlign: 'center', lineHeight: 20 },

  card: {
    flexDirection: 'row', alignItems: 'flex-start', borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
  },
  cardIconWrap: {
    width: 42, height: 42, borderRadius: 12, backgroundColor: colors.primary + '15',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  cardIsi: { fontSize: 12, marginBottom: 6, lineHeight: 18 },
  cardDate: { fontSize: 11 },
  cardActions: { flexDirection: 'column', gap: 8, marginLeft: 8 },
  actionBtn: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },

  fab: {
    position: 'absolute', bottom: 28, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalCard: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800' },

  inputField: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, marginBottom: 14 },
  textArea: { height: 100, textAlignVertical: 'top' },

  saveBtn: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  saveBtnText: { color: colors.white, fontSize: 15, fontWeight: '700' },
});

export default AdminNotifikasiScreen;
