import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, StatusBar, Switch, Modal, Alert, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import colors from '../constants/colors';
import { useAppContext } from '../context/AppContext';
import api from '../config/api';

const UserAddEventScreen = ({ onNavigate }) => {
  const { themeColors } = useAppContext();
  const [everyDay, setEveryDay] = useState(false);
  const [subject, setSubject] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  
  // Date Time Picker states
  const [dateFrom, setDateFrom] = useState(new Date());
  
  // Pickers active states - split into date and time to prevent crashes
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dropdown states
  const [repeatVal, setRepeatVal] = useState('Sekali');
  const [reminderVal, setReminderVal] = useState('5 Menit Sebelum');
  
  const [showRepeatModal, setShowRepeatModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);

  const REPEAT_OPTIONS = ['Sekali', 'Harian', 'Mingguan', 'Custom'];
  const REMINDER_OPTIONS = ['Tidak Ada', '5 Menit', '15 Menit', '30 Menit', '1 Jam', '4 Jam', '1 Hari', '2 Hari', '1 Minggu'];

  const handleSave = async () => {
    if (!subject) {
       Alert.alert("Error", "Nama Kegiatan harus diisi!");
       return;
    }
     
    setLoading(true);
    try {
      const res = await api.post('/jadwal', {
        nama_kegiatan: subject,
        deskripsi_kegiatan: deskripsi,
        waktu_kegiatan: dateFrom.toISOString(),
        tanggal_kegiatan: dateFrom.toISOString(),
      });
      if (res.data?.success) {
        Alert.alert("Sukses", "Jadwal berhasil ditambahkan!", [
          { text: "OK", onPress: () => onNavigate('Jadwal') }
        ]);
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Gagal menyimpan jadwal.");
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

  const formatDateLabel = (d) => {
     return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const renderDropdownModal = (visible, setVisible, options, currentVal, setVal) => (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
       <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setVisible(false)}>
          <View style={styles.dropdownContainer}>
             {options.map((opt, i) => (
                <TouchableOpacity 
                   key={i} 
                   style={[styles.dropdownItem, currentVal === opt && styles.dropdownItemActive]}
                   onPress={() => { setVal(opt); setVisible(false); }}
                >
                   <Text style={[styles.dropdownText, currentVal === opt && styles.dropdownTextActive]}>{opt}</Text>
                </TouchableOpacity>
             ))}
          </View>
       </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
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

          <TextInput 
             style={[styles.input, { backgroundColor: themeColors.cardBg, color: themeColors.text }]} 
             placeholder="Nama Kegiatan (Cth: Kelas Makro / Belajar)" 
             placeholderTextColor={themeColors.textMuted} 
             value={subject} 
             onChangeText={setSubject} 
          />
          
          <TouchableOpacity style={styles.inputIconWrapper} onPress={() => setShowDatePicker(true)}>
            <Text style={[styles.dateTextLabel, {color: themeColors.text}]}>{formatDateLabel(dateFrom)}</Text>
            <Ionicons name="calendar-outline" size={20} color={themeColors.text} style={styles.inputIcon} />
          </TouchableOpacity>

          <View style={styles.rowBetween}>
             <Text style={[styles.label, {color: themeColors.textMuted}]}>Repeat</Text>
             <TouchableOpacity style={styles.mockDropdown} onPress={() => setShowRepeatModal(true)}>
                <Text style={{color: themeColors.textMuted, fontSize: 13}}>{repeatVal}</Text>
                <Ionicons name="chevron-down" color={themeColors.textMuted} size={14} />
             </TouchableOpacity>
          </View>
          
          <View style={styles.rowBetween}>
             <Text style={[styles.label, {color: themeColors.textMuted}]}>Pengingat</Text>
             <TouchableOpacity style={styles.mockDropdown} onPress={() => setShowReminderModal(true)}>
                <Text style={{color: themeColors.textMuted, fontSize: 13}}>{reminderVal}</Text>
                <Ionicons name="chevron-down" color={themeColors.textMuted} size={14} />
             </TouchableOpacity>
          </View>

          <View style={styles.rowBetween}>
             <View style={{ backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
                 <Text style={{ color: colors.white, fontSize: 12, fontWeight: '600' }}>Setiap Hari</Text>
             </View>
             <Switch value={everyDay} onValueChange={setEveryDay} trackColor={{ true: colors.primary, false: '#ccc' }} />
          </View>

          <TextInput 
             style={[styles.input, styles.textArea, { backgroundColor: themeColors.cardBg, color: themeColors.text }]} 
             placeholder="Deskripsi / Ruangan" 
             placeholderTextColor={themeColors.textMuted} 
             multiline 
             numberOfLines={4} 
             textAlignVertical="top" 
             value={deskripsi}
             onChangeText={setDeskripsi}
          />
        </View>
      </ScrollView>

      {/* Date & Time Pickers separated to avoid crash */}
      {showDatePicker && (
         <DateTimePicker value={dateFrom} mode="date" display="default" onChange={onChangeDate} />
      )}
      {showTimePicker && (
         <DateTimePicker value={dateFrom} mode="time" display="default" onChange={onChangeTime} />
      )}

      {/* Dropdown Modals */}
      {renderDropdownModal(showRepeatModal, setShowRepeatModal, REPEAT_OPTIONS, repeatVal, setRepeatVal)}
      {renderDropdownModal(showReminderModal, setShowReminderModal, REMINDER_OPTIONS, reminderVal, setReminderVal)}

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 
  },
  headerBtn: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: colors.white, fontSize: 18, fontWeight: '800' },
  
  content: { padding: 20 },
  formCard: { borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '800', marginBottom: 16 },
  
  input: { borderWidth: 1, borderColor: colors.gray200, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, marginBottom: 12 },
  inputIconWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.gray200, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 12 },
  inputIcon: { position: 'absolute', right: 14 },
  dateTextLabel: { fontSize: 14 },
  textArea: { height: 100, marginTop: 12 },
  
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  label: { fontSize: 13, fontWeight: '500' },
  mockDropdown: { flexDirection: 'row', alignItems: 'center', gap: 4 },

  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' },
  dropdownContainer: { backgroundColor: '#115e59', padding: 4, borderRadius: 8, width: 140, position: 'absolute', right: 40, top: '45%' },
  dropdownItem: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 4, alignItems: 'center' },
  dropdownItemActive: { backgroundColor: '#0f766e' },
  dropdownText: { color: '#ccc', fontSize: 12 },
  dropdownTextActive: { color: '#fff', fontWeight: 'bold' }
});

export default UserAddEventScreen;
