import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, StatusBar, Modal, Alert, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import colors from '../constants/colors';
import { useAppContext } from '../context/AppContext';
import api from '../config/api';

const COLOR_OPTIONS = [
  '#059669', '#ef4444', '#f59e0b', '#3b82f6',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
  '#6366f1', '#10b981', '#64748b', '#1e293b',
];

const PENGULANGAN_OPTIONS = [
  { id: 'sekali',   label: 'Hanya Sekali' },
  { id: 'harian',   label: 'Harian' },
  { id: 'mingguan', label: 'Mingguan' },
  { id: 'bulanan',  label: 'Bulanan' },
  { id: 'tahunan',  label: 'Tahunan' },
];

const UserAddEventScreen = ({ onNavigate }) => {
  const { themeColors } = useAppContext();
  const [subject, setSubject] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [dateFrom, setDateFrom] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pengulangan, setPengulangan] = useState('sekali');
  const [warnaKegiatan, setWarnaKegiatan] = useState('#059669');
  const [showPengulanganPicker, setShowPengulanganPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!subject.trim()) {
      Alert.alert('Error', 'Nama Kegiatan harus diisi!');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/jadwal', {
        nama_kegiatan: subject,
        deskripsi_kegiatan: deskripsi,
        waktu_kegiatan: dateFrom.toISOString(),
        tanggal_kegiatan: dateFrom.toISOString(),
        pengulangan: pengulangan,
        warna_kegiatan: warnaKegiatan,
      });
      if (res.data?.success) {
        Alert.alert('Sukses', 'Jadwal berhasil ditambahkan!', [
          { text: 'OK', onPress: () => onNavigate('Jadwal') },
        ]);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', e.response?.data?.error || 'Gagal menyimpan jadwal.');
    } finally {
      setLoading(false);
    }
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(dateFrom);
      newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setDateFrom(newDate);
      if (Platform.OS === 'android') {
        setTimeout(() => setShowTimePicker(true), 300);
      } else {
        setShowTimePicker(true);
      }
    }
  };

  const onChangeTime = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(dateFrom);
      newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      setDateFrom(newDate);
    }
  };

  const safeFormatDate = (d) => {
    try {
      const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} · ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch {
      return 'Pilih tanggal & waktu';
    }
  };

  const selectedOpt = PENGULANGAN_OPTIONS.find(o => o.id === pengulangan);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('Jadwal')} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tambahkan Jadwal</Text>
        <TouchableOpacity onPress={handleSave} style={styles.headerBtn} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Ionicons name="checkmark" size={24} color={colors.white} />}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.formCard, { backgroundColor: themeColors.cardBg }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Detail Jadwal</Text>

          {/* Nama */}
          <TextInput
            style={[styles.input, { backgroundColor: themeColors.cardBg, color: themeColors.text }]}
            placeholder="Nama Kegiatan (Cth: Kelas Makro / Belajar)"
            placeholderTextColor={themeColors.textMuted}
            value={subject}
            onChangeText={setSubject}
          />

          {/* Tanggal & Waktu */}
          <Text style={[styles.label, { color: themeColors.text }]}>Tanggal & Waktu Kegiatan</Text>
          <TouchableOpacity
            style={[styles.inputIconWrapper, { borderColor: colors.gray200, backgroundColor: themeColors.cardBg }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={18} color={themeColors.textMuted} style={{ marginRight: 10 }} />
            <Text style={{ color: themeColors.text, fontSize: 14 }}>{safeFormatDate(dateFrom)}</Text>
          </TouchableOpacity>

          {/* Pengulangan Dropdown */}
          <Text style={[styles.label, { color: themeColors.text }]}>Jenis Pengulangan / Siklus</Text>
          <TouchableOpacity
            style={[styles.inputIconWrapper, { borderColor: colors.gray200, backgroundColor: themeColors.cardBg, justifyContent: 'space-between' }]}
            onPress={() => setShowPengulanganPicker(true)}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: themeColors.text, fontSize: 14, fontWeight: '600' }}>{selectedOpt?.label}</Text>
            </View>
            <Ionicons name="chevron-down" size={18} color={themeColors.textMuted} />
          </TouchableOpacity>

          {/* Warna Pengingat */}
          <Text style={[styles.label, { color: themeColors.text }]}>Warna Pengingat di Kalender</Text>
          <TouchableOpacity
            style={[styles.colorPreviewBtn, { borderColor: colors.gray200 }]}
            onPress={() => setShowColorPicker(true)}
          >
            <View style={[styles.colorPreviewCircle, { backgroundColor: warnaKegiatan }]} />
            <Text style={{ color: themeColors.text, marginLeft: 12, fontSize: 14, flex: 1 }}>Pilih Warna</Text>
            <Ionicons name="chevron-forward" size={16} color={themeColors.textMuted} />
          </TouchableOpacity>

          {/* Deskripsi */}
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: themeColors.cardBg, color: themeColors.text }]}
            placeholder="Deskripsi / Ruangan (opsional)"
            placeholderTextColor={themeColors.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={deskripsi}
            onChangeText={setDeskripsi}
          />
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Pengulangan Picker Modal */}
      <Modal visible={showPengulanganPicker} transparent animationType="slide" onRequestClose={() => setShowPengulanganPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: themeColors.cardBg }]}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>Pilih Jenis Pengulangan</Text>
            <View style={{ gap: 10, marginBottom: 20 }}>
              {PENGULANGAN_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => { setPengulangan(opt.id); setShowPengulanganPicker(false); }}
                  style={[
                    styles.pengulanganItem,
                    { borderColor: colors.gray200 },
                    pengulangan === opt.id && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                >
                  <Text style={[styles.pengulanganLabel, { color: themeColors.text }, pengulangan === opt.id && { color: '#fff' }]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowPengulanganPicker(false)}>
              <Text style={{ color: colors.primary, fontWeight: '700' }}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Color Picker Modal */}
      <Modal visible={showColorPicker} transparent animationType="fade" onRequestClose={() => setShowColorPicker(false)}>
        <View style={[styles.modalOverlay, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
          <View style={[styles.colorModalCard, { backgroundColor: themeColors.cardBg }]}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>Pilih Warna Pengingat</Text>
            <View style={styles.colorGrid}>
              {COLOR_OPTIONS.map(c => (
                <TouchableOpacity
                  key={c}
                  onPress={() => { setWarnaKegiatan(c); setShowColorPicker(false); }}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: c },
                    warnaKegiatan === c && styles.colorCircleSelected
                  ]}
                >
                  {warnaKegiatan === c && <Ionicons name="checkmark" size={20} color="#fff" />}
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowColorPicker(false)}>
              <Text style={{ color: colors.primary, fontWeight: '700' }}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Date & Time Pickers */}
      {showDatePicker && (
        <DateTimePicker value={dateFrom} mode="date" display="default" onChange={onChangeDate} />
      )}
      {showTimePicker && (
        <DateTimePicker value={dateFrom} mode="time" display="default" onChange={onChangeTime} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  headerBtn: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: colors.white, fontSize: 18, fontWeight: '800' },

  content: { padding: 20 },
  formCard: { borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '800', marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 8 },

  input: { borderWidth: 1, borderColor: colors.gray200, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, marginBottom: 12 },
  inputIconWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 12 },
  textArea: { height: 100, textAlignVertical: 'top', marginTop: 4 },

  colorPreviewBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12 },
  colorPreviewCircle: { width: 28, height: 28, borderRadius: 14 },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36 },
  colorModalCard: { width: '100%', borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 16, fontWeight: '800', marginBottom: 20, textAlign: 'center' },

  pengulanganItem: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1 },
  pengulanganLabel: { fontSize: 15, fontWeight: '700' },
  pengulanganDesc: { fontSize: 11, marginTop: 2 },

  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 20 },
  colorCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', elevation: 3 },
  colorCircleSelected: { borderWidth: 3, borderColor: '#fff' },
  closeBtn: { alignItems: 'center', paddingVertical: 12 },
});

export default UserAddEventScreen;
