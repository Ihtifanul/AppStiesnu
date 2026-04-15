import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import HomeCenter from '../components/home/HomeCenter';
import FeaturedNews from '../components/news/FeaturedNews';
import api from '../config/api';
import { useAppContext } from '../context/AppContext';

const HomeScreen = ({ onNavigate }) => {
  const { user, themeColors } = useAppContext();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const isGuest = user.role === 'guest';

  const fetchJadwal = async () => {
    try {
      let combined = [];

      // Ambil Kalender (untuk semua orang)
      const kalRes = await api.get('/kalender');
      if (kalRes.data?.success) {
        let items = kalRes.data.data.kalender;
        if (items) {
          combined = [...combined, ...items.map(k => ({
            id: 'k_' + k.id_event,
            subject: k.nama_event,
            room: k.deskripsi_event || 'Kampus',
            type: 'Event',
            start_time: new Date(k.waktu_event).toTimeString().substring(0, 5),
            date: new Date(k.waktu_event),
            color: k.warna_event
          }))];
        }
      }

      // Ambil Jadwal Pribadi (hanya jika login)
      if (!isGuest) {
        const jadRes = await api.get('/jadwal');
        if (jadRes.data?.success) {
          let items = jadRes.data.data.jadwals;
          if (items) {
            combined = [...combined, ...items.map(j => ({
              id: 'j_' + j.id_jadwal,
              subject: j.nama_kegiatan,
              room: j.deskripsi_kegiatan || '-',
              type: 'Pengingat',
              start_time: j.waktu_kegiatan ? new Date(j.waktu_kegiatan).toTimeString().substring(0, 5) : '00:00',
              date: new Date(j.tanggal_kegiatan),
              color: colors.primary
            }))];
          }
        }
      }

      // Sort by date/time
      combined.sort((a, b) => a.date - b.date);

      setSchedules(combined.slice(0, 3)); // Only show top 3 for UI
    } catch (e) {
      console.error('Fetch jadwal error', e);
    } finally {
      if (loading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchJadwal();
    const interval = setInterval(fetchJadwal, 15000); // Polling every 15 seconds
    return () => clearInterval(interval);
  }, [user.role]);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── HEADER ── */}
        <LinearGradient
          colors={[colors.primary, colors.primaryMid, colors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          {/* Top row */}
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Selamat Datang,</Text>
              <Text style={styles.userName}>{isGuest ? 'Guest' : user.nama}</Text>
            </View>
            <TouchableOpacity style={styles.avatarWrapper} onPress={() => onNavigate('Menu')}>
              <Image
                source={{
                  uri: isGuest
                    ? 'https://ui-avatars.com/api/?name=Guest&background=059669&color=fff'
                    : (user.foto_profil || 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png')
                }}
                style={styles.avatar}
              />
              {!isGuest && (
                <View style={styles.crownBadge}>
                  <Ionicons name="star" size={10} color={colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* ── QUICK MENU ── */}
        <View style={styles.section}>
          <HomeCenter onNavigate={onNavigate} />
        </View>

        {/* ── TODAY'S SCHEDULE / CALENDAR ── */}
        <View style={styles.sectionPadded}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{"Kalender & Jadwal"}</Text>
            <TouchableOpacity onPress={() => onNavigate('Jadwal')}>
              <Text style={styles.seeAll}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : schedules.length === 0 ? (
            <Text style={{ color: themeColors.textMuted }}>Tidak ada agenda dalam waktu dekat.</Text>
          ) : (
            <View style={styles.scheduleList}>
              {schedules.map((s) => (
                <View key={s.id} style={[styles.scheduleCard, { backgroundColor: themeColors.cardBg }]}>
                  <View style={[styles.timeBlock, { backgroundColor: (s.color || colors.primary) + '20' }]}>
                    <Text style={[styles.timeText, { color: s.color || colors.primary }]}>
                      {s.start_time}
                    </Text>
                    <View style={[styles.timeSep, { backgroundColor: (s.color || colors.primary) + '50' }]} />
                    <Text style={[styles.timeText, { color: s.color || colors.primary, fontSize: 8 }]}>
                      {s.date && !isNaN(s.date.getTime()) ? `${s.date.getDate()}/${s.date.getMonth() + 1}` : '-'}
                    </Text>
                  </View>
                  <View style={styles.scheduleInfo}>
                    <Text style={[styles.scheduleSubject, { color: themeColors.text }]}>{s.subject}</Text>
                    <Text style={[styles.scheduleRoom, { color: themeColors.textMuted }]} numberOfLines={1}>
                      {s.room}
                    </Text>
                    <View style={styles.scheduleMeta}>
                      <View style={[styles.typeBadge, { backgroundColor: (s.color || colors.primary) + '20' }]}>
                        <Text style={[styles.typeText, { color: s.color || colors.primary }]}>{s.type}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── NEWS ── */}
        <FeaturedNews onSeeAll={() => onNavigate('Berita')} />

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Header
  header: { paddingTop: 52, paddingBottom: 28, paddingHorizontal: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: '500' },
  userName: { color: colors.white, fontSize: 22, fontWeight: '800', marginTop: 2 },
  userInfo: { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 4 },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)' },
  crownBadge: { position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, backgroundColor: colors.goldLight, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.white },

  idBanner: { borderRadius: 18, overflow: 'hidden', shadowColor: colors.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  idGradient: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 18 },
  idLabel: { fontSize: 10, fontWeight: '800', color: colors.primary, opacity: 0.7 },
  idNumber: { fontSize: 20, fontWeight: '800', color: colors.primary },
  idExpiry: { fontSize: 11, color: colors.primary, opacity: 0.6, marginTop: 4 },
  qrBox: { backgroundColor: colors.white, padding: 8, borderRadius: 12 },

  // Sections
  section: { marginHorizontal: 20, marginTop: -20, zIndex: 10 },
  sectionPadded: { paddingHorizontal: 20, marginTop: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.gray800 },
  seeAll: { fontSize: 12, fontWeight: '700', color: colors.primaryLight },

  // Schedule
  scheduleList: { gap: 10 },
  scheduleCard: { borderRadius: 18, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  scheduleCardDim: { opacity: 0.6 },
  timeBlock: { borderRadius: 12, padding: 10, alignItems: 'center', minWidth: 52 },
  timeText: { fontSize: 10, fontWeight: '700' },
  timeSep: { width: 2, height: 24, borderRadius: 2, marginVertical: 4 },
  scheduleInfo: { flex: 1, gap: 4 },
  scheduleSubject: { fontSize: 14, fontWeight: '800' },
  scheduleRoom: { fontSize: 11 },
  scheduleMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  typeText: { fontSize: 10, fontWeight: '700' },
  scheduleLecturer: { fontSize: 10, color: colors.gray400 },
  doneIcon: { width: 32, height: 32, backgroundColor: colors.primarySoft, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});

export default HomeScreen;
