import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Use explicit IPv4 for physical device compatibility with Expo Go.
// Current IP checked via ipconfig.
const BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:3001/api' 
  : 'http://10.139.210.139:3001/api';

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