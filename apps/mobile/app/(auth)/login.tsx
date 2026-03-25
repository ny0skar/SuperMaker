import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "../../hooks/useThemeColors";
import { useAuthStore } from "../../store/authStore";
import { ThemedInput } from "../../components/ThemedInput";
import { PrimaryButton } from "../../components/PrimaryButton";
import { spacing, radius } from "../../theme";

export default function LoginScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace("/(tabs)/dashboard");
    } catch (err: any) {
      const msg =
        err?.response?.data?.error || t("auth.invalidCredentials");
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: colors.surface },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoSection}>
          <View
            style={[
              styles.logoIcon,
              { backgroundColor: colors.primaryContainer },
            ]}
          >
            <Ionicons name="sparkles" size={28} color={colors.onPrimaryContainer} />
          </View>
          <Text style={[styles.appName, { color: colors.onSurface }]}>
            SuperMaker
          </Text>
          <Text style={[styles.tagline, { color: colors.onSurfaceVariant }]}>
            {t("auth.subtitle")}
          </Text>
        </View>

        {/* Form Card */}
        <View
          style={[
            styles.formCard,
            { backgroundColor: colors.surfaceContainerLowest },
          ]}
        >
          <Text style={[styles.formTitle, { color: colors.onSurface }]}>
            {t("auth.welcome")}
          </Text>

          <View style={styles.formFields}>
            <ThemedInput
              label={t("auth.email")}
              placeholder={t("auth.emailPlaceholder")}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              icon={
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={colors.outline}
                />
              }
            />

            <ThemedInput
              label={t("auth.password")}
              placeholder={t("auth.passwordPlaceholder")}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password"
              icon={
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.outline}
                />
              }
            />

            <PrimaryButton
              title={t("auth.login")}
              onPress={handleLogin}
              loading={loading}
              disabled={!email.trim() || !password.trim()}
            />
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.onSurfaceVariant }]}>
              {t("auth.noAccount")}{" "}
            </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={[styles.footerLink, { color: colors.primary }]}>
                  {t("auth.createFree")}
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: spacing["2xl"],
  },
  logoIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  appName: {
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 15,
    marginTop: spacing.sm,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 22,
  },
  formCard: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: spacing.xl,
  },
  formFields: {
    gap: spacing.lg,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing["2xl"],
    paddingTop: spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: "700",
  },
});
