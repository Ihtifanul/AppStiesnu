import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Use explicit IPv4 for physical device compatibility with Expo Go.
// You might need to change '192.168.1.5' to your PC's IP if it changes.
const BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:3001/api' 
  : 'http://192.168.1.5:3001/api';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// Otomatis tambahkan token di setiap request
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;