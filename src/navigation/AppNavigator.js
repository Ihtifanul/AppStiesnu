import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import BottomNav from '../components/navigation/BottomNav';
import { useAppContext } from '../context/AppContext';

// Screens
import HomeScreen from '../screens/HomeScreen';
import BeritaScreen from '../screens/BeritaScreen';
import JadwalScreen from '../screens/JadwalScreen';
import NotifikasiScreen from '../screens/NotifikasiScreen';
import MenuScreen from '../screens/MenuScreen';
import HomeCenterScreen from '../screens/HomeCenterScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import EditProfilScreen from '../screens/EditProfilScreen';
import UserAddEventScreen from '../screens/UserAddEventScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

import AdminHomeScreen from '../screens/AdminHomeScreen';
import AdminAkunScreen from '../screens/AdminAkunScreen';
import AdminAddAkunScreen from '../screens/AdminAddAkunScreen';
import AdminEditAkunScreen from '../screens/AdminEditAkunScreen';
import AdminJadwalScreen from '../screens/AdminJadwalScreen';
import AdminAddEventScreen from '../screens/AdminAddEventScreen';
import AdminEditEventScreen from '../screens/AdminEditEventScreen';
import AdminBeritaScreen from '../screens/AdminBeritaScreen';
import AdminAddBeritaScreen from '../screens/AdminAddBeritaScreen';
import AdminEditBeritaScreen from '../screens/AdminEditBeritaScreen';
import AdminNotifikasiScreen from '../screens/AdminNotifikasiScreen';

const SCREENS = {
  Home: HomeScreen,
  Berita: BeritaScreen,
  Jadwal: JadwalScreen,
  Notifikasi: NotifikasiScreen,
  Menu: MenuScreen,
  HomeCenterScreen: HomeCenterScreen,
  Login: LoginScreen,
  Register: RegisterScreen,
  EditProfil: EditProfilScreen,
  UserAddEvent: UserAddEventScreen,
  ForgotPassword: ForgotPasswordScreen,

  AdminHome: AdminHomeScreen,
  AdminAkun: AdminAkunScreen,
  AdminAddAkun: AdminAddAkunScreen,
  AdminJadwal: AdminJadwalScreen,
  AdminAddEvent: AdminAddEventScreen,
  AdminEditEvent: AdminEditEventScreen,
  AdminBerita: AdminBeritaScreen,
  AdminAddBerita: AdminAddBeritaScreen,
  AdminEditBerita: AdminEditBeritaScreen,
  AdminEditAkun: AdminEditAkunScreen,
  AdminNotifikasi: AdminNotifikasiScreen,
};

const BOTTOM_NAV_ROUTES_USER = ['Home', 'Berita', 'Jadwal', 'Notifikasi', 'Menu'];
const BOTTOM_NAV_ROUTES_ADMIN = ['AdminHome', 'AdminBerita', 'AdminJadwal', 'AdminAkun', 'AdminNotifikasi', 'Menu'];

const AppNavigator = () => {
  const { user, isLoading } = useAppContext();
  const [activeRoute, setActiveRoute] = useState('Home');
  const [routeParams, setRouteParams] = useState({});

  useEffect(() => {
    if (!isLoading) {
      if (user.role === 'admin') {
        setActiveRoute('AdminHome');
      } else {
        setActiveRoute('Home');
      }
    }
  }, [isLoading, user.role]);

  const navigate = (route, params = {}) => {
    // If guest tries to access protected routes, redirect to login
    if (user.role === 'guest' && (route === 'EditProfil' || route === 'UserAddEvent')) {
      setActiveRoute('Login');
      setRouteParams({});
      return;
    }
    setActiveRoute(route);
    setRouteParams(params);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  const ActiveScreen = SCREENS[activeRoute] || (() => <View style={{flex:1,backgroundColor:'red'}}><Text>Screen Not Found</Text></View>);

  const isBottomNavVisible = user.role === 'admin' 
    ? BOTTOM_NAV_ROUTES_ADMIN.includes(activeRoute)
    : BOTTOM_NAV_ROUTES_USER.includes(activeRoute);

  return (
    <View style={styles.container}>
      <View style={styles.screen}>
        <ActiveScreen onNavigate={navigate} userRole={user.role} routeParams={routeParams} />
      </View>

      {isBottomNavVisible && (
        <BottomNav activeRoute={activeRoute} onNavigate={navigate} userRole={user.role} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  screen: {
    flex: 1,
  },
});

export default AppNavigator;
