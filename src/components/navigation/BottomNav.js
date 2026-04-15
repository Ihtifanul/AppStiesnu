import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import { useAppContext } from '../../context/AppContext';

const NAV_ITEMS_USER = [
  { name: 'Beranda', icon: 'home', activeIcon: 'home', route: 'Home' },
  { name: 'Berita', icon: 'newspaper-outline', activeIcon: 'newspaper', route: 'Berita' },
  { name: 'Jadwal', icon: 'calendar-outline', activeIcon: 'calendar', route: 'Jadwal' },
  { name: 'Notif', icon: 'notifications-outline', activeIcon: 'notifications', route: 'Notifikasi' },
  { name: 'Menu', icon: 'menu-outline', activeIcon: 'menu', route: 'Menu' },
];

const NAV_ITEMS_ADMIN = [
  { name: 'Beranda', icon: 'home', activeIcon: 'home', route: 'AdminHome' },
  { name: 'Berita', icon: 'newspaper-outline', activeIcon: 'newspaper', route: 'AdminBerita' },
  { name: 'Jadwal', icon: 'calendar-outline', activeIcon: 'calendar', route: 'AdminJadwal' },
  { name: 'User', icon: 'person-outline', activeIcon: 'person', route: 'AdminAkun' },
  { name: 'Menu', icon: 'menu-outline', activeIcon: 'menu', route: 'Menu' },
];

const BottomNav = ({ activeRoute, onNavigate, userRole }) => {
  const { themeColors } = useAppContext();
  const NAV_ITEMS = userRole === 'admin' ? NAV_ITEMS_ADMIN : NAV_ITEMS_USER;
  const scaleAnims = useRef(Math.max(NAV_ITEMS_USER.length, NAV_ITEMS_ADMIN.length) ? Array(5).fill(0).map(() => new Animated.Value(1)) : []).current;

  const handlePress = (route, index) => {
    // If the index exceeds scaleAnims for some reason, ignore animation
    if(scaleAnims[index]) {
      Animated.sequence([
        Animated.timing(scaleAnims[index], { toValue: 0.8, duration: 100, useNativeDriver: true }),
        Animated.timing(scaleAnims[index], { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
    }
    onNavigate(route);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.cardBg, borderTopColor: themeColors.background }]}>
      {NAV_ITEMS.map((item, index) => {
        const isActive = activeRoute === item.route;
        return (
          <TouchableOpacity
            key={item.route}
            style={styles.navItem}
            onPress={() => handlePress(item.route, index)}
            activeOpacity={0.7}
          >
            <Animated.View
              style={[
                styles.iconWrapper,
                isActive && styles.iconWrapperActive,
                { transform: [{ scale: scaleAnims[index] }] },
              ]}
            >
              <Ionicons
                name={isActive ? item.activeIcon : item.icon}
                size={22}
                color={isActive ? colors.white : themeColors.textMuted}
              />
            </Animated.View>
            <Text style={[styles.label, { color: themeColors.textMuted }, isActive && styles.labelActive]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 12,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  iconWrapper: {
    width: 44,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperActive: {
    backgroundColor: colors.primary,
    width: 52,
    height: 32,
    borderRadius: 16,
  },
  label: {
    fontSize: 10,
    color: colors.gray400,
    fontWeight: '500',
  },
  labelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});

export default BottomNav;
