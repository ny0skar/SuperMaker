import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "../../hooks/useThemeColors";
import { useAuthStore } from "../../store/authStore";
import { useWishlistStore } from "../../store/wishlistStore";
import { ThemedText } from "../../components/ThemedText";
import { ThemedInput } from "../../components/ThemedInput";
import { PrimaryButton } from "../../components/PrimaryButton";
import { spacing, radius } from "../../theme";

export default function WishlistScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const user = useAuthStore((s) => s.user);
  const { items, isLoading, fetchWishlist, addItem, deleteItem } =
    useWishlistStore();

  const [refreshing, setRefreshing] = useState(false);
  const [name, setName] = useState("");
  const [qty, setQty] = useState("1");
  const [note, setNote] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchWishlist();
    setRefreshing(false);
  }, []);

  const handleAdd = async () => {
    if (!name.trim()) return;
    setAdding(true);
    try {
      await addItem({
        name: name.trim(),
        quantity: parseFloat(qty) || 1,
        note: note.trim() || undefined,
      });
      setName("");
      setQty("1");
      setNote("");
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.error || t("common.error"));
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = (itemId: string) => {
    Alert.alert(t("common.delete"), "", [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => deleteItem(itemId),
      },
    ]);
  };

  const pendingItems = items.filter((i) => i.status === "PENDING");
  const noHayItems = items.filter((i) => i.status === "NO_HAY");

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t("wishlist.title"),
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.onSurface,
          headerShadowVisible: false,
          headerBackTitle: t("common.back"),
        }}
      />
      <SafeAreaView
        style={[styles.safe, { backgroundColor: colors.surface }]}
        edges={[]}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Add Item Form */}
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surfaceContainer },
            ]}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
              <ThemedText variant="title">
                {t("wishlist.addProduct")}
              </ThemedText>
            </View>
            <Text style={[styles.desc, { color: colors.onSurfaceVariant }]}>
              {t("wishlist.addProductDesc")}
            </Text>
            <View style={{ gap: spacing.md }}>
              <ThemedInput
                label={t("wishlist.productName")}
                placeholder={t("wishlist.productNamePlaceholder")}
                value={name}
                onChangeText={setName}
              />
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <ThemedInput
                    label={t("cart.quantity")}
                    placeholder="1"
                    value={qty}
                    onChangeText={setQty}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={{ flex: 2 }}>
                  <ThemedInput
                    label={t("wishlist.note")}
                    placeholder={t("wishlist.notePlaceholder")}
                    value={note}
                    onChangeText={setNote}
                  />
                </View>
              </View>
              <PrimaryButton
                title={t("wishlist.addToList")}
                onPress={handleAdd}
                loading={adding}
                disabled={!name.trim()}
                icon={<Ionicons name="add" size={20} color="#fff" />}
              />
            </View>
          </View>

          {/* Pending Items */}
          {pendingItems.length > 0 && (
            <View>
              <ThemedText
                variant="label"
                color={colors.onSurfaceVariant}
                style={{ marginBottom: spacing.md, paddingHorizontal: spacing.xs }}
              >
                {t("wishlist.pending")} ({pendingItems.length})
              </ThemedText>
              <View style={{ gap: spacing.md }}>
                {pendingItems.map((item) => (
                  <View
                    key={item.id}
                    style={[
                      styles.itemCard,
                      { backgroundColor: colors.surfaceContainerLowest },
                    ]}
                  >
                    <View style={styles.itemInfo}>
                      <Text style={[styles.itemName, { color: colors.onSurface }]}>
                        {item.name}
                      </Text>
                      <Text style={[styles.itemMeta, { color: colors.onSurfaceVariant }]}>
                        x{Math.round(parseFloat(item.quantity))} ·{" "}
                        {item.requestedBy?.displayName || item.requestedBy?.email}
                      </Text>
                      {item.note && (
                        <Text style={[styles.itemNote, { color: colors.outline }]}>
                          {item.note}
                        </Text>
                      )}
                    </View>
                    {(item.requestedById === user?.id) && (
                      <TouchableOpacity onPress={() => handleDelete(item.id)}>
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color={colors.error}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* No Hay Items */}
          {noHayItems.length > 0 && (
            <View>
              <ThemedText
                variant="label"
                color={colors.onSurfaceVariant}
                style={{ marginBottom: spacing.md, paddingHorizontal: spacing.xs }}
              >
                {t("wishlist.notAvailable")} ({noHayItems.length})
              </ThemedText>
              <View style={{ gap: spacing.md }}>
                {noHayItems.map((item) => (
                  <View
                    key={item.id}
                    style={[
                      styles.itemCard,
                      { backgroundColor: colors.surfaceContainerLow, opacity: 0.7 },
                    ]}
                  >
                    <View style={styles.itemInfo}>
                      <View style={styles.noHayRow}>
                        <Text
                          style={[
                            styles.itemName,
                            { color: colors.onSurfaceVariant, textDecorationLine: "line-through" },
                          ]}
                        >
                          {item.name}
                        </Text>
                        <View
                          style={[
                            styles.badge,
                            { backgroundColor: colors.errorContainer },
                          ]}
                        >
                          <Text style={{ fontSize: 10, fontWeight: "700", color: colors.error }}>
                            {t("wishlist.noHay")}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.itemMeta, { color: colors.onSurfaceVariant }]}>
                        x{Math.round(parseFloat(item.quantity))} ·{" "}
                        {item.requestedBy?.displayName || item.requestedBy?.email}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Empty State */}
          {pendingItems.length === 0 && noHayItems.length === 0 && !isLoading && (
            <View style={[styles.emptyState, { backgroundColor: colors.surfaceContainerLow }]}>
              <Ionicons name="list-outline" size={48} color={colors.outlineVariant} />
              <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>
                {t("wishlist.empty")}
              </Text>
              <Text style={[styles.emptyDesc, { color: colors.onSurfaceVariant }]}>
                {t("wishlist.emptyDesc")}
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
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
  desc: { fontSize: 13, lineHeight: 18 },
  row: { flexDirection: "row", gap: spacing.md },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    borderRadius: radius.xl,
    gap: spacing.md,
  },
  itemInfo: { flex: 1, gap: 3 },
  itemName: { fontSize: 16, fontWeight: "700" },
  itemMeta: { fontSize: 13 },
  itemNote: { fontSize: 12, fontStyle: "italic", marginTop: 2 },
  noHayRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  emptyState: {
    padding: spacing["2xl"],
    borderRadius: radius.xl,
    alignItems: "center",
    gap: spacing.md,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptyDesc: { fontSize: 14, textAlign: "center", lineHeight: 20, maxWidth: 280 },
});
