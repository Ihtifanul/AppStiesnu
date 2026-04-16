import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import { useAppContext } from '../context/AppContext';
import api from '../config/api';
import { formatDayDateID } from '../utils/formatDate';

const AdminHomeScreen = ({ onNavigate }) => {
  const { user, themeColors } = useAppContext();
  const [stats, setStats] = useState({ totalUsers: 0, totalBerita: 0 });
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    // Clock interval for realtime date/time
    const clockInterval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        if (res.data?.success) {
          setStats(res.data.data);
        }
      } catch (e) {
        console.error('Stats error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    
    // Polling every 15 secs
    const statsInterval = setInterval(fetchStats, 15000);
    return () => {
      clearInterval(statsInterval);
      clearInterval(clockInterval);
    };
  }, []);

  const formattedDate = formatDayDateID(currentDate);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Selamat Datang,</Text>
            <Text style={styles.userName}>{user?.nama || 'Administrator'}</Text>
            <Text style={[styles.greeting, { marginBottom: 8, fontSize: 11 }]}>{formattedDate}</Text>
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Online</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.avatarWrapper} onPress={() => onNavigate('Menu')}>
            {user?.foto_profil ? (
              <Image source={{ uri: user.foto_profil }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="person" size={24} color={colors.white} />
              </View>
            )}
            <View style={styles.crownBadge}>
              <Ionicons name="star" size={10} color={colors.primary} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: themeColors.cardBg }]}>
            <Text style={[styles.statTitle, { color: themeColors.textMuted }]}>Total Pengguna</Text>
            {loading ? <ActivityIndicator color={colors.primary} /> : <Text style={[styles.statValue, { color: themeColors.text }]}>{stats.totalUsers}</Text>}
          </View>
          <View style={[styles.statBox, { backgroundColor: themeColors.cardBg }]}>
            <Text style={[styles.statTitle, { color: themeColors.textMuted }]}>Total Berita</Text>
            {loading ? <ActivityIndicator color={colors.primary} /> : <Text style={[styles.statValue, { color: themeColors.text }]}>{stats.totalBerita}</Text>}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={[styles.actionSection, { backgroundColor: themeColors.cardBg }]}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => onNavigate('AdminAkun')}>
            <View style={styles.actionIconBox}>
               <Ionicons name="people" size={20} color={colors.primary} />
            </View>
            <Text style={styles.actionBtnText}>Manajemen Akun</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionBtn} onPress={() => onNavigate('AdminJadwal')}>
            <View style={styles.actionIconBox}>
               <Ionicons name="calendar" size={20} color={colors.primary} />
            </View>
            <Text style={styles.actionBtnText}>Manajemen Jadwal</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionBtn} onPress={() => onNavigate('AdminBerita')}>
            <View style={styles.actionIconBox}>
               <Ionicons name="newspaper" size={20} color={colors.primary} />
            </View>
            <Text style={styles.actionBtnText}>Manajemen Berita</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={() => onNavigate('AdminNotifikasi')}>
            <View style={styles.actionIconBox}>
               <Ionicons name="notifications" size={20} color={colors.primary} />
            </View>
            <Text style={styles.actionBtnText}>Manajemen Notifikasi</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { 
    backgroundColor: colors.primary, 
    paddingTop: 52, 
    paddingBottom: 40, 
    paddingHorizontal: 20, 
    borderBottomLeftRadius: 32, 
    borderBottomRightRadius: 32 
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '500' },
  userName: { color: colors.white, fontSize: 24, fontWeight: '800', marginTop: 2, marginBottom: 8 },
  onlineBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf:'flex-start' },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ade80', marginRight: 6 },
  onlineText: { color: colors.white, fontSize: 10, fontWeight: '600' },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)' },
  crownBadge: { position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, backgroundColor: colors.goldLight, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.white },
  
  content: { flex: 1, paddingHorizontal: 20, marginTop: -20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 15, marginBottom: 24 },
  statBox: { flex: 1, backgroundColor: colors.white, borderRadius: 16, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  statTitle: { fontSize: 13, fontWeight: '700', color: colors.gray800, marginBottom: 8 },
  statValue: { fontSize: 32, fontWeight: '800', color: colors.gray800 },
  
  actionSection: { backgroundColor: colors.white, borderRadius: 20, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, gap: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, borderRadius: 12, padding: 12 },
  actionIconBox: { width: 40, height: 40, backgroundColor: colors.white, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  actionBtnText: { color: colors.white, fontSize: 14, fontWeight: '600' }
});

export default AdminHomeScreen;
