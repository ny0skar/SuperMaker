import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { PrimaryButton } from "../../../components/PrimaryButton";
import { spacing, radius } from "../../../theme";
import api from "../../../services/api";

interface ReconciliationItem {
  visitItem: { id: string; name: string; userPrice: number; quantity: number };
  ticketItem: { name: string; total: number; category: string } | null;
  priceDiff: number | null;
  suggestedCategory: string | null;
}

interface ScanResult {
  ticket: { store: string | null; date: string | null; total: number };
  reconciliation: ReconciliationItem[];
  unmatched: Array<{ name: string; total: number; category: string }>;
}

function formatMoney(n: number): string {
  return n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function ScanTicketScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { id: visitId } = useLocalSearchParams<{ id: string }>();

  const [images, setImages] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [applying, setApplying] = useState(false);

  const pickImage = async (useCamera: boolean) => {
    if (images.length >= 2) {
      Alert.alert("", t("ticket.maxPhotos"));
      return;
    }

    const permResult = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permResult.granted) {
      Alert.alert("", t("ticket.permissionNeeded"));
      return;
    }

    const pickerResult = useCamera
      ? await ImagePicker.launchCameraAsync({
          base64: true,
          quality: 0.7,
          allowsEditing: false,
        })
      : await ImagePicker.launchImageLibraryAsync({
          base64: true,
          quality: 0.7,
          allowsEditing: false,
        });

    if (pickerResult.canceled || !pickerResult.assets[0]?.base64) return;

    const asset = pickerResult.assets[0];
    setImages((prev) => [...prev, `data:image/jpeg;base64,${asset.base64}`]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleScan = async () => {
    if (images.length === 0) return;
    setScanning(true);
    try {
      const res = await api.post(`/visits/${visitId}/scan-ticket`, { images }, { timeout: 120000 });
      setResult(res.data.data);
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.error || t("ticket.scanError"));
    } finally {
      setScanning(false);
    }
  };

  const handleApply = async () => {
    if (!result) return;
    setApplying(true);
    try {
      const updates = result.reconciliation
        .filter((r) => r.ticketItem)
        .map((r) => ({
          itemId: r.visitItem.id,
          ticketPrice: r.ticketItem!.total,
          category: r.suggestedCategory || undefined,
        }));

      await api.post(`/visits/${visitId}/reconcile`, { updates });
      Alert.alert("OK", t("ticket.applied"), [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.error || t("common.error"));
    } finally {
      setApplying(false);
    }
  };

  const totalDiff = result?.reconciliation.reduce(
    (sum, r) => sum + (r.priceDiff || 0),
    0,
  ) ?? 0;

  const itemsWithDiff = result?.reconciliation.filter(
    (r) => r.priceDiff && Math.abs(r.priceDiff) > 0.5,
  ).length ?? 0;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t("ticket.title"),
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.onSurface,
          headerShadowVisible: false,
          headerBackTitle: t("common.back"),
        }}
      />
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface }]} edges={[]}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Phase 1: Take photos */}
          {!result && (
            <>
              <View style={styles.header}>
                <Ionicons name="camera" size={40} color={colors.primary} />
                <Text style={[styles.headline, { color: colors.onSurface }]}>
                  {t("ticket.headline")}
                </Text>
                <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
                  {t("ticket.subtitle")}
                </Text>
              </View>

              {/* Image previews */}
              {images.length > 0 && (
                <View style={styles.previewRow}>
                  {images.map((img, i) => (
                    <View key={i} style={styles.previewContainer}>
                      <Image
                        source={{ uri: img }}
                        style={styles.previewImage}
                      />
                      <TouchableOpacity
                        style={[styles.removeBtn, { backgroundColor: colors.error }]}
                        onPress={() => removeImage(i)}
                      >
                        <Ionicons name="close" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.photoBtn, { backgroundColor: colors.primaryContainer }]}
                  onPress={() => pickImage(true)}
                >
                  <Ionicons name="camera-outline" size={28} color={colors.onPrimaryContainer} />
                  <Text style={[styles.photoBtnText, { color: colors.onPrimaryContainer }]}>
                    {t("ticket.takePhoto")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.photoBtn, { backgroundColor: colors.surfaceContainer }]}
                  onPress={() => pickImage(false)}
                >
                  <Ionicons name="images-outline" size={28} color={colors.onSurface} />
                  <Text style={[styles.photoBtnText, { color: colors.onSurface }]}>
                    {t("ticket.fromGallery")}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.hint, { color: colors.outline }]}>
                {t("ticket.hint", { count: images.length })}
              </Text>

              {images.length > 0 && (
                <PrimaryButton
                  title={scanning ? t("ticket.scanning") : t("ticket.scan")}
                  onPress={handleScan}
                  loading={scanning}
                  disabled={scanning}
                  icon={<Ionicons name="sparkles" size={18} color="#fff" />}
                />
              )}

              {scanning && (
                <View style={styles.scanningCard}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={[styles.scanningText, { color: colors.onSurface }]}>
                    {t("ticket.processingAI")}
                  </Text>
                </View>
              )}
            </>
          )}

          {/* Phase 2: Results */}
          {result && (
            <>
              {/* Summary */}
              <View style={[styles.summaryCard, { backgroundColor: colors.surfaceContainer }]}>
                <Text style={[styles.summaryTitle, { color: colors.onSurface }]}>
                  {t("ticket.reconciliation")}
                </Text>
                {result.ticket.store && (
                  <Text style={[styles.summaryStore, { color: colors.onSurfaceVariant }]}>
                    {result.ticket.store} · {result.ticket.date}
                  </Text>
                )}
                <View style={styles.summaryStats}>
                  <View style={[styles.statBadge, { backgroundColor: itemsWithDiff > 0 ? colors.errorContainer : colors.primaryContainer }]}>
                    <Text style={{ color: itemsWithDiff > 0 ? colors.error : colors.primary, fontWeight: "700", fontSize: 13 }}>
                      {itemsWithDiff > 0
                        ? t("ticket.diffFound", { count: itemsWithDiff })
                        : t("ticket.noDiff")}
                    </Text>
                  </View>
                  {totalDiff !== 0 && (
                    <Text style={[styles.totalDiff, { color: totalDiff > 0 ? colors.error : colors.primary }]}>
                      {totalDiff > 0 ? "+" : ""}${formatMoney(totalDiff)}
                    </Text>
                  )}
                </View>
              </View>

              {/* Item by item */}
              <View style={{ gap: spacing.sm }}>
                {result.reconciliation.map((r, i) => {
                  const hasDiff = r.priceDiff != null && Math.abs(r.priceDiff) > 0.5;
                  return (
                    <View
                      key={i}
                      style={[
                        styles.itemRow,
                        {
                          backgroundColor: hasDiff
                            ? colors.errorContainer
                            : colors.surfaceContainerLowest,
                        },
                      ]}
                    >
                      <View style={styles.itemInfo}>
                        <Text style={[styles.itemName, { color: colors.onSurface }]}>
                          {r.visitItem.name}
                        </Text>
                        <View style={styles.priceCompare}>
                          <Text style={[styles.priceLabel, { color: colors.onSurfaceVariant }]}>
                            {t("ticket.youEntered")}: ${formatMoney(r.visitItem.userPrice)}
                          </Text>
                          {r.ticketItem && (
                            <View style={styles.matchedRow}>
                              <Text
                                style={[
                                  styles.priceLabel,
                                  { color: hasDiff ? colors.error : colors.primary, fontWeight: "700", flex: 1 },
                                ]}
                              >
                                {t("ticket.ticketSays")}: ${formatMoney(r.ticketItem.total)} ({r.ticketItem.name})
                              </Text>
                              <TouchableOpacity
                                onPress={() => {
                                  setResult((prev) => {
                                    if (!prev) return prev;
                                    const item = prev.reconciliation[i];
                                    if (!item.ticketItem) return prev;
                                    const newRecon = [...prev.reconciliation];
                                    const restored = item.ticketItem;
                                    newRecon[i] = {
                                      ...newRecon[i],
                                      ticketItem: null,
                                      priceDiff: null,
                                      suggestedCategory: null,
                                    };
                                    return {
                                      ...prev,
                                      reconciliation: newRecon,
                                      unmatched: [...prev.unmatched, restored],
                                    };
                                  });
                                }}
                              >
                                <Ionicons name="close-circle" size={20} color={colors.error} />
                              </TouchableOpacity>
                            </View>
                          )}
                          {!r.ticketItem && result.unmatched.length > 0 && (
                            <TouchableOpacity
                              onPress={() => {
                                // Show picker to manually match
                                const options = result.unmatched.map(
                                  (u) => `${u.name} — $${formatMoney(u.total)}`,
                                );
                                Alert.alert(
                                  t("ticket.manualMatch"),
                                  t("ticket.manualMatchDesc"),
                                  [
                                    ...result.unmatched.map((u, ui) => ({
                                      text: `${u.name} — $${formatMoney(u.total)}`,
                                      onPress: () => {
                                        // Apply manual match
                                        setResult((prev) => {
                                          if (!prev) return prev;
                                          const newRecon = [...prev.reconciliation];
                                          newRecon[i] = {
                                            ...newRecon[i],
                                            ticketItem: u,
                                            priceDiff: u.total - r.visitItem.userPrice,
                                            suggestedCategory: u.category,
                                          };
                                          const newUnmatched = prev.unmatched.filter((_, k) => k !== ui);
                                          return { ...prev, reconciliation: newRecon, unmatched: newUnmatched };
                                        });
                                      },
                                    })),
                                    { text: t("common.cancel"), style: "cancel" },
                                  ],
                                );
                              }}
                            >
                              <Text style={[styles.priceLabel, { color: colors.primary, fontWeight: "700" }]}>
                                {t("ticket.tapToMatch")}
                              </Text>
                            </TouchableOpacity>
                          )}
                          {!r.ticketItem && result.unmatched.length === 0 && (
                            <Text style={[styles.priceLabel, { color: colors.outline }]}>
                              {t("ticket.noMatch")}
                            </Text>
                          )}
                        </View>
                        {r.suggestedCategory && (
                          <View style={[styles.categoryBadge, { backgroundColor: colors.surfaceContainerHigh }]}>
                            <Text style={{ fontSize: 11, color: colors.onSurface, fontWeight: "600" }}>
                              {r.suggestedCategory}
                            </Text>
                          </View>
                        )}
                      </View>
                      {hasDiff && (
                        <Text style={[styles.diffAmount, { color: colors.error }]}>
                          {r.priceDiff! > 0 ? "+" : ""}${formatMoney(r.priceDiff!)}
                        </Text>
                      )}
                      {!hasDiff && r.ticketItem && (
                        <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                      )}
                    </View>
                  );
                })}
              </View>

              {/* Unmatched ticket items */}
              {result.unmatched.length > 0 && (
                <View>
                  <Text style={[styles.unmatchedTitle, { color: colors.onSurfaceVariant }]}>
                    {t("ticket.unmatchedItems")}
                  </Text>
                  {result.unmatched.map((item, i) => (
                    <View
                      key={i}
                      style={[styles.unmatchedRow, { backgroundColor: colors.surfaceContainerLow }]}
                    >
                      <Text style={{ color: colors.onSurfaceVariant, flex: 1 }}>
                        {item.name}
                      </Text>
                      <Text style={{ color: colors.onSurfaceVariant, fontWeight: "600" }}>
                        ${formatMoney(item.total)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Actions */}
              <View style={{ gap: spacing.md }}>
                <PrimaryButton
                  title={t("ticket.applyChanges")}
                  onPress={handleApply}
                  loading={applying}
                  icon={<Ionicons name="checkmark" size={18} color="#fff" />}
                />
                <PrimaryButton
                  title={t("ticket.dismiss")}
                  onPress={() => router.back()}
                  variant="outline"
                />
              </View>
            </>
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
  header: {
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  headline: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 300,
  },
  previewRow: {
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "center",
  },
  previewContainer: {
    position: "relative",
  },
  previewImage: {
    width: 140,
    height: 200,
    borderRadius: radius.lg,
  },
  removeBtn: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  photoBtn: {
    flex: 1,
    padding: spacing.xl,
    borderRadius: radius.xl,
    alignItems: "center",
    gap: spacing.sm,
  },
  photoBtnText: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  hint: {
    fontSize: 12,
    textAlign: "center",
  },
  scanningCard: {
    alignItems: "center",
    gap: spacing.lg,
    paddingVertical: spacing.xl,
  },
  scanningText: {
    fontSize: 15,
    fontWeight: "600",
  },
  summaryCard: {
    padding: spacing.xl,
    borderRadius: radius.xl,
    gap: spacing.md,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  summaryStore: {
    fontSize: 14,
  },
  summaryStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  statBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  totalDiff: {
    fontSize: 18,
    fontWeight: "800",
  },
  itemRow: {
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
    fontSize: 15,
    fontWeight: "700",
  },
  priceCompare: {
    gap: 2,
  },
  matchedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  priceLabel: {
    fontSize: 13,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  diffAmount: {
    fontSize: 16,
    fontWeight: "800",
  },
  unmatchedTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  unmatchedRow: {
    flexDirection: "row",
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
});
