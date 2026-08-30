import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Important: When running on a physical device, 'localhost' will not work.
// You must replace this with your computer's local IP address (e.g., 192.168.1.5).
// 10.0.2.2 is the default for Android Emulator loopback to host localhost.
const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080/api';
  }
  return 'http://localhost:8080/api'; 
};

export const API_BASE = getBaseUrl();

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error fetching token from storage', error);
  }
  return config;
});

// ─── Auth ──────────────────────────────────────────────
export const loginUser = (payload: { usernameOrEmail: string; password: string }) => api.post('/auth/login', payload);
export const registerUser = (payload: { username: string; email: string; password: string; organizationName: string }) => api.post('/auth/register', payload);

// ─── Profile ───────────────────────────────────────────
export const getCurrentUserProfile = () => api.get('/hr/me');
export const fetchMyProfile = () => api.get('/profile/me');

// ─── Social Feed ───────────────────────────────────────
export const fetchFeed = () => api.get('/feed');

export default api;
