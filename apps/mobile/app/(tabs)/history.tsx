import { useEffect, useState, useCallback } from "react";
import {
  View,
  FlatList,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useThemeColors } from "../../hooks/useThemeColors";
import { useAuthStore } from "../../store/authStore";
import { ThemedText } from "../../components/ThemedText";
import { PrimaryButton } from "../../components/PrimaryButton";
import { UpgradeCard } from "../../components/UpgradeCard";
import { spacing, radius } from "../../theme";
import {
  getVisitHistory,
  VisitHistoryItem,
} from "../../services/analytics";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function HistoryScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const user = useAuthStore((s) => s.user);
  const hasPaidPlan = user?.plan === "PREMIUM" || user?.plan === "FAMILY";

  const [visits, setVisits] = useState<VisitHistoryItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchHistory = useCallback(
    async (pageNum: number, append = false) => {
      try {
        const data = await getVisitHistory(pageNum);
        if (append) {
          setVisits((prev) => [...prev, ...data.visits]);
        } else {
          setVisits(data.visits);
        }
        setHasMore(data.hasMore);
        setPage(data.page);
      } catch {
        // handled silently
      }
    },
    [],
  );

  useEffect(() => {
    if (!hasPaidPlan) return;
    fetchHistory(1).finally(() => setLoading(false));
  }, [hasPaidPlan, fetchHistory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistory(1);
    setRefreshing(false);
  };

  const onLoadMore = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    await fetchHistory(page + 1, true);
    setLoadingMore(false);
  };

  // Free user view
  if (!hasPaidPlan) {
    return (
      <SafeAreaView
        style={[styles.safe, { backgroundColor: colors.surface }]}
        edges={["top"]}
      >
        <ScrollView contentContainerStyle={styles.freeContent}>
          <View style={styles.header}>
            <ThemedText variant="headline">{t("history.title")}</ThemedText>
          </View>

          <ThemedText
            variant="caption"
            color={colors.onSurfaceVariant}
            style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.md }}
          >
            {t("history.comingSoon")}
          </ThemedText>

          {/* Premium Card */}
          <TouchableOpacity
            style={[styles.upgradeCard, { backgroundColor: colors.tertiaryContainer }]}
            onPress={() => router.push("/upgrade")}
            activeOpacity={0.7}
          >
            <Ionicons name="diamond" size={28} color={colors.onTertiaryContainer} />
            <View style={styles.upgradeCardInfo}>
              <ThemedText variant="title" color={colors.onTertiaryContainer}>
                Plan Premium
              </ThemedText>
              <ThemedText variant="caption" color={colors.onTertiaryContainer} style={{ opacity: 0.85 }}>
                {t("upgrade.premiumShort")}
              </ThemedText>
              <ThemedText variant="label" color={colors.onTertiaryContainer} style={{ marginTop: spacing.sm }}>
                $49/mes · $449/año
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.onTertiaryContainer} />
          </TouchableOpacity>

          {/* Family Card */}
          <TouchableOpacity
            style={[styles.upgradeCard, { backgroundColor: colors.primaryContainer }]}
            onPress={() => router.push("/upgrade")}
            activeOpacity={0.7}
          >
            <Ionicons name="people" size={28} color={colors.onPrimaryContainer} />
            <View style={styles.upgradeCardInfo}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                <ThemedText variant="title" color={colors.onPrimaryContainer}>
                  Plan Familiar
                </ThemedText>
                <View style={[styles.recBadge, { backgroundColor: colors.primary }]}>
                  <ThemedText variant="label" color={colors.onPrimary} style={{ fontSize: 9 }}>
                    {t("upgrade.recommended")}
                  </ThemedText>
                </View>
              </View>
              <ThemedText variant="caption" color={colors.onPrimaryContainer} style={{ opacity: 0.85 }}>
                {t("upgrade.familyShort")}
              </ThemedText>
              <ThemedText variant="label" color={colors.onPrimaryContainer} style={{ marginTop: spacing.sm }}>
                $79/mes · $699/año
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.onPrimaryContainer} />
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const renderVisit = ({ item }: { item: VisitHistoryItem }) => (
    <TouchableOpacity
      style={[styles.visitCard, { backgroundColor: colors.surfaceContainerLow }]}
      activeOpacity={0.7}
      onPress={() => router.push(`/visit/${item.id}`)}
    >
      <View style={styles.visitRow}>
        <View style={styles.visitInfo}>
          <ThemedText variant="body" style={{ fontWeight: "700" }}>
            {item.storeName}
          </ThemedText>
          <ThemedText variant="caption" color={colors.onSurfaceVariant}>
            {formatDate(item.finishedAt)}
          </ThemedText>
        </View>
        <View style={styles.visitRight}>
          <ThemedText variant="title" color={colors.primary}>
            ${parseFloat(item.total).toFixed(2)}
          </ThemedText>
          <ThemedText variant="caption" color={colors.outline}>
            {t("history.itemCount", { count: item.itemCount })}
          </ThemedText>
        </View>
        <Ionicons
          name="chevron-forward"
          size={18}
          color={colors.outline}
          style={{ marginLeft: spacing.sm }}
        />
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!hasMore) return null;
    if (loadingMore) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      );
    }
    return (
      <View style={styles.footer}>
        <PrimaryButton
          title={t("history.loadMore")}
          onPress={onLoadMore}
          variant="outline"
          style={{ minWidth: 160 }}
        />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="time-outline" size={56} color={colors.outline} />
        <ThemedText
          variant="caption"
          color={colors.onSurfaceVariant}
          style={{ textAlign: "center", marginTop: spacing.md }}
        >
          {t("history.noHistory")}
        </ThemedText>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.surface }]}
      edges={["top"]}
    >
      <View style={styles.header}>
        <ThemedText variant="headline">{t("history.title")}</ThemedText>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={visits}
          keyExtractor={(item) => item.id}
          renderItem={renderVisit}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}
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
  freeContent: {
    paddingBottom: 100,
    gap: spacing.lg,
  },
  upgradeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    padding: spacing.xl,
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
  },
  upgradeCardInfo: {
    flex: 1,
    gap: 2,
  },
  recBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  listContent: {
    padding: spacing.xl,
    paddingTop: spacing.sm,
    gap: spacing.sm,
    paddingBottom: 100,
  },
  visitCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
  },
  visitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  visitInfo: {
    flex: 1,
    gap: 2,
  },
  visitRight: {
    alignItems: "flex-end",
    gap: 2,
  },
  footer: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing["3xl"],
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
