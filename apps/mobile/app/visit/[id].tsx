import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "../../hooks/useThemeColors";
import { ThemedText } from "../../components/ThemedText";
import { spacing, radius } from "../../theme";
import api from "../../services/api";

interface VisitItem {
  id: string;
  name: string;
  pricePerUnit: string;
  quantity: string;
  unit: string;
  subtotal: string;
  expiresAt: string | null;
}

interface VisitDetail {
  id: string;
  status: string;
  total: string;
  createdAt: string;
  finishedAt: string | null;
  store: { name: string };
  items: VisitItem[];
}

function formatMoney(amount: number): string {
  return amount.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function VisitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [visit, setVisit] = useState<VisitDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/visits/${id}`)
      .then((res) => setVisit(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.safe, { backgroundColor: colors.surface }]}
        edges={["top"]}
      >
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!visit) {
    return (
      <SafeAreaView
        style={[styles.safe, { backgroundColor: colors.surface }]}
        edges={["top"]}
      >
        <View style={styles.loading}>
          <ThemedText variant="body" color={colors.onSurfaceVariant}>
            {t("common.error")}
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const total = parseFloat(visit.total);

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.surface }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.surfaceContainer }]}
        >
          <Ionicons name="arrow-back" size={22} color={colors.onSurface} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.storeName, { color: colors.onSurface }]}>
            {visit.store.name}
          </Text>
          <ThemedText variant="caption" color={colors.onSurfaceVariant}>
            {formatDate(visit.finishedAt ?? visit.createdAt)}
          </ThemedText>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Total Card */}
        <View
          style={[
            styles.totalCard,
            { backgroundColor: colors.secondaryContainer },
          ]}
        >
          <ThemedText
            variant="label"
            color={colors.onSecondaryContainer}
            style={{ opacity: 0.8 }}
          >
            {t("cart.totalSpend")}
          </ThemedText>
          <Text
            style={[styles.totalAmount, { color: colors.onSecondaryContainer }]}
          >
            ${formatMoney(total)}
          </Text>
          <ThemedText
            variant="caption"
            color={colors.onSecondaryContainer}
            style={{ opacity: 0.7 }}
          >
            {visit.items.reduce(
              (sum: number, i: any) =>
                sum + Math.round(parseFloat(i.quantity)),
              0,
            )} {t("dashboard.items")}
          </ThemedText>
        </View>

        {/* Items List */}
        <ThemedText
          variant="label"
          color={colors.onSurfaceVariant}
          style={{ marginBottom: spacing.md, paddingHorizontal: spacing.xs }}
        >
          {t("cart.currentBasket")}
        </ThemedText>

        <View style={{ gap: spacing.sm }}>
          {visit.items.map((item) => {
            const qty = parseFloat(item.quantity);
            const price = parseFloat(item.pricePerUnit);
            const sub = parseFloat(item.subtotal);
            const isWeight = item.unit === "KG" || item.unit === "G";

            return (
              <View
                key={item.id}
                style={[
                  styles.itemCard,
                  { backgroundColor: colors.surfaceContainerLowest },
                ]}
              >
                <View style={styles.itemInfo}>
                  <Text
                    style={[styles.itemName, { color: colors.onSurface }]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={[styles.itemMeta, { color: colors.onSurfaceVariant }]}
                  >
                    {isWeight
                      ? `${(qty * 1000).toFixed(0)}g x $${formatMoney(price)}${t("cart.perKg")}`
                      : `${qty} ${qty === 1 ? t("cart.unit") : t("cart.units")} x $${formatMoney(price)}${t("cart.perUnit")}`}
                  </Text>
                  {item.expiresAt && (
                    <View style={styles.expiryRow}>
                      <Ionicons
                        name="calendar-outline"
                        size={12}
                        color={colors.tertiary}
                      />
                      <Text style={[styles.expiryText, { color: colors.tertiary }]}>
                        {new Date(item.expiresAt).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.itemSubtotal, { color: colors.onSurface }]}>
                  ${formatMoney(sub)}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  storeName: {
    fontSize: 20,
    fontWeight: "800",
  },
  content: {
    padding: spacing.xl,
    paddingTop: spacing.sm,
    gap: spacing.lg,
    paddingBottom: 100,
  },
  totalCard: {
    padding: spacing.xl,
    borderRadius: radius.xl,
    alignItems: "center",
    gap: spacing.xs,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: "900",
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    borderRadius: radius.lg,
    gap: spacing.md,
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "700",
  },
  itemMeta: {
    fontSize: 13,
    fontWeight: "500",
  },
  itemSubtotal: {
    fontSize: 17,
    fontWeight: "800",
  },
  expiryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  expiryText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
