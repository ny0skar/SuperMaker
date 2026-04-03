import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "../../hooks/useThemeColors";
import { useAuthStore } from "../../store/authStore";
import { PrimaryButton } from "../../components/PrimaryButton";
import { spacing, radius } from "../../theme";

type PlanType = "PREMIUM" | "FAMILY";

const PREMIUM_BENEFITS = [
  { icon: "storefront-outline", key: "unlimitedStores" },
  { icon: "cart-outline", key: "unlimitedItems" },
  { icon: "time-outline", key: "visitHistory" },
  { icon: "bar-chart-outline", key: "analytics" },
  { icon: "scan-outline", key: "ticketScanning" },
  { icon: "cloud-offline-outline", key: "offlineMode" },
  { icon: "calendar-outline", key: "expirationTracking" },
];

const FAMILY_BENEFITS = [
  { icon: "people-outline", key: "familyMembers" },
  { icon: "list-outline", key: "sharedWishlist" },
  { icon: "pulse-outline", key: "realTimeUpdates" },
  { icon: "storefront-outline", key: "unlimitedStores" },
  { icon: "cart-outline", key: "unlimitedItems" },
  { icon: "time-outline", key: "visitHistory" },
  { icon: "bar-chart-outline", key: "analytics" },
  { icon: "scan-outline", key: "ticketScanning" },
  { icon: "cloud-offline-outline", key: "offlineMode" },
];

