import React from 'react';
import { View, StyleSheet } from 'react-native';
import MenuButton from './MenuButton';
import colors from '../../constants/colors';
import { useAppContext } from '../../context/AppContext';

const MENU_ITEMS = [
  { icon: 'calendar',        label: 'Jadwal',      bgColor: '#d1fae5', iconColor: colors.primary,       route: 'Jadwal' },
];

const HomeCenter = ({ onNavigate }) => {
  const { themeColors } = useAppContext();

  return (
    <View style={[styles.container, { backgroundColor: themeColors.cardBg }]}>
      <View style={styles.grid}>
        {MENU_ITEMS.map((item) => (
          <MenuButton
            key={item.route}
            icon={item.icon}
            label={item.label}
            bgColor={item.bgColor}
            iconColor={item.iconColor}
            onPress={() => onNavigate && onNavigate(item.route)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white, // fallback
    borderRadius: 24,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
});

export default HomeCenter;
