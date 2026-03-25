import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { useAuthStore } from "../store/authStore";
import "../i18n";

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);
  const scheme = useColorScheme();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="visit/[id]" />
      </Stack>
    </>
  );
}
