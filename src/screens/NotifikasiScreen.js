import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../constants/colors';
import IconButton from '../components/common/IconButton';
import api from '../config/api';
import { useAppContext } from '../context/AppContext';
import { formatDateID } from '../utils/formatDate';

// Base key digabung dengan ID pengguna nantinya

const NotifikasiScreen = ({ onNavigate }) => {
  const { themeColors, user } = useAppContext();
  const [filter, setFilter] = useState('Semua');
  const [notifs, setNotifs] = useState([]);
  const [readIds, setReadIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const getReadKey = () => {
    return 'read_notif_ids_' + (user?.id_user || 'guest');
  };

  // Muat ID notifikasi yang sudah dibaca dari AsyncStorage
  const loadReadIds = async () => {
    try {
      const raw = await AsyncStorage.getItem(getReadKey());
      if (raw) setReadIds(new Set(JSON.parse(raw)));
    } catch {}
  };

  const markAsRead = async (id) => {
    const newSet = new Set(readIds);
    newSet.add(String(id));
    setReadIds(newSet);
    try {
      await AsyncStorage.setItem(getReadKey(), JSON.stringify([...newSet]));
    } catch {}
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const handlePress = (notif) => {
    markAsRead(notif.id);
    if (notif.type === 'berita') {
      onNavigate('Berita');
    }
  };

  const fetchNotif = useCallback(async () => {
    try {
      await loadReadIds();
      
      let dbNotifs = [];
      let eventNotifs = [];

      // Ambil notifikasi dari DB
      try {
        const res = await api.get('/notifikasi');
        if (res.data?.success) {
          const data = res.data.data.notifikasi || [];
          dbNotifs = data.map(n => {
            const isBerita = n.judul?.toLowerCase().includes('berita');
            const id = String(n.id_notifikasi);
            return {
              id,
              title: n.judul || 'Notifikasi',
              body: '',
              time: formatDateID(new Date(n.createdAt)),
              icon: isBerita ? 'newspaper-outline' : 'notifications-outline',
              color: isBerita ? colors.info || '#3b82f6' : colors.primary,
              type: isBerita ? 'berita' : 'info',
              unread: true, // akan dikontrol oleh readIds
            };
          });
        }
      } catch (e) {
        if (e.response?.status !== 401) console.error('Notif fetch error:', e?.message);
      }

      // Ambil kalender dan buat pengingat H-5 & H-3
      try {
        const calRes = await api.get('/kalender');
        if (calRes.data?.success) {
          const events = calRes.data.data.kalender || [];
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          events.forEach(e => {
            const eventDate = new Date(e.waktu_event);
            eventDate.setHours(0, 0, 0, 0);
            const diffDays = Math.round((eventDate - today) / (1000 * 3600 * 24));
            if (diffDays === 5 || diffDays === 3) {
              const id = `evt-${diffDays}d-${e.id_event}`;
              eventNotifs.push({
                id,
                title: `Pengingat H-${diffDays}: ${e.nama_event}`,
                body: `Kegiatan ini berlangsung dalam ${diffDays} hari lagi`,
                time: formatDateID(today),
                icon: 'calendar-outline',
                color: diffDays === 3 ? '#f59e0b' : colors.primary,
                type: 'event',
                unread: true,
              });
            }
          });
        }
      } catch (e) {
        if (e.response?.status !== 401) console.error('Kalender fetch error:', e?.message);
      }

      const allNotifs = [...eventNotifs, ...dbNotifs];
      // Terapkan status baca dari AsyncStorage
      const savedRead = await AsyncStorage.getItem(getReadKey());
      const savedIds = savedRead ? new Set(JSON.parse(savedRead)) : new Set();
      const withRead = allNotifs.map(n => ({
        ...n,
        unread: !savedIds.has(String(n.id)),
      }));
      setNotifs(withRead);
    } catch (e) {
      console.error('fetchNotif error:', e?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotif();
  }, [fetchNotif]);

  const unreadCount = notifs.filter(n => n.unread).length;
  const filteredNotifs = notifs.filter(n => {
    if (filter === 'Belum Dibaca') return n.unread;
    if (filter === 'Berita') return n.type === 'berita';
    return true;
  });

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <LinearGradient colors={[colors.primary, colors.primaryMid]} style={styles.header}>
        <View style={styles.headerRow}>
          <IconButton name="arrow-back" color={colors.white} bgColor="rgba(255,255,255,0.2)" onPress={() => onNavigate('Home')} />
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.headerTitle}>Notifikasi</Text>
            {unreadCount > 0 && (
              <Text style={styles.headerSub}>{unreadCount} belum dibaca</Text>
            )}
          </View>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
        <View style={[styles.tabRow, { backgroundColor: themeColors.cardBg }]}>
          {['Semua', 'Belum Dibaca', 'Berita'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, filter === tab && styles.tabBtnActive]}
              onPress={() => setFilter(tab)}
            >
              <Text style={[
                styles.tabText,
                { color: themeColors.textMuted },
                filter === tab && { color: colors.primary, fontWeight: '800' }
              ]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.list}>
            {filteredNotifs.length === 0 ? (
              <Text style={{ textAlign: 'center', marginTop: 24, color: themeColors.textMuted }}>
                Tidak ada notifikasi.
              </Text>
            ) : null}
            {filteredNotifs.map(notif => (
              <TouchableOpacity
                key={notif.id}
                style={[
                  styles.card,
                  { backgroundColor: themeColors.cardBg },
                  notif.unread && styles.cardUnread,
                  !notif.unread && styles.cardRead,
                ]}
                activeOpacity={0.8}
                onPress={() => handlePress(notif)}
              >
                <View style={[styles.iconBox, { backgroundColor: notif.color + '20' }]}>
                  <Ionicons name={notif.icon} size={22} color={notif.color} />
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.titleRow}>
                    <Text
                      style={[
                        styles.title,
                        { color: notif.unread ? themeColors.text : themeColors.textMuted },
                        !notif.unread && styles.titleRead,
                      ]}
                      numberOfLines={2}
                    >{notif.title}</Text>
                    {notif.unread && <View style={[styles.dot, { backgroundColor: notif.color }]} />}
                  </View>
                  {notif.body ? (
                    <Text style={[styles.bodyText, { color: themeColors.textMuted }]} numberOfLines={1}>
                      {notif.body}
                    </Text>
                  ) : null}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <Text style={[styles.time, { color: themeColors.textMuted }]}>{notif.time}</Text>
                    {notif.type === 'berita' && (
                      <Text style={[styles.tap, { color: notif.color }]}>Tap untuk lihat berita →</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.white },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  tabRow: { flexDirection: 'row', borderRadius: 20, padding: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: 16, alignItems: 'center' },
  tabBtnActive: { backgroundColor: colors.primarySoft || '#d1fae5' },
  tabText: { fontSize: 12, fontWeight: '600' },

  body: { flex: 1, padding: 20 },
  list: { gap: 10, marginTop: 8 },
  card: { borderRadius: 18, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'flex-start', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardUnread: { borderLeftWidth: 3, borderLeftColor: colors.primary },
  cardRead: { opacity: 0.6 },
  iconBox: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardContent: { flex: 1, gap: 3 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  title: { fontSize: 13, fontWeight: '700', flex: 1, lineHeight: 18 },
  titleRead: { fontWeight: '500' },
  dot: { width: 8, height: 8, borderRadius: 4, marginLeft: 8, marginTop: 4, flexShrink: 0 },
  bodyText: { fontSize: 12 },
  time: { fontSize: 11 },
  tap: { fontSize: 11, fontWeight: '600' },
});

export default NotifikasiScreen;
