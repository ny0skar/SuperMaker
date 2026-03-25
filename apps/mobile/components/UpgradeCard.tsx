import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "../hooks/useThemeColors";
import { ThemedText } from "./ThemedText";
import { PrimaryButton } from "./PrimaryButton";
import { spacing, radius } from "../theme";

interface Props {
  onUpgrade: () => void;
}

const FEATURES = [
  "premium.unlimitedStores",
  "premium.unlimitedItems",
  "premium.visitHistory",
  "premium.analytics",
  "premium.expirationTracking",
  "premium.ticketScanning",
  "premium.offlineMode",
] as const;

export function UpgradeCard({ onUpgrade }: Props) {
  const { t } = useTranslation();
  const colors = useThemeColors();

  return (
    <View
      style={[styles.card, { backgroundColor: colors.tertiaryContainer }]}
    >
      <Ionicons name="diamond" size={32} color={colors.onTertiaryContainer} />
      <ThemedText
        variant="title"
        color={colors.onTertiaryContainer}
        style={styles.title}
      >
        {t("premium.title")}
      </ThemedText>
      <ThemedText
        variant="caption"
        color={colors.onTertiaryContainer}
        style={styles.subtitle}
      >
        {t("premium.subtitle")}
      </ThemedText>

      <View style={styles.featuresList}>
        {FEATURES.map((key) => (
          <View key={key} style={styles.featureRow}>
            <Ionicons
              name="checkmark-circle"
              size={18}
              color={colors.onTertiaryContainer}
            />
            <ThemedText
              variant="caption"
              color={colors.onTertiaryContainer}
              style={styles.featureText}
            >
              {t(key)}
            </ThemedText>
          </View>
        ))}
      </View>

      <PrimaryButton
        title={t("premium.upgrade")}
        onPress={onUpgrade}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing["2xl"],
    borderRadius: radius.xl,
    alignItems: "center",
    width: "100%",
  },
  title: {
    marginTop: spacing.md,
    textAlign: "center",
  },
  subtitle: {
    marginTop: spacing.sm,
    textAlign: "center",
    lineHeight: 20,
    opacity: 0.85,
  },
  featuresList: {
    alignSelf: "stretch",
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  featureText: {
    flex: 1,
  },
  button: {
    marginTop: spacing.xl,
    alignSelf: "stretch",
  },
});
