import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
  StatusBar, ActivityIndicator, Alert, Platform, Switch, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import colors from '../constants/colors';
import api from '../config/api';
import { useAppContext } from '../context/AppContext';

// Pilihan warna event dalam lingkaran
const COLOR_OPTIONS = [
  '#059669', '#ef4444', '#f59e0b', '#3b82f6',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
  '#6366f1', '#10b981', '#64748b', '#1e293b',
];

const AdminAddEventScreen = ({ onNavigate }) => {
  const { themeColors } = useAppContext();
  const [namaEvent, setNamaEvent] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [warnaEvent, setWarnaEvent] = useState(colors.primary);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tandaiTanggal, setTandaiTanggal] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pengulangan, setPengulangan] = useState('sekali');

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(date);
      newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setDate(newDate);
      // Setelah pilih tanggal, tampilkan time picker
      if (Platform.OS === 'android') {
        setTimeout(() => setShowTimePicker(true), 300);
      }
    }
  };

  const onChangeTime = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(date);
      newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      setDate(newDate);
    }
  };

  const handleToggleTandai = (val) => {
    setTandaiTanggal(val);
    if (!val) {
      setWarnaEvent(colors.primary);
    }
  };

  const safeFormatDate = (d) => {
    try {
      const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} · ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    } catch {
      return 'Pilih tanggal & waktu';
    }
  };

  const handleSave = async () => {
    if (!namaEvent) {
      Alert.alert('Error', 'Nama kegiatan wajib diisi');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/kalender/create', {
        nama_event: namaEvent,
        waktu_event: date.toISOString(),
        deskripsi_event: deskripsi,
        warna_event: warnaEvent,
        pengulangan: pengulangan
      });
      if (res.data?.success) {
        Alert.alert('Sukses', 'Event berhasil ditambahkan!', [
          { text: 'OK', onPress: () => onNavigate('AdminJadwal') }
        ]);
      } else {
        Alert.alert('Gagal', 'Tidak berhasil menambahkan event.');
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
        <TouchableOpacity onPress={() => onNavigate('AdminJadwal')} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tambahkan Event</Text>
        <TouchableOpacity onPress={handleSave} style={styles.headerBtn} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Ionicons name="checkmark" size={24} color={colors.white} />}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.formCard, { backgroundColor: themeColors.cardBg }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Detail Event</Text>

          <TextInput
            style={[styles.input, { backgroundColor: themeColors.cardBg, color: themeColors.text }]}
            placeholder="Nama Kegiatan"
            placeholderTextColor={themeColors.textMuted}
            value={namaEvent}
            onChangeText={setNamaEvent}
          />

          {/* Date Picker - split into date then time to avoid datetime mode crash */}
          <Text style={[styles.label, { color: themeColors.text }]}>Tanggal & Waktu Kegiatan</Text>
          <TouchableOpacity
            style={[styles.inputIconWrapper, { borderColor: colors.gray200, backgroundColor: themeColors.cardBg }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={18} color={themeColors.textMuted} style={{ marginRight: 10 }} />
            <Text style={{ color: themeColors.text, fontSize: 14 }}>{safeFormatDate(date)}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onChangeDate}
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              value={date}
              mode="time"
              display="default"
              onChange={onChangeTime}
            />
          )}

          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: themeColors.cardBg, color: themeColors.text }]}
            placeholder="Deskripsi"
            placeholderTextColor={themeColors.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={deskripsi}
            onChangeText={setDeskripsi}
          />

          {/* Opsi Pengulangan */}
          <View style={[styles.switchRow, { borderBottomWidth: 0, marginTop: 0 }]}>
             <Text style={styles.label}>Jenis Pengulangan / Siklus</Text>
             <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 6 }}>
                {['sekali', 'harian', 'mingguan', 'bulanan'].map(opt => (
                   <TouchableOpacity 
                      key={opt}
                      onPress={() => setPengulangan(opt)}
                      style={[
                         { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: colors.primary },
                         pengulangan === opt && { backgroundColor: colors.primary }
                      ]}
                   >
                     <Text style={[ {fontSize: 12, color: colors.primary, fontWeight: 'bold'}, pengulangan === opt && {color: '#fff'} ]}>
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                     </Text>
                   </TouchableOpacity>
                ))}
             </ScrollView>
          </View>

          {/* Toggle Tandai Tanggal */}
          <View style={styles.switchRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="flag" size={18} color="#ef4444" style={{ marginRight: 8 }} />
              <Text style={{ color: themeColors.text, fontWeight: '600' }}>Tandai Tanggal</Text>
            </View>
            <Switch
              value={tandaiTanggal}
              onValueChange={handleToggleTandai}
              trackColor={{ false: '#767577', true: '#fca5a5' }}
              thumbColor={tandaiTanggal ? '#ef4444' : '#f4f3f4'}
            />
          </View>

          {/* Warna Event - hanya tampil jika tandai tanggal aktif */}
          {tandaiTanggal && (
            <>
              <Text style={[styles.label, { color: themeColors.text, marginTop: 12 }]}>Warna Event</Text>
              <TouchableOpacity
                style={[styles.colorPreviewBtn, { borderColor: colors.gray200 }]}
                onPress={() => setShowColorPicker(true)}
              >
                <View style={[styles.colorPreviewCircle, { backgroundColor: warnaEvent }]} />
                <Text style={{ color: themeColors.text, marginLeft: 10, fontSize: 14 }}>Pilih Warna</Text>
                <Ionicons name="chevron-forward" size={16} color={themeColors.textMuted} style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      {/* Color Picker Modal */}
      <Modal visible={showColorPicker} transparent animationType="fade" onRequestClose={() => setShowColorPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: themeColors.cardBg }]}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>Pilih Warna Event</Text>
            <View style={styles.colorGrid}>
              {COLOR_OPTIONS.map(c => (
                <TouchableOpacity
                  key={c}
                  onPress={() => { setWarnaEvent(c); setShowColorPicker(false); }}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: c },
                    warnaEvent === c && styles.colorCircleSelected
                  ]}
                >
                  {warnaEvent === c && <Ionicons name="checkmark" size={18} color="#fff" />}
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowColorPicker(false)}>
              <Text style={{ color: colors.primary, fontWeight: '700' }}>Tutup</Text>
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
    backgroundColor: colors.primary,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32
  },
  headerBtn: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: colors.white, fontSize: 18, fontWeight: '800' },

  content: { padding: 20 },
  formCard: { borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '800', marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 8 },

  input: { borderWidth: 1, borderColor: colors.gray200, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, marginBottom: 12 },
  inputIconWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 12 },
  textArea: { height: 100, textAlignVertical: 'top' },

  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10, paddingVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.gray200 },

  colorPreviewBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12 },
  colorPreviewCircle: { width: 28, height: 28, borderRadius: 14 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: { width: '100%', borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 16, fontWeight: '800', marginBottom: 20, textAlign: 'center' },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 20 },
  colorCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  colorCircleSelected: { borderWidth: 3, borderColor: '#fff', shadowOpacity: 0.3 },
  closeBtn: { alignItems: 'center', paddingVertical: 12 },
});

export default AdminAddEventScreen;
