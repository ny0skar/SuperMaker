import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import EventSource from "react-native-sse";

type FamilyEvent =
  | "connected"
  | "wishlist:added"
  | "wishlist:updated"
  | "wishlist:deleted"
  | "visit:finished"
  | "error";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { useFamilyStore } from "../store/familyStore";
import { useWishlistStore } from "../store/wishlistStore";

function getApiBaseUrl(): string {
  if (__DEV__) {
    const debuggerHost =
      Constants.expoConfig?.hostUri ??
      Constants.manifest2?.extra?.expoGo?.debuggerHost;
    if (debuggerHost) {
      const ip = debuggerHost.split(":")[0];
      return `http://${ip}:4000/api`;
    }
    if (Platform.OS === "android") return "http://10.0.2.2:4000/api";
    return "http://localhost:4000/api";
  }
  return "https://sm.ozz.com.mx/api";
}

/**
 * Hook that subscribes to SSE events for the user's family group.
 * Automatically connects when the app is active and disconnects when backgrounded.
 */
export function useFamilyEvents() {
  const { group } = useFamilyStore();
  const { fetchWishlist } = useWishlistStore();
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!group) return;

    let mounted = true;

    const connect = async () => {
      const token = await SecureStore.getItemAsync("accessToken");
      if (!token || !mounted) return;

      // Close existing connection
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }

      const url = `${getApiBaseUrl()}/sse/family/events`;

      const es = new EventSource<FamilyEvent>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      es.addEventListener("connected", () => {
        console.log("[SSE] Connected to family events");
      });

      es.addEventListener("wishlist:added", () => {
        if (mounted) fetchWishlist();
      });

      es.addEventListener("wishlist:updated", () => {
        if (mounted) fetchWishlist();
      });

      es.addEventListener("wishlist:deleted", () => {
        if (mounted) fetchWishlist();
      });

      es.addEventListener("visit:finished", () => {
        if (mounted) fetchWishlist();
      });

      es.addEventListener("error", () => {
        // Will auto-reconnect on next app foreground
        console.log("[SSE] Connection error, will retry");
      });

      esRef.current = es;
    };

    const disconnect = () => {
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
    };

    // Connect on mount
    connect();

    // Reconnect when app comes to foreground, disconnect on background
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        connect();
      } else {
        disconnect();
      }
    });

    return () => {
      mounted = false;
      disconnect();
      subscription.remove();
    };
  }, [group?.id]);
}
