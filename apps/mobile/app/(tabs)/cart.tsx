import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "../../hooks/useThemeColors";
import { useVisitStore } from "../../store/visitStore";
import { useAuthStore } from "../../store/authStore";
import { useFamilyStore } from "../../store/familyStore";
import { useWishlistStore } from "../../store/wishlistStore";
import { ThemedText } from "../../components/ThemedText";
import { PrimaryButton } from "../../components/PrimaryButton";
import { spacing, radius } from "../../theme";

type EntryMode = "quantity" | "weight";

function formatMoney(amount: number): string {
  return amount.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function CartScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const user = useAuthStore((s) => s.user);
  const { activeVisit, fetchActiveVisit, addItem, updateItem, deleteItem, finishVisit } =
    useVisitStore();
  const { group } = useFamilyStore();
  const { items: wishlistItems, fetchWishlist, markInCart, markNoHay } =
    useWishlistStore();

  const [refreshing, setRefreshing] = useState(false);
  const [wishlistPrices, setWishlistPrices] = useState<Record<string, string>>({});
  const [entryMode, setEntryMode] = useState<EntryMode>("quantity");
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchActiveVisit();
    if (group) fetchWishlist();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchActiveVisit();
    if (group) await fetchWishlist();
    setRefreshing(false);
  };

  const handleAddItem = async () => {
    if (!itemName.trim() || !price || !qty) return;
    if (!activeVisit) {
      Alert.alert("", t("cart.startVisit"));
      return;
    }

    setAdding(true);
    try {
      const priceNum = parseFloat(price);
      const qtyNum = parseFloat(qty);

      await addItem({
        name: itemName.trim(),
        pricePerUnit: entryMode === "weight" ? priceNum : priceNum,
        quantity: entryMode === "weight" ? qtyNum / 1000 : qtyNum, // Convert grams to kg
        unit: entryMode === "weight" ? "KG" : "PIECE",
      });

      setItemName("");
      setPrice("");
      setQty("");
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.error || t("common.error"));
    } finally {
      setAdding(false);
    }
  };

  const handleQuantityChange = async (
    itemId: string,
    currentQty: string,
    delta: number,
  ) => {
    const newQty = Math.max(0, parseFloat(currentQty) + delta);
    if (newQty === 0) {
      handleDeleteItem(itemId);
      return;
    }
    try {
      await updateItem(itemId, { quantity: newQty });
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.error || t("common.error"));
    }
  };

  const handleDeleteItem = (itemId: string) => {
    Alert.alert(t("common.delete"), "", [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => deleteItem(itemId),
      },
    ]);
  };

  const handleWishlistAddToCart = async (itemId: string) => {
    const priceStr = wishlistPrices[itemId];
    if (!priceStr || !parseFloat(priceStr)) {
      Alert.alert("", t("wishlist.enterPrice"));
      return;
    }
    if (!activeVisit) return;
    try {
      const wishItem = wishlistItems.find((i) => i.id === itemId);
      // Add to visit cart
      await addItem({
        name: wishItem?.name || "",
        pricePerUnit: parseFloat(priceStr),
        quantity: parseFloat(wishItem?.quantity || "1"),
        unit: (wishItem?.unit as any) || "PIECE",
      });
      // Mark as IN_CART in wishlist
      await markInCart(itemId, activeVisit.id, parseFloat(priceStr));
      setWishlistPrices((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.error || t("common.error"));
    }
  };

  const handleWishlistNoHay = async (itemId: string) => {
    try {
      await markNoHay(itemId);
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.error || t("common.error"));
    }
  };

  const handleFinishVisit = () => {
    Alert.alert(t("cart.finishVisit"), "", [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.yes"),
        onPress: async () => {
          await finishVisit();
          if (group) await fetchWishlist();
        },
      },
    ]);
  };

  const items = activeVisit?.items ?? [];
  const total = activeVisit ? parseFloat(activeVisit.total) : 0;
  const totalItemCount = items.reduce(
    (sum, item) => sum + Math.round(parseFloat(item.quantity)),
    0,
  );

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.surface }]}
      edges={["top"]}
    >
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
        {/* Stats Header */}
        <View style={styles.statsRow}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.surfaceContainerLowest },
            ]}
          >
            <ThemedText variant="label" color={colors.onSurfaceVariant}>
              {t("cart.articles")} ({t("cart.itemsInCart")})
            </ThemedText>
            <Text style={[styles.statNumber, { color: colors.primary }]}>
              {totalItemCount}
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.surfaceContainerLowest },
            ]}
          >
            <ThemedText variant="label" color={colors.onSurfaceVariant}>
              {t("cart.totalSpend")} ({t("cart.estimated")})
            </ThemedText>
            <Text style={[styles.statNumber, { color: colors.secondary }]}>
              ${formatMoney(total)}
            </Text>
          </View>
        </View>

        {/* Family Wishlist */}
        {activeVisit && group && wishlistItems.filter((i) => i.status === "PENDING").length > 0 && (
          <View
            style={[
              styles.wishlistSection,
              { backgroundColor: colors.tertiaryContainer },
            ]}
          >
            <View style={styles.wishlistHeader}>
              <Ionicons name="people" size={18} color={colors.onTertiaryContainer} />
              <ThemedText variant="label" color={colors.onTertiaryContainer}>
                {t("wishlist.familyRequests")}
              </ThemedText>
            </View>
            {wishlistItems
              .filter((i) => i.status === "PENDING")
              .map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.wishlistItem,
                    { backgroundColor: colors.surfaceContainerLowest },
                  ]}
                >
                  <View style={styles.wishlistItemInfo}>
                    <Text style={[styles.wishlistItemName, { color: colors.onSurface }]}>
                      {item.name} x{Math.round(parseFloat(item.quantity))}
                    </Text>
                    <Text style={[styles.wishlistItemBy, { color: colors.onSurfaceVariant }]}>
                      {item.requestedBy?.displayName || item.requestedBy?.email}
                      {item.note ? ` · ${item.note}` : ""}
                    </Text>
                  </View>
                  <View style={styles.wishlistItemActions}>
                    <View style={[styles.wishlistPriceInput, { backgroundColor: colors.surfaceContainerHighest }]}>
                      <Text style={{ color: colors.onSurfaceVariant, fontSize: 12 }}>$</Text>
                      <TextInput
                        style={[styles.wishlistPriceText, { color: colors.onSurface }]}
                        placeholder="0.00"
                        placeholderTextColor={colors.outline}
                        value={wishlistPrices[item.id] || ""}
                        onChangeText={(v) =>
                          setWishlistPrices((prev) => ({ ...prev, [item.id]: v }))
                        }
                        keyboardType="decimal-pad"
                      />
                    </View>
                    <TouchableOpacity
                      style={[styles.wishlistActionBtn, { backgroundColor: colors.primary }]}
                      onPress={() => handleWishlistAddToCart(item.id)}
                    >
                      <Ionicons name="cart" size={16} color={colors.onPrimary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.wishlistActionBtn, { backgroundColor: colors.errorContainer }]}
                      onPress={() => handleWishlistNoHay(item.id)}
                    >
                      <Ionicons name="close" size={16} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
          </View>
        )}

        {/* Add New Item */}
        {activeVisit && (
          <View
            style={[
              styles.addSection,
              { backgroundColor: colors.surfaceContainer },
            ]}
          >
            <ThemedText
              variant="label"
              color={colors.onSurfaceVariant}
              style={{ marginBottom: spacing.md }}
            >
              {t("cart.addNewItem")}
            </ThemedText>

            <View style={styles.formField}>
              <Text style={[styles.fieldLabel, { color: colors.onSurface }]}>
                {t("cart.itemName")}
              </Text>
              <TextInput
                style={[
                  styles.fieldInput,
                  {
                    backgroundColor: colors.surfaceContainerHighest,
                    color: colors.onSurface,
                  },
                ]}
                placeholder={t("cart.itemNamePlaceholder")}
                placeholderTextColor={colors.outline}
                value={itemName}
                onChangeText={setItemName}
              />
            </View>

            {/* Entry Mode Toggle */}
            <View style={styles.formField}>
                <Text style={[styles.fieldLabel, { color: colors.onSurface }]}>
                  {t("cart.entryMode")}
                </Text>
                <View
                  style={[
                    styles.toggleContainer,
                    { backgroundColor: colors.surfaceContainerHighest },
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.toggleBtn,
                      entryMode === "quantity" && {
                        backgroundColor: colors.surfaceContainerLowest,
                      },
                    ]}
                    onPress={() => setEntryMode("quantity")}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        {
                          color:
                            entryMode === "quantity"
                              ? colors.primary
                              : colors.onSurfaceVariant,
                        },
                      ]}
                    >
                      {t("cart.quantity")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.toggleBtn,
                      entryMode === "weight" && {
                        backgroundColor: colors.surfaceContainerLowest,
                      },
                    ]}
                    onPress={() => setEntryMode("weight")}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        {
                          color:
                            entryMode === "weight"
                              ? colors.primary
                              : colors.onSurfaceVariant,
                        },
                      ]}
                    >
                      {t("cart.weight")}
                    </Text>
                  </TouchableOpacity>
                </View>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formField, { flex: 1 }]}>
                <Text style={[styles.fieldLabel, { color: colors.onSurface }]}>
                  {entryMode === "weight"
                    ? t("cart.pricePerKg")
                    : t("cart.pricePerUnit")}
                </Text>
                <View
                  style={[
                    styles.priceInput,
                    { backgroundColor: colors.surfaceContainerHighest },
                  ]}
                >
                  <Text style={{ color: colors.onSurfaceVariant }}>$</Text>
                  <TextInput
                    style={[styles.priceInputText, { color: colors.onSurface }]}
                    placeholder="0.00"
                    placeholderTextColor={colors.outline}
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
              <View style={[styles.formField, { flex: 1 }]}>
                <Text style={[styles.fieldLabel, { color: colors.onSurface }]}>
                  {entryMode === "weight"
                    ? t("cart.grams")
                    : t("cart.quantity")}
                </Text>
                <TextInput
                  style={[
                    styles.fieldInput,
                    {
                      backgroundColor: colors.surfaceContainerHighest,
                      color: colors.onSurface,
                    },
                  ]}
                  placeholder="0"
                  placeholderTextColor={colors.outline}
                  value={qty}
                  onChangeText={setQty}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <PrimaryButton
              title={t("cart.addToBasket")}
              onPress={handleAddItem}
              loading={adding}
              disabled={!itemName.trim() || !price || !qty}
              icon={<Ionicons name="add" size={20} color="#fff" />}
              style={{ marginTop: spacing.md }}
            />
          </View>
        )}

        {/* No active visit */}
        {!activeVisit && (
          <View
            style={[
              styles.emptyState,
              { backgroundColor: colors.surfaceContainerLow },
            ]}
          >
            <Ionicons name="cart-outline" size={48} color={colors.outline} />
            <ThemedText
              variant="caption"
              color={colors.onSurfaceVariant}
              style={{ textAlign: "center", marginTop: spacing.md }}
            >
              {t("cart.startVisit")}
            </ThemedText>
          </View>
        )}

        {/* Current Basket */}
        {items.length > 0 && (
          <View>
            <ThemedText
              variant="label"
              color={colors.onSurfaceVariant}
              style={{ marginBottom: spacing.md, paddingHorizontal: spacing.xs }}
            >
              {t("cart.currentBasket")}
            </ThemedText>

            <View style={{ gap: spacing.md }}>
              {items.map((item) => {
                const itemQty = parseFloat(item.quantity);
                const itemPrice = parseFloat(item.pricePerUnit);
                const itemSubtotal = parseFloat(item.subtotal);
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
                        style={[
                          styles.itemMeta,
                          { color: colors.onSurfaceVariant },
                        ]}
                      >
                        {isWeight
                          ? `${(itemQty * 1000).toFixed(0)}g x $${formatMoney(itemPrice)}${t("cart.perKg")}`
                          : `${itemQty} ${itemQty === 1 ? t("cart.unit") : t("cart.units")} x $${formatMoney(itemPrice)}${t("cart.perUnit")}`}
                      </Text>
                    </View>
                    <View style={styles.itemRight}>
                      <Text
                        style={[
                          styles.itemSubtotal,
                          { color: colors.onSurface },
                        ]}
                      >
                        ${formatMoney(itemSubtotal)}
                      </Text>
                      {!isWeight && (
                        <View style={styles.qtyControls}>
                          <TouchableOpacity
                            style={[
                              styles.qtyBtn,
                              { backgroundColor: colors.surfaceContainer },
                            ]}
                            onPress={() =>
                              handleQuantityChange(item.id, item.quantity, -1)
                            }
                          >
                            <Ionicons
                              name="remove"
                              size={14}
                              color={colors.onSurfaceVariant}
                            />
                          </TouchableOpacity>
                          <Text
                            style={[
                              styles.qtyText,
                              { color: colors.onSurface },
                            ]}
                          >
                            {itemQty}
                          </Text>
                          <TouchableOpacity
                            style={[
                              styles.qtyBtn,
                              { backgroundColor: colors.surfaceContainer },
                            ]}
                            onPress={() =>
                              handleQuantityChange(item.id, item.quantity, 1)
                            }
                          >
                            <Ionicons
                              name="add"
                              size={14}
                              color={colors.onSurfaceVariant}
                            />
                          </TouchableOpacity>
                        </View>
                      )}
                      {isWeight && (
                        <TouchableOpacity
                          onPress={() => handleDeleteItem(item.id)}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={18}
                            color={colors.error}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Subtotal */}
            <View
              style={[
                styles.subtotalRow,
                { borderTopColor: colors.outlineVariant },
              ]}
            >
              <Text
                style={[
                  styles.subtotalLabel,
                  { color: colors.onSurfaceVariant },
                ]}
              >
                {t("cart.subtotal")} ({totalItemCount} {t("dashboard.items")})
              </Text>
              <Text
                style={[
                  styles.subtotalValue,
                  { color: colors.onSurface },
                ]}
              >
                ${formatMoney(total)}
              </Text>
            </View>

            {/* Finish Visit */}
            <PrimaryButton
              title={t("cart.finishVisit")}
              onPress={handleFinishVisit}
              icon={
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="#fff"
                />
              }
              style={{ marginTop: spacing.lg }}
            />
          </View>
        )}
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
    paddingTop: spacing["2xl"],
    gap: spacing.xl,
    paddingBottom: 100,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: radius.xl,
    alignItems: "center",
    gap: spacing.xs,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -1.5,
  },
  addSection: {
    padding: spacing.xl,
    borderRadius: radius.xl,
  },
  formRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  formField: {
    gap: 6,
    marginBottom: spacing.sm,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 4,
  },
  fieldInput: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    fontSize: 16,
  },
  toggleContainer: {
    flexDirection: "row",
    borderRadius: radius.md,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: radius.sm,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
  },
  priceInput: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    gap: 4,
  },
  priceInputText: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
  },
  emptyState: {
    padding: spacing["2xl"],
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 150,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    borderRadius: radius.xl,
    gap: spacing.md,
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  itemName: {
    fontSize: 17,
    fontWeight: "700",
  },
  itemMeta: {
    fontSize: 13,
    fontWeight: "500",
  },
  itemRight: {
    alignItems: "flex-end",
    gap: spacing.sm,
  },
  itemSubtotal: {
    fontSize: 18,
    fontWeight: "800",
  },
  qtyControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyText: {
    fontSize: 14,
    fontWeight: "700",
    minWidth: 20,
    textAlign: "center",
  },
  subtotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.xl,
    marginTop: spacing.xl,
    borderTopWidth: 1,
    borderStyle: "dashed",
    paddingHorizontal: spacing.lg,
  },
  subtotalLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  subtotalValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  wishlistSection: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    gap: spacing.md,
  },
  wishlistHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  wishlistItem: {
    padding: spacing.md,
    borderRadius: radius.lg,
    gap: spacing.sm,
  },
  wishlistItemInfo: {
    gap: 2,
  },
  wishlistItemName: {
    fontSize: 15,
    fontWeight: "700",
  },
  wishlistItemBy: {
    fontSize: 12,
  },
  wishlistItemActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  wishlistPriceInput: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    flex: 1,
    gap: 2,
  },
  wishlistPriceText: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 14,
  },
  wishlistActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
});
