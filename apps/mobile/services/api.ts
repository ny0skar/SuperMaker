import axios from "axios";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { Platform } from "react-native";

function getDevApiUrl(): string {
  // On physical device, use the Expo host IP (same network as your Mac)
  const debuggerHost =
    Constants.expoConfig?.hostUri ?? Constants.manifest2?.extra?.expoGo?.debuggerHost;
  if (debuggerHost) {
    const ip = debuggerHost.split(":")[0];
    return `http://${ip}:4000/api`;
  }
  // Android emulator uses 10.0.2.2, iOS simulator uses localhost
  if (Platform.OS === "android") return "http://10.0.2.2:4000/api";
  return "http://localhost:4000/api";
}

const API_URL = __DEV__
  ? getDevApiUrl()
  : "https://api.supermaker.app/api"; // TODO: update with production URL

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Attach access token to every request
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 by refreshing token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        const res = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefresh } = res.data.data.tokens;
        await SecureStore.setItemAsync("accessToken", accessToken);
        await SecureStore.setItemAsync("refreshToken", newRefresh);

        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        await SecureStore.deleteItemAsync("accessToken");
        await SecureStore.deleteItemAsync("refreshToken");
        // The auth store will detect the missing token and redirect to login
      }
    }

    return Promise.reject(error);
  },
);

export default api;
