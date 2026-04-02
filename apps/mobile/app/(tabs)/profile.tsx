import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useThemeColors } from "../../hooks/useThemeColors";
import { useAuthStore } from "../../store/authStore";
import { useBiometrics } from "../../hooks/useBiometrics";
import { ThemedText } from "../../components/ThemedText";
import { ThemedInput } from "../../components/ThemedInput";
import { PrimaryButton } from "../../components/PrimaryButton";
import { spacing, radius } from "../../theme";
import api from "../../services/api";
import i18n from "../../i18n";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { user, logout, updateUser } = useAuthStore();

  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [saving, setSaving] = useState(false);

  // Password change
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [changingPass, setChangingPass] = useState(false);

  const {
    isAvailable: biometricAvailable,
    isEnabled: biometricEnabled,
    getBiometricLabel,
    getBiometricIcon,
    enableBiometrics,
    disableBiometrics,
  } = useBiometrics();

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      const res = await api.patch("/auth/me", {
        displayName: displayName.trim(),
      });
      updateUser(res.data.data);
      Alert.alert("OK", t("profile.updateDetails"));
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.error || t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPass !== confirmPass) {
      Alert.alert("Error", t("profile.confirmPassword"));
      return;
    }
    setChangingPass(true);
    try {
      await api.post("/auth/me/change-password", {
        currentPassword: currentPass,
        newPassword: newPass,
      });
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
      Alert.alert("OK", t("profile.changePassword"));
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.error || t("common.error"));
    } finally {
      setChangingPass(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(t("profile.logout"), t("profile.logoutConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("profile.logout"),
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === "es" ? "en" : "es";
    i18n.changeLanguage(newLang);
    api.patch("/auth/me", { locale: newLang }).catch(() => {});
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.surface }]}
      edges={["top"]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <ThemedText variant="label" color={colors.onSurfaceVariant}>
              {t("profile.accountSettings")}
            </ThemedText>
            <Text style={[styles.headline, { color: colors.onSurface }]}>
              {t("profile.yourProfile")}
            </Text>
          </View>
        </View>

        {/* Personal Info */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surfaceContainerLowest },
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="person-outline" size={20} color={colors.primary} />
            <ThemedText variant="title">
              {t("profile.personalInfo")}
            </ThemedText>
          </View>
          <View style={{ gap: spacing.lg }}>
            <ThemedInput
              label={t("profile.displayName")}
              value={displayName}
              onChangeText={setDisplayName}
            />
            <View style={styles.emailRow}>
              <ThemedText
                variant="label"
                color={colors.onSurfaceVariant}
                style={{ marginLeft: 4, marginBottom: 6 }}
              >
                {t("profile.email")}
              </ThemedText>
              <View
                style={[
                  styles.emailValue,
                  { backgroundColor: colors.surfaceContainerHighest },
                ]}
              >
                <Text style={{ color: colors.onSurfaceVariant }}>
                  {user?.email}
                </Text>
              </View>
            </View>
            <PrimaryButton
              title={t("profile.updateDetails")}
              onPress={handleUpdateProfile}
              loading={saving}
            />
          </View>
        </View>

        {/* Language */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surfaceContainerLowest },
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="language-outline" size={20} color={colors.secondary} />
            <ThemedText variant="title">{t("profile.language")}</ThemedText>
          </View>
          <TouchableOpacity
            style={[
              styles.langRow,
              { backgroundColor: colors.surfaceContainer },
            ]}
            onPress={toggleLanguage}
            activeOpacity={0.7}
          >
            <View>
              <Text style={[styles.langLabel, { color: colors.onSurface }]}>
                {i18n.language === "es"
                  ? t("profile.spanish")
                  : t("profile.english")}
              </Text>
              <Text style={[styles.langHint, { color: colors.onSurfaceVariant }]}>
                {t("profile.languageDesc")}
              </Text>
            </View>
            <Ionicons
              name="swap-horizontal"
              size={22}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Security */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surfaceContainer },
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="shield-outline" size={20} color={colors.tertiary} />
            <ThemedText variant="title">{t("profile.security")}</ThemedText>
          </View>
          <View style={{ gap: spacing.lg }}>
            {biometricAvailable && (
              <TouchableOpacity
                style={[
                  styles.biometricRow,
                  { backgroundColor: colors.surfaceContainerHighest },
                ]}
                onPress={async () => {
                  if (biometricEnabled) {
                    await disableBiometrics();
                  } else {
                    const token = await SecureStore.getItemAsync("refreshToken");
                    if (token) {
                      const ok = await enableBiometrics(token);
                      if (!ok) {
                        Alert.alert("Error", "No se pudo activar la autenticación biométrica.");
                      }
                    }
                  }
                }}
                activeOpacity={0.7}
              >
                <View style={styles.biometricInfo}>
                  <Ionicons
                    name={getBiometricIcon() as any}
                    size={22}
                    color={colors.primary}
                  />
                  <View>
                    <Text style={[styles.biometricLabel, { color: colors.onSurface }]}>
                      {getBiometricLabel()}
                    </Text>
                    <Text style={[styles.biometricHint, { color: colors.onSurfaceVariant }]}>
                      Acceso rápido sin contraseña
                    </Text>
                  </View>
                </View>
                <Switch
                  value={biometricEnabled}
                  onValueChange={async (value) => {
                    if (!value) {
                      await disableBiometrics();
                    } else {
                      const token = await SecureStore.getItemAsync("refreshToken");
                      if (token) await enableBiometrics(token);
                    }
                  }}
                  trackColor={{ true: colors.primary }}
                />
              </TouchableOpacity>
            )}

            <ThemedInput
              label={t("profile.currentPassword")}
              value={currentPass}
              onChangeText={setCurrentPass}
              secureTextEntry
            />
            <ThemedInput
              label={t("profile.newPassword")}
              value={newPass}
              onChangeText={setNewPass}
              secureTextEntry
            />
            <ThemedInput
              label={t("profile.confirmPassword")}
              value={confirmPass}
              onChangeText={setConfirmPass}
              secureTextEntry
            />
            <PrimaryButton
              title={t("profile.changePassword")}
              onPress={handleChangePassword}
              loading={changingPass}
              variant="outline"
              disabled={!currentPass || !newPass || !confirmPass}
            />
          </View>
        </View>

        {/* Subscription */}
        <View
          style={[
            styles.card,
            {
              backgroundColor:
                user?.plan === "PREMIUM"
                  ? colors.tertiaryContainer
                  : colors.surfaceContainerLow,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons
              name="diamond-outline"
              size={20}
              color={
                user?.plan === "PREMIUM"
                  ? colors.onTertiaryContainer
                  : colors.onSurfaceVariant
              }
            />
            <ThemedText
              variant="title"
              color={
                user?.plan === "PREMIUM"
                  ? colors.onTertiaryContainer
                  : colors.onSurface
              }
            >
              {user?.plan === "PREMIUM"
                ? t("profile.premiumPlan")
                : t("profile.freePlan")}
            </ThemedText>
          </View>
          {user?.plan !== "PREMIUM" && (
            <PrimaryButton
              title={t("profile.upgradeToPremium")}
              onPress={() => {
                // TODO: Navigate to premium upgrade
              }}
            />
          )}
        </View>

        {/* Logout */}
        <PrimaryButton
          title={t("profile.logout")}
          onPress={handleLogout}
          variant="danger"
          icon={<Ionicons name="log-out-outline" size={20} color="#ba1a1a" />}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.lg,
    paddingBottom: 100,
  },
  header: {
    marginBottom: spacing.sm,
  },
  headline: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -1,
    marginTop: spacing.xs,
  },
  card: {
    padding: spacing.xl,
    borderRadius: radius.xl,
    gap: spacing.lg,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  emailRow: {
    gap: 0,
  },
  emailValue: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 16,
    borderRadius: radius.lg,
  },
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
    borderRadius: radius.lg,
  },
  langLabel: {
    fontSize: 15,
    fontWeight: "700",
  },
  langHint: {
    fontSize: 12,
    marginTop: 2,
  },
  biometricRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
    borderRadius: radius.lg,
  },
  biometricInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },
  biometricLabel: {
    fontSize: 15,
    fontWeight: "700",
  },
  biometricHint: {
    fontSize: 12,
    marginTop: 2,
  },
});
