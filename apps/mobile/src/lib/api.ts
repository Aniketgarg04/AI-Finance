import axios from 'axios';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';

// For Android emulator, use 10.0.2.2 instead of localhost
// For iOS simulator, use localhost
// For physical devices, use the host computer's local IP address dynamically from the Expo packager host
export const getDynamicApiUrl = () => {
  try {
    const localUrl = Linking.createURL('/');
    const match = localUrl.match(/^[a-z]+:\/\/([^:/]+)/i);
    if (match && match[1]) {
      const host = match[1];
      
      // If Expo is running on LAN (Wi-Fi), use the dynamically resolved IP
      if (host !== 'localhost' && host !== '127.0.0.1' && host !== '') {
        console.log(`[API] Resolved dynamic LAN host: http://${host}:3001`);
        return `http://${host}:3001`;
      }
      
      // If Expo is running via localhost (USB Debugging / Emulator), use localhost
      // ADB reverse will forward phone's localhost:3001 to the PC's localhost:3001
      if (host === 'localhost' || host === '127.0.0.1') {
         console.log(`[API] Resolved USB/Local host: http://localhost:3001`);
         return `http://localhost:3001`;
      }
    }
  } catch (error) {
    console.error('[API] Failed to resolve dynamic API URL', error);
  }
  
  // Ultimate fallback (e.g. if Linking fails)
  return Platform.OS === 'android' 
    ? 'http://10.0.2.2:3001' 
    : 'http://localhost:3001';
};

export const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dynamic baseURL injector interceptor
api.interceptors.request.use(
  (config) => {
    config.baseURL = getDynamicApiUrl();
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// We will add auth interceptor after creating the auth store
