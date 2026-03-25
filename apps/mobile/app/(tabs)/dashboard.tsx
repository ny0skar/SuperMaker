import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "../../hooks/useThemeColors";
import { useAuthStore } from "../../store/authStore";
import { useVisitStore } from "../../store/visitStore";
import { ThemedText } from "../../components/ThemedText";
import { ExpiringItems } from "../../components/ExpiringItems";
import { spacing, radius } from "../../theme";
import {
  getDashboardSummary,
  getMonthlySpending,
  DashboardSummary,
  MonthlySpending,
} from "../../services/analytics";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

// ---------- Premium Dashboard ----------

function PremiumDashboard() {
  const { t } = useTranslation();
  const colors = useThemeColors();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlySpending[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [s, m] = await Promise.all([
        getDashboardSummary(),
        getMonthlySpending(),
      ]);
      setSummary(s);
      setMonthlyData(m);
    } catch {
      // handled silently
    }
  }, []);

  useEffect(() => {
    fetchAll().finally(() => setLoading(false));
  }, [fetchAll]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const maxSpending = Math.max(...monthlyData.map((m) => m.total), 1);
  const changeSign = (summary?.percentChange ?? 0) >= 0 ? "+" : "";
  const changeColor =
    (summary?.percentChange ?? 0) >= 0 ? colors.error : colors.primary;

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {/* Summary Cards Row 1 */}
      <View style={styles.statsRow}>
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: colors.secondaryContainer },
          ]}
        >
          <ThemedText
            variant="label"
            color={colors.onSecondaryContainer}
            style={{ opacity: 0.8 }}
          >
            {t("dashboard.spentThisMonth")}
          </ThemedText>
          <Text
            style={[styles.summaryValue, { color: colors.onSecondaryContainer }]}
          >
            ${(summary?.totalSpentThisMonth ?? 0).toFixed(2)}
          </Text>
          <ThemedText
            variant="caption"
            color={changeColor}
            style={{ fontWeight: "700" }}
          >
            {changeSign}
            {(summary?.percentChange ?? 0).toFixed(0)}%{" "}
            {t("dashboard.vsLastMonth")}
          </ThemedText>
        </View>
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: colors.surfaceContainerLowest },
          ]}
        >
          <ThemedText
            variant="label"
            color={colors.onSurfaceVariant}
            style={{ opacity: 0.8 }}
          >
            {t("dashboard.totalVisits")}
          </ThemedText>
          <Text style={[styles.summaryValue, { color: colors.primary }]}>
            {summary?.totalVisits ?? 0}
          </Text>
          <ThemedText variant="caption" color={colors.onSurfaceVariant}>
            {t("dashboard.mostVisited")}:{" "}
            {summary?.mostVisitedStore?.name ?? "—"}
          </ThemedText>
        </View>
      </View>

      {/* Monthly Spending Bar Chart */}
      <View
        style={[
          styles.chartCard,
          { backgroundColor: colors.surfaceContainerLow },
        ]}
      >
        <ThemedText variant="title" style={{ marginBottom: spacing.sm }}>
          {t("dashboard.monthlySpending")}
        </ThemedText>
        <ThemedText
          variant="caption"
          color={colors.onSurfaceVariant}
          style={{ marginBottom: spacing.xl }}
        >
          {t("dashboard.last6Months")}
        </ThemedText>

        {monthlyData.length === 0 ? (
          <ThemedText
            variant="caption"
            color={colors.outline}
            style={{ textAlign: "center", paddingVertical: spacing.xl }}
          >
            {t("dashboard.noData")}
          </ThemedText>
        ) : (
          <View style={styles.chartContainer}>
            {monthlyData.map((item) => {
              const barHeight = Math.max(
                (item.total / maxSpending) * 120,
                4,
              );
              return (
                <View key={`${item.year}-${item.month}`} style={styles.barCol}>
                  <ThemedText
                    variant="caption"
                    color={colors.onSurfaceVariant}
                    style={styles.barValue}
                  >
                    ${item.total >= 1000
                      ? `${(item.total / 1000).toFixed(1)}k`
                      : item.total.toFixed(0)}
                  </ThemedText>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: colors.primary,
                      },
                    ]}
                  />
                  <ThemedText
                    variant="caption"
                    color={colors.outline}
                    style={styles.barLabel}
                  >
                    {item.month}
                  </ThemedText>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Expiring Items */}
      <View>
        <ThemedText variant="title" style={{ marginBottom: spacing.md }}>
          {t("dashboard.expiringItems")}
        </ThemedText>
        <ExpiringItems />
      </View>

      {/* Recent Visits */}
      <View>
        <ThemedText variant="title" style={{ marginBottom: spacing.md }}>
          {t("dashboard.recentVisits")}
        </ThemedText>
        {(summary?.recentVisits ?? []).length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: colors.surfaceContainerLow },
            ]}
          >
            <Ionicons
              name="basket-outline"
              size={32}
              color={colors.outline}
            />
            <ThemedText
              variant="caption"
              color={colors.onSurfaceVariant}
              style={{ textAlign: "center", marginTop: spacing.sm }}
            >
              {t("dashboard.noVisits")}
            </ThemedText>
          </View>
        ) : (
          <View style={styles.recentList}>
            {summary!.recentVisits.map((visit) => (
              <View
                key={visit.id}
                style={[
                  styles.recentCard,
                  { backgroundColor: colors.surfaceContainerLow },
                ]}
              >
                <View style={styles.recentRow}>
                  <View style={styles.recentInfo}>
                    <ThemedText variant="body" style={{ fontWeight: "700" }}>
                      {visit.storeName}
                    </ThemedText>
                    <ThemedText
                      variant="caption"
                      color={colors.onSurfaceVariant}
                    >
                      {formatDate(visit.finishedAt)}
                    </ThemedText>
                  </View>
                  <ThemedText variant="title" color={colors.primary}>
                    ${parseFloat(visit.total).toFixed(2)}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// ---------- Free Dashboard (original) ----------

function FreeDashboard() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const user = useAuthStore((s) => s.user);
  const { stores, activeVisit, fetchStores, fetchActiveVisit } =
    useVisitStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStores();
    fetchActiveVisit();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchStores(), fetchActiveVisit()]);
    setRefreshing(false);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {/* Active Visit Card */}
      {activeVisit ? (
        <View
          style={[
            styles.activeVisitCard,
            { backgroundColor: colors.secondaryContainer },
          ]}
        >
          <ThemedText
            variant="label"
            color={colors.onSecondaryContainer}
            style={{ opacity: 0.8 }}
          >
            {t("dashboard.lastVisit")}
          </ThemedText>
          <Text
            style={[
              styles.visitStoreName,
              { color: colors.onSecondaryContainer },
            ]}
          >
            {activeVisit.store?.name ?? "—"}
          </Text>
          <View style={styles.visitTotal}>
            <Text
              style={[
                styles.totalAmount,
                { color: colors.onSecondaryContainer },
              ]}
            >
              ${parseFloat(activeVisit.total).toFixed(2)}
            </Text>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: `${colors.onSecondaryContainer}20`,
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  { color: colors.onSecondaryContainer },
                ]}
              >
                {activeVisit.items?.length ?? 0}{" "}
                {t("dashboard.items").toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View
          style={[
            styles.emptyCard,
            { backgroundColor: colors.surfaceContainerLow },
          ]}
        >
          <Ionicons
            name="basket-outline"
            size={40}
            color={colors.outline}
          />
          <ThemedText
            variant="caption"
            color={colors.onSurfaceVariant}
            style={{ textAlign: "center", marginTop: spacing.md }}
          >
            {t("dashboard.noVisits")}
          </ThemedText>
        </View>
      )}

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View
          style={[
            styles.statCard,
            { backgroundColor: colors.surfaceContainerLowest },
          ]}
        >
          <Ionicons
            name="storefront-outline"
            size={24}
            color={colors.primary}
          />
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {stores.length}
          </Text>
          <ThemedText variant="caption" color={colors.onSurfaceVariant}>
            {t("tabs.stores")}
          </ThemedText>
        </View>
        <View
          style={[
            styles.statCard,
            { backgroundColor: colors.surfaceContainerLowest },
          ]}
        >
          <Ionicons
            name="person-outline"
            size={24}
            color={colors.secondary}
          />
          <Text style={[styles.statNumber, { color: colors.secondary }]}>
            FREE
          </Text>
          <ThemedText variant="caption" color={colors.onSurfaceVariant}>
            {t("profile.subscription")}
          </ThemedText>
        </View>
      </View>

      {/* Welcome message */}
      {user?.displayName && (
        <View
          style={[
            styles.welcomeCard,
            { backgroundColor: colors.surfaceContainerLow },
          ]}
        >
          <Ionicons name="hand-left" size={28} color={colors.tertiary} />
          <View style={{ flex: 1 }}>
            <ThemedText variant="title">{user.displayName}</ThemedText>
            <ThemedText variant="caption" color={colors.onSurfaceVariant}>
              {user.email}
            </ThemedText>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

// ---------- Main Screen ----------

export default function DashboardScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const user = useAuthStore((s) => s.user);
  const isPremium = user?.plan === "PREMIUM";

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.surface }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <ThemedText variant="label" color={colors.onSurfaceVariant}>
            {t("dashboard.overview")}
          </ThemedText>
          <Text style={[styles.headline, { color: colors.onSurface }]}>
            {t("dashboard.freshlyTracked")}{" "}
            <Text style={{ color: colors.primary, fontStyle: "italic" }}>
              {t("dashboard.tracked")}
            </Text>
          </Text>
        </View>
      </View>

      {isPremium ? <PremiumDashboard /> : <FreeDashboard />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headline: {
    fontSize: 38,
    fontWeight: "800",
    letterSpacing: -1.5,
    lineHeight: 44,
    marginTop: spacing.sm,
  },
  content: {
    padding: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.lg,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // Summary cards
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  summaryCard: {
    flex: 1,
    padding: spacing.xl,
    borderRadius: radius.xl,
    gap: spacing.xs,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: "900",
  },

  // Bar chart
  chartCard: {
    padding: spacing.xl,
    borderRadius: radius.xl,
  },
  chartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    height: 160,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  bar: {
    width: 24,
    borderRadius: 4,
  },
  barValue: {
    fontSize: 10,
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 10,
    marginTop: 6,
  },

  // Recent visits
  recentList: {
    gap: spacing.sm,
  },
  recentCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
  },
  recentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recentInfo: {
    flex: 1,
    gap: 2,
  },

  // Free dashboard (original styles)
  activeVisitCard: {
    padding: spacing.xl,
    borderRadius: radius.xl,
    gap: spacing.sm,
  },
  visitStoreName: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: spacing.xs,
  },
  visitTotal: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: "900",
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  emptyCard: {
    padding: spacing["2xl"],
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 150,
  },
  statCard: {
    flex: 1,
    padding: spacing.xl,
    borderRadius: radius.xl,
    alignItems: "center",
    gap: spacing.sm,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "900",
  },
  welcomeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.xl,
  },
});