export default function UpgradeScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const user = useAuthStore((s) => s.user);
  const [modalPlan, setModalPlan] = useState<PlanType | null>(null);

  const isPremium = user?.plan === "PREMIUM";
  const isFamily = user?.plan === "FAMILY";

  const handlePurchase = (plan: PlanType, period: "monthly" | "yearly") => {
    // TODO: Connect to RevenueCat
    Alert.alert(
      t("upgrade.comingSoon"),
      t("upgrade.comingSoonDesc"),
    );
  };

  if (isFamily) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            title: t("upgrade.title"),
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.onSurface,
            headerShadowVisible: false,
          }}
        />
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface }]} edges={[]}>
          <View style={styles.alreadyTop}>
            <Ionicons name="checkmark-circle" size={64} color={colors.primary} />
            <Text style={[styles.alreadyTopTitle, { color: colors.onSurface }]}>
              {t("upgrade.alreadyFamily")}
            </Text>
            <Text style={[styles.alreadyTopDesc, { color: colors.onSurfaceVariant }]}>
              {t("upgrade.alreadyFamilyDesc")}
            </Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  const benefits = modalPlan === "FAMILY" ? FAMILY_BENEFITS : PREMIUM_BENEFITS;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t("upgrade.title"),
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.onSurface,
          headerShadowVisible: false,
        }}
      />
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface }]} edges={[]}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Ionicons name="diamond" size={40} color={colors.primary} />
            <Text style={[styles.headline, { color: colors.onSurface }]}>
              {t("upgrade.headline")}
            </Text>
            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
              {t("upgrade.subtitle")}
            </Text>
          </View>

          {/* Premium Card — only show if user is FREE */}
          {!isPremium && (
            <TouchableOpacity
              style={[styles.planCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}
              onPress={() => setModalPlan("PREMIUM")}
              activeOpacity={0.7}
            >
              <View style={styles.planCardHeader}>
                <Ionicons name="diamond-outline" size={24} color={colors.secondary} />
                <Text style={[styles.planName, { color: colors.onSurface }]}>
                  Premium
                </Text>
              </View>
              <Text style={[styles.planPrice, { color: colors.secondary }]}>
                $49/mes · $449/año
              </Text>
              <Text style={[styles.planDesc, { color: colors.onSurfaceVariant }]}>
                {t("upgrade.premiumShort")}
              </Text>
              <View style={styles.planArrow}>
                <Text style={[styles.planCta, { color: colors.primary }]}>
                  {t("upgrade.seeBenefits")}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.primary} />
              </View>
            </TouchableOpacity>
          )}

          {/* Family Card */}
          <TouchableOpacity
            style={[
              styles.planCard,
              {
                backgroundColor: colors.primaryContainer,
                borderColor: colors.primary,
                borderWidth: 2,
              },
            ]}
            onPress={() => setModalPlan("FAMILY")}
            activeOpacity={0.7}
          >
            <View style={[styles.recommendedBadge, { backgroundColor: colors.primary }]}>
              <Text style={{ color: colors.onPrimary, fontSize: 11, fontWeight: "800" }}>
                {t("upgrade.recommended")}
              </Text>
            </View>
            <View style={styles.planCardHeader}>
              <Ionicons name="people" size={24} color={colors.onPrimaryContainer} />
              <Text style={[styles.planName, { color: colors.onPrimaryContainer }]}>
                Familiar
              </Text>
            </View>
            <Text style={[styles.planPrice, { color: colors.onPrimaryContainer }]}>
              $79/mes · $699/año
            </Text>
            <Text style={[styles.planDesc, { color: colors.onPrimaryContainer }]}>
              {t("upgrade.familyShort")}
            </Text>
            {isPremium && (
              <View style={[styles.prorationNote, { backgroundColor: colors.surface }]}>
                <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
                <Text style={[styles.prorationText, { color: colors.onSurface }]}>
                  {t("upgrade.prorationNote")}
                </Text>
              </View>
            )}
            <View style={styles.planArrow}>
              <Text style={[styles.planCta, { color: colors.onPrimaryContainer }]}>
                {t("upgrade.seeBenefits")}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.onPrimaryContainer} />
            </View>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      {/* Benefits Modal */}
      <Modal
        visible={modalPlan !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalPlan(null)}
      >
        <SafeAreaView style={[styles.modalSafe, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={[styles.modalTitle, { color: colors.onSurface }]}>
                {modalPlan === "FAMILY" ? "Plan Familiar" : "Plan Premium"}
              </Text>
              <Text style={[styles.modalSubtitle, { color: colors.onSurfaceVariant }]}>
                {modalPlan === "FAMILY"
                  ? "$79/mes · $699/año"
                  : "$49/mes · $449/año"}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setModalPlan(null)}>
              <Ionicons name="close-circle" size={32} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            {/* Proration notice for Premium → Family */}
            {isPremium && modalPlan === "FAMILY" && (
              <View style={[styles.prorationBanner, { backgroundColor: colors.tertiaryContainer }]}>
                <Ionicons name="swap-horizontal" size={20} color={colors.onTertiaryContainer} />
                <Text style={[styles.prorationBannerText, { color: colors.onTertiaryContainer }]}>
                  {t("upgrade.prorationDetail")}
                </Text>
              </View>
            )}

            {/* Benefits list */}
            <View style={styles.benefitsList}>
              {benefits.map((b, i) => (
                <View key={i} style={styles.benefitRow}>
                  <View style={[styles.benefitIcon, { backgroundColor: colors.primaryContainer }]}>
                    <Ionicons name={b.icon as any} size={20} color={colors.primary} />
                  </View>
                  <Text style={[styles.benefitText, { color: colors.onSurface }]}>
                    {t(`upgrade.benefit_${b.key}`)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Purchase buttons */}
            <View style={styles.purchaseButtons}>
              <PrimaryButton
                title={modalPlan === "FAMILY"
                  ? t("upgrade.buyFamilyYearly")
                  : t("upgrade.buyPremiumYearly")}
                onPress={() => handlePurchase(modalPlan!, "yearly")}
                icon={<Ionicons name="star" size={18} color="#fff" />}
              />
              <Text style={[styles.saveNote, { color: colors.primary }]}>
                {t("upgrade.saveYearly")}
              </Text>
              <PrimaryButton
                title={modalPlan === "FAMILY"
                  ? t("upgrade.buyFamilyMonthly")
                  : t("upgrade.buyPremiumMonthly")}
                onPress={() => handlePurchase(modalPlan!, "monthly")}
                variant="outline"
              />
            </View>

            <Text style={[styles.legal, { color: colors.outline }]}>
              {t("upgrade.legal")}
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    padding: spacing.xl,
    gap: spacing.xl,
    paddingBottom: 100,
  },
  header: {
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  headline: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 300,
  },
  planCard: {
    padding: spacing.xl,
    borderRadius: radius.xl,
    gap: spacing.md,
    borderWidth: 1,
  },
  planCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  planName: {
    fontSize: 22,
    fontWeight: "800",
  },
  planPrice: {
    fontSize: 16,
    fontWeight: "700",
  },
  planDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  planArrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: spacing.sm,
  },
  planCta: {
    fontSize: 14,
    fontWeight: "700",
  },
  recommendedBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  prorationNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  prorationText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  alreadyTop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    gap: spacing.lg,
  },
  alreadyTopTitle: {
    fontSize: 22,
    fontWeight: "800",
  },
  alreadyTopDesc: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  // Modal
  modalSafe: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.xl,
    paddingBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
  },
  modalSubtitle: {
    fontSize: 15,
    marginTop: 4,
  },
  modalContent: {
    padding: spacing.xl,
    gap: spacing.xl,
    paddingBottom: 50,
  },
  prorationBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
  },
  prorationBannerText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  benefitsList: {
    gap: spacing.lg,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  benefitText: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  purchaseButtons: {
    gap: spacing.md,
    alignItems: "center",
  },
  saveNote: {
    fontSize: 13,
    fontWeight: "700",
  },
  legal: {
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
  },
});
