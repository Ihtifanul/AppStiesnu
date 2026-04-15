import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import { useAppContext } from '../context/AppContext';

const MenuScreen = ({ onNavigate }) => {
  const { user, logout, isDarkMode, toggleTheme, themeColors } = useAppContext();

  const isGuest = user.role === 'guest';

  // Base items visible to everyone
  let items = [
    { icon: isDarkMode ? 'sunny' : 'moon', label: 'Ganti Tampilan', color: colors.warning, action: toggleTheme },
  ];

  if (!isGuest) {
    items.unshift({ icon: 'person-circle-outline', label: 'Edit Profil', color: colors.gray600, action: () => onNavigate('EditProfil') });
    if (user.role === 'admin') {
      items.unshift({ icon: 'notifications', label: 'Notifikasi', color: colors.subjectPurple, action: () => onNavigate('AdminNotifikasi') });
    } else {
      items.unshift({ icon: 'notifications', label: 'Notifikasi', color: colors.subjectPurple, action: () => onNavigate('Notifikasi') });
    }
    items.push({ icon: 'log-out', label: 'Keluar', color: colors.danger, action: async () => {
      await logout();
      onNavigate('Login');
    } });
  } else {
    items.push({ icon: 'log-in', label: 'Login', color: colors.primary, action: () => onNavigate('Login') });
  }

  const MENU_ITEMS = [
    { section: 'Pengaturan', items }
  ];

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <LinearGradient colors={[colors.primary, colors.primaryMid]} style={styles.header}>
        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.avatarWrapper} onPress={() => !isGuest && onNavigate('EditProfil')}>
            <Image source={{ uri: isGuest ? 'https://ui-avatars.com/api/?name=Guest&background=random' : (user.foto_profil || 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png') }} style={styles.avatar} />
            {!isGuest && (
              <View style={styles.editBadge}>
                <Ionicons name="camera" size={14} color={colors.white} />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.name}>{isGuest ? 'Guest' : user.nama}</Text>
          <View style={styles.activeBadge}>
            <View style={styles.activeDot} />
            <Text style={styles.activeText}>Online</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {MENU_ITEMS.map((section) => (
          <View key={section.section} style={styles.section}>
            <Text style={[styles.sectionLabel, { color: themeColors.textMuted }]}>{section.section}</Text>
            <View style={[styles.card, { backgroundColor: themeColors.cardBg }]}>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.menuRow, index < section.items.length - 1 && [styles.menuRowBorder, { borderBottomColor: isDarkMode ? '#374151' : colors.gray100 }]]}
                  activeOpacity={0.7}
                  onPress={item.action}
                >
                  <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
                    <Ionicons name={item.icon} size={20} color={item.color} />
                  </View>
                  <Text style={[styles.menuLabel, { color: themeColors.text }, item.label === 'Keluar' && { color: colors.danger }]}>
                    {item.label}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={themeColors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 40, paddingHorizontal: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  profileSection: { alignItems: 'center' },
  avatarWrapper: { position: 'relative', marginBottom: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: 'rgba(255,255,255,0.4)' },
  editBadge: { position: 'absolute', bottom: 0, right: 4, width: 32, height: 32, backgroundColor: colors.gold, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.white },
  name: { fontSize: 24, fontWeight: '800', color: colors.white },
  activeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ade80' },
  activeText: { fontSize: 13, color: colors.white, fontWeight: '600' },
  
  body: { flex: 1, padding: 20, marginTop: -20 },
  section: { marginBottom: 8 },
  sectionLabel: { fontSize: 12, fontWeight: '700', marginBottom: 12, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { borderRadius: 18, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  menuRowBorder: { borderBottomWidth: 1 },
  menuIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
});

export default MenuScreen;
