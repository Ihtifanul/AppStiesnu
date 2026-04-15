import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import { useAppContext } from '../context/AppContext';
import api from '../config/api';
import { isPublicHoliday } from '../utils/holidays';
import { formatMonthYearID } from '../utils/formatDate';

const JadwalScreen = ({ onNavigate }) => {
  const { user, themeColors } = useAppContext();
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [currentMonthView, setCurrentMonthView] = useState(new Date());
  
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const isGuest = user.role === 'guest';
  
  const year = currentMonthView.getFullYear();
  const month = currentMonthView.getMonth();
  const monthName = formatMonthYearID(currentMonthView);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0(Sun) - 6(Sat)

  const days = Array.from({length: daysInMonth}, (_, i) => {
    const d = i + 1;
    const dateObj = new Date(year, month, d);
    // Is it Sunday or a public holiday?
    const isRedDay = dateObj.getDay() === 0 || isPublicHoliday(dateObj);
    return { day: d, isRedDay };
  });

  const fetchJadwal = async () => {
    try {
      let combined = [];

      const kalRes = await api.get('/kalender');
      if (kalRes.data?.success && kalRes.data.data.kalender) {
        combined = [...combined, ...kalRes.data.data.kalender.map(k => ({
          id: k.id_event,
          typeId: 'kalender',
          subject: k.nama_event,
          room: k.deskripsi_event || 'Kampus',
          type: 'Event',
          start_time: new Date(k.waktu_event).toTimeString().substring(0, 5),
          date: new Date(k.waktu_event),
          color: k.warna_event
        }))];
      }

      if (!isGuest) {
        const jadRes = await api.get('/jadwal');
        if (jadRes.data?.success && jadRes.data.data.jadwals) {
          combined = [...combined, ...jadRes.data.data.jadwals.map(j => ({
            id: j.id_jadwal,
            typeId: 'jadwal',
            subject: j.nama_kegiatan,
            room: j.deskripsi_kegiatan || '-',
            type: 'Pengingat',
            start_time: j.waktu_kegiatan ? new Date(j.waktu_kegiatan).toTimeString().substring(0, 5) : '00:00',
            date: new Date(j.tanggal_kegiatan),
            color: colors.primary
          }))];
        }
      }

      combined.sort((a,b) => a.date - b.date);
      setSchedules(combined);
    } catch (e) {
      console.error(e);
    } finally {
      if (loading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchJadwal();
  }, [user.role]);

  const handlePrevMonth = () => {
    setCurrentMonthView(new Date(year, month - 1, 1));
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    setCurrentMonthView(new Date(year, month + 1, 1));
    setSelectedDay(1);
  };

  const selectedDateFull = new Date(year, month, selectedDay);
  const selectedSchedules = schedules.filter(s => {
    return s.date.getDate() === selectedDay &&
           s.date.getMonth() === month &&
           s.date.getFullYear() === year;
  });

  const handleAddBtn = () => {
    if (isGuest) {
      Alert.alert(
        "Akses Terbatas",
        "Anda harus login untuk menambahkan pengingat.",
        [
          { text: "Batal", style: "cancel" },
          { text: "Login", onPress: () => onNavigate('Login') }
        ]
      );
    } else {
      onNavigate('UserAddEvent');
    }
  };

  const renderScheduleCard = (item, index) => (
    <View key={index} style={[styles.scheduleCard, { backgroundColor: themeColors.cardBg }]}>
      <View style={[styles.timeColumn, { backgroundColor: item.color + '20' }]}>
        <Text style={[styles.timeText, { color: item.color }]}>{item.start_time}</Text>
      </View>
      <View style={styles.scheduleInfo}>
        <View style={styles.scheduleHeader}>
           <Text style={[styles.scheduleSubject, { color: themeColors.text }]} numberOfLines={1}>{item.subject}</Text>
           <View style={[styles.badge, { backgroundColor: item.color }]}>
              <Text style={styles.badgeText}>{item.type}</Text>
           </View>
        </View>
        <Text style={{ color: themeColors.textMuted, fontSize: 13, marginTop: 4 }} numberOfLines={2}>
           <Ionicons name="location-outline" size={12} /> {item.room}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="#059669" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('Home')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Jadwal STIESNU</Text>
        <TouchableOpacity onPress={handleAddBtn} style={styles.backBtn}>
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Calendar Box */}
        <View style={[styles.calendarBox, { backgroundColor: themeColors.cardBg }]}>
           <View style={styles.monthSelector}>
              <TouchableOpacity onPress={handlePrevMonth} style={styles.monthNav}>
                 <Ionicons name="chevron-back" size={20} color={themeColors.text} />
              </TouchableOpacity>
              <Text style={[styles.monthText, { color: themeColors.text }]}>{monthName}</Text>
              <TouchableOpacity onPress={handleNextMonth} style={styles.monthNav}>
                 <Ionicons name="chevron-forward" size={20} color={themeColors.text} />
              </TouchableOpacity>
           </View>

           <View style={styles.weekRow}>
             {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d, i) => (
                <Text key={i} style={[styles.weekText, i === 0 && { color: '#ef4444' } ]}>{d}</Text>
             ))}
           </View>

           <View style={styles.daysGrid}>
              {Array.from({length: firstDayOfWeek}).map((_, i) => (
                 <View key={`empty-${i}`} style={styles.dayCell}></View>
              ))}
              
              {days.map((item) => {
                 const isSelected = item.day === selectedDay;
                 const isToday = item.day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                 let textColor = item.isRedDay ? '#ef4444' : themeColors.text;
                 if (isSelected) textColor = colors.white;

                 return (
                   <TouchableOpacity 
                      key={item.day} 
                      style={[styles.dayCell, isSelected && styles.dayCellActive, isToday && !isSelected && styles.dayCellToday]}
                      onPress={() => setSelectedDay(item.day)}
                   >
                      <Text style={[styles.dayText, { color: textColor }]}>{item.day}</Text>
                      {/* Titik indikator jika ada jadwal di tanggal ini */}
                      {schedules.some(s => s.date.getDate() === item.day && s.date.getMonth() === month && s.date.getFullYear() === year) && (
                         <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: isSelected ? colors.white : colors.primary, marginTop: 2}} />
                      )}
                   </TouchableOpacity>
                 );
              })}
           </View>
        </View>

        {/* Schedule List */}
        <View style={styles.agendaSection}>
           <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Kegiatan</Text>
           </View>
           
           {loading ? (
              <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 20 }} />
           ) : selectedSchedules.length > 0 ? (
              selectedSchedules.map(renderScheduleCard)
           ) : (
              <View style={styles.emptyState}>
                 <Ionicons name="calendar-clear-outline" size={48} color={themeColors.textMuted} />
                 <Text style={[styles.emptyText, { color: themeColors.textMuted }]}>Tidak ada kegiatan di tanggal ini.</Text>
                 <Text style={{ fontSize: 12, color: themeColors.textMuted, marginTop: 4 }}>Ketuk tombol + untuk menambahkan jadwal baru.</Text>
              </View>
           )}
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  backBtn: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: colors.white, fontSize: 18, fontWeight: '800' },
  
  content: { padding: 20 },
  calendarBox: { backgroundColor: colors.white, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, marginBottom: 24 },
  
  monthSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  monthNav: { padding: 8, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 8 },
  monthText: { fontSize: 16, fontWeight: '700' },
  
  weekRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  weekText: { width: 36, textAlign: 'center', fontSize: 12, fontWeight: '600', color: colors.gray400 },
  
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', marginVertical: 2 },
  dayCellActive: { backgroundColor: colors.primary, borderRadius: 20 },
  dayCellToday: { backgroundColor: colors.primaryLight + '30', borderRadius: 20 },
  dayText: { fontSize: 14, fontWeight: '600' },

  agendaSection: { flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  
  scheduleCard: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  timeColumn: { width: 50, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  timeText: { fontSize: 13, fontWeight: '700' },
  scheduleInfo: { flex: 1, justifyContent: 'center' },
  scheduleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scheduleSubject: { fontSize: 15, fontWeight: '700', flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: colors.white, fontSize: 10, fontWeight: '700' },
  
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyText: { fontSize: 14, fontWeight: '600', marginTop: 12 }
});

export default JadwalScreen;
