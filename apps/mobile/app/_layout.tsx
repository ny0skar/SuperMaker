import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { useAuthStore } from "../store/authStore";
import { useThemeColors } from "../hooks/useThemeColors";
import "../i18n";

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);
  const scheme = useColorScheme();
  const colors = useThemeColors();

  useEffect(() => {
    initialize();
  }, [initialize]);

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
      </Stack>
    </>
  );
}
