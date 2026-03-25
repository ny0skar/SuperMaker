import { Redirect } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useAuthStore } from "../store/authStore";
import { useThemeColors } from "../hooks/useThemeColors";

export default function Index() {
  const { isLoading, isAuthenticated } = useAuthStore();
  const colors = useThemeColors();

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/dashboard" />;
  }

  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
