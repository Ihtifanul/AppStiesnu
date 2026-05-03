import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getHostFromExpo = () => {
  const hostUri = Constants?.manifest?.debuggerHost
    || Constants?.manifest?.hostUri
    || Constants?.manifest2?.hostUri
    || Constants?.manifest2?.debuggerHost
    || Constants?.expoConfig?.hostUri;
  if (!hostUri) return null;
  return hostUri.split(':')[0];
};

const getApiHosts = () => {
  const extraHosts = Constants?.manifest?.extra?.apiHosts
    || Constants?.manifest2?.extra?.apiHosts
    || Constants?.expoConfig?.extra?.apiHosts
    || [];
  return Array.isArray(extraHosts) ? extraHosts : [];
};

const getPrimaryHost = () => {
  if (Platform.OS === 'web') return 'localhost';
  
  const expoHost = getHostFromExpo();
  if (expoHost) return expoHost;
  
  const extraHosts = getApiHosts();
  if (extraHosts.length > 0) return extraHosts[0];
  
  return '10.0.2.2';
};

const getAllFallbackHosts = () => {
  const hosts = new Set();
  
  // Add primary host first
  const primary = getPrimaryHost();
  hosts.add(primary);
  
  // Add configured hosts from app.json
  getApiHosts().forEach(h => hosts.add(h));
  
  // Add standard fallbacks
  hosts.add('10.0.2.2');
  hosts.add('127.0.0.1');
  
  return Array.from(hosts);
};

const APP_HOST = getPrimaryHost();
const BASE_URL = `http://${APP_HOST}:3001/api`;
const API_ORIGIN = BASE_URL.replace(/\/api$/, '');
const FALLBACK_HOSTS = getAllFallbackHosts();

let currentHostIndex = 0;

const getNextHostUrl = (path = '') => {
  if (currentHostIndex >= FALLBACK_HOSTS.length) {
    currentHostIndex = 0;
  }
  const host = FALLBACK_HOSTS[currentHostIndex];
  return `http://${host}:3001${path}`;
};

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 5000,
});

// Otomatis tambahkan token di setiap request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Retry logic with fallback hosts
api.interceptors.response.use(
  response => response,
  async error => {
    const config = error.config;
    
    // If request failed and we have fallback hosts to try
    if (error.response?.status !== 401 && !config.__retried) {
      config.__retried = true;
      currentHostIndex++;
      
      if (currentHostIndex < FALLBACK_HOSTS.length) {
        const nextUrl = getNextHostUrl(config.url);
        config.url = nextUrl;
        return api(config);
      }
    }
    
    return Promise.reject(error);
  }
);

export const getAbsoluteUrl = (path) => {
  if (!path) return path;
  if (path.startsWith('http') || path.startsWith('data:image/')) return path;
  return `${API_ORIGIN}${path}`;
};

export const getApiConfig = () => ({
  baseUrl: API_ORIGIN,
  apiHost: APP_HOST,
  fallbackHosts: FALLBACK_HOSTS,
});

export default api;