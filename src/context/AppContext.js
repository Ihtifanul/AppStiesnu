import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../constants/colors';
import api from '../config/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState({ role: 'guest' });
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Auth
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        const storedUser = await AsyncStorage.getItem('userData');
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (e) {
        console.error('Failed to load auth data', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadAuthData();
  }, []);

  const login = async (userData, tokenStr) => {
    try {
      await AsyncStorage.setItem('userToken', tokenStr);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setToken(tokenStr);
      setUser(userData);
      api.defaults.headers.common['Authorization'] = `Bearer ${tokenStr}`;
    } catch (e) {
      console.error('Save auth data failed', e);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      setToken(null);
      setUser({ role: 'guest' });
      delete api.defaults.headers.common['Authorization'];
    } catch (e) {
      console.error('Remove auth data failed', e);
    }
  };

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const themeColors = isDarkMode ? {
    background: '#111827',
    cardBg: '#1f2937',
    text: '#ffffff',
    textMuted: '#9ca3af',
  } : {
    background: colors.background,
    cardBg: colors.white,
    text: colors.gray800,
    textMuted: colors.gray500,
  };

  return (
    <AppContext.Provider value={{
      isDarkMode,
      toggleTheme,
      themeColors,
      user,
      token,
      login,
      logout,
      isLoading
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
