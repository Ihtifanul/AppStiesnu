import React from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../constants/colors';
import MenuButton from '../components/home/MenuButton';
import IconButton from '../components/common/IconButton';

const ALL_MENUS = [
  { icon: 'calendar', label: 'Jadwal', bgColor: '#91f0b1ff', iconColor: colors.primary, route: 'Jadwal' },
];

const HomeCenterScreen = ({ onNavigate }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <LinearGradient colors={[colors.primary, colors.primaryMid]} style={styles.header}>
        <View style={styles.headerRow}>
          <IconButton name="arrow-back" color={colors.white} bgColor="rgba(255,255,255,0.2)" onPress={() => onNavigate('Home')} />
          <Text style={styles.headerTitle}>Semua Layanan</Text>
          <View style={{ width: 44 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {ALL_MENUS.map((item) => (
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
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.white },
  body: { flex: 1, padding: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 24, marginTop: 8 },
});

export default HomeCenterScreen;
