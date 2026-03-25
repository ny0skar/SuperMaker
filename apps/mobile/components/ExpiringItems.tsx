import { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "../hooks/useThemeColors";
import { ThemedText } from "./ThemedText";
import { spacing, radius } from "../theme";
import { getExpiringItems, ExpiringItem } from "../services/analytics";

function getDaysUntil(dateStr: string): number {
  const now = new Date();
  const expDate = new Date(dateStr);
  const diffMs = expDate.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function getExpirationColor(daysLeft: number): string {
  if (daysLeft < 0) return "#ba1a1a";
  if (daysLeft < 3) return "#ba1a1a";
  if (daysLeft < 7) return "#e65100";
  return "#2e7d32";
}

export function ExpiringItems() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [items, setItems] = useState<ExpiringItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    try {
      const data = await getExpiringItems();
      setItems(data);
    } catch {
      // Silently fail — component is non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surfaceContainerLow }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surfaceContainerLow }]}>
        <Ionicons name="calendar-outline" size={32} color={colors.outline} />
        <ThemedText
          variant="caption"
          color={colors.onSurfaceVariant}
          style={{ textAlign: "center", marginTop: spacing.sm }}
        >
          {t("expiring.noItems")}
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {items.map((item) => {
        const daysLeft = getDaysUntil(item.expiresAt);
        const statusColor = getExpirationColor(daysLeft);

        let statusText: string;
        if (daysLeft < 0) {
          statusText = t("expiring.expired");
        } else if (daysLeft === 0) {
          statusText = t("expiring.today");
        } else {
          statusText = t("expiring.daysLeft", { count: daysLeft });
        }

        return (
          <View
            key={item.id}
            style={[
              styles.itemCard,
              { backgroundColor: colors.surfaceContainerLow },
            ]}
          >
            <View
              style={[styles.indicator, { backgroundColor: statusColor }]}
            />
            <View style={styles.itemContent}>
              <ThemedText variant="body" style={styles.itemName}>
                {item.name}
              </ThemedText>
              <ThemedText variant="caption" color={colors.onSurfaceVariant}>
                {item.storeName}
              </ThemedText>
            </View>
            <View style={styles.expiryInfo}>
              <ThemedText
                variant="caption"
                color={statusColor}
                style={{ fontWeight: "700" }}
              >
                {statusText}
              </ThemedText>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing["2xl"],
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
  },
  list: {
    gap: spacing.sm,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    borderRadius: radius.lg,
    gap: spacing.md,
  },
  indicator: {
    width: 4,
    height: 36,
    borderRadius: 2,
  },
  itemContent: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontWeight: "600",
  },
  expiryInfo: {
    alignItems: "flex-end",
  },
});
