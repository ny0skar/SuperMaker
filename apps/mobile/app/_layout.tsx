import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { useAuthStore } from "../store/authStore";
import { useFamilyStore } from "../store/familyStore";
import { useThemeColors } from "../hooks/useThemeColors";
import { useFamilyEvents } from "../hooks/useFamilyEvents";
import "../i18n";

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fetchFamily = useFamilyStore((s) => s.fetchFamily);
  const scheme = useColorScheme();
  const colors = useThemeColors();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Fetch family group once authenticated
  useEffect(() => {
    if (isAuthenticated) fetchFamily();
  }, [isAuthenticated]);

  // Subscribe to real-time family events
  useFamilyEvents();

  return (
    <>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.surface },
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="visit/[id]" />
        <Stack.Screen name="wishlist/index" />
        <Stack.Screen name="upgrade/index" />
        <Stack.Screen name="visit/scan/[id]" />
      </Stack>
    </>
  );
}
