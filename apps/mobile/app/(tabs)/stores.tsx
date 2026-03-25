import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useThemeColors } from "../../hooks/useThemeColors";
import { useVisitStore } from "../../store/visitStore";
import { useAuthStore } from "../../store/authStore";
import { ThemedText } from "../../components/ThemedText";
import { PrimaryButton } from "../../components/PrimaryButton";
import { spacing, radius } from "../../theme";

export default function StoresScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const user = useAuthStore((s) => s.user);
  const {
    stores,
    fetchStores,
    createStore,
    deleteStore,
    startVisit,
    activeVisit,
  } = useVisitStore();

  const [showModal, setShowModal] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [creating, setCreating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchStores();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStores();
    setRefreshing(false);
  };

  const handleCreateStore = async () => {
    if (!storeName.trim()) return;
    setCreating(true);
    try {
      await createStore(storeName.trim());
      setShowModal(false);
      setStoreName("");
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.error || t("common.error"));
    } finally {
      setCreating(false);
    }
  };

  const handleSelectStore = async (storeId: string) => {
    if (activeVisit) {
      Alert.alert(
        t("tabs.list"),
        "You already have an active visit. Finish it first.",
      );
      router.navigate("/(tabs)/cart");
      return;
    }
    try {
      await startVisit(storeId);
      router.navigate("/(tabs)/cart");
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.error || t("common.error"));
    }
  };

  const handleDeleteStore = (id: string, name: string) => {
    Alert.alert(t("common.delete"), `${name}?`, [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => deleteStore(id),
      },
    ]);
  };

  const filtered = stores.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  const storeIcons = [
    "storefront-outline",
    "basket-outline",
    "bag-outline",
    "cart-outline",
    "pricetag-outline",
  ];

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.surface }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headline, { color: colors.onSurface }]}>
          {t("stores.title")}
        </Text>
        <ThemedText
          variant="body"
          color={colors.onSurfaceVariant}
          style={{ marginTop: spacing.sm, lineHeight: 24 }}
        >
          {t("stores.subtitle")}
        </ThemedText>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.surfaceContainerHighest },
          ]}
        >
          <Ionicons name="search" size={20} color={colors.outline} />
          <TextInput
            style={[styles.searchInput, { color: colors.onSurface }]}
            placeholder={t("stores.searchPlaceholder")}
            placeholderTextColor={colors.outline}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

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
        {/* Store List */}
        {filtered.length > 0 ? (
          <View style={styles.storeGrid}>
            {filtered.map((store, i) => (
              <TouchableOpacity
                key={store.id}
                style={[
                  styles.storeCard,
                  { backgroundColor: colors.surfaceContainerLowest },
                ]}
                onPress={() => handleSelectStore(store.id)}
                onLongPress={() => handleDeleteStore(store.id, store.name)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.storeIcon,
                    { backgroundColor: colors.surfaceContainerHigh },
                  ]}
                >
                  <Ionicons
                    name={storeIcons[i % storeIcons.length] as any}
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <Text
                  style={[styles.storeName, { color: colors.onSurface }]}
                  numberOfLines={2}
                >
                  {store.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : stores.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="storefront-outline"
              size={48}
              color={colors.outline}
            />
            <ThemedText
              variant="caption"
              color={colors.onSurfaceVariant}
              style={{ textAlign: "center", marginTop: spacing.md }}
            >
              {t("stores.noStores")}
            </ThemedText>
          </View>
        ) : null}

        {/* Add Store Button */}
        <TouchableOpacity
          style={[
            styles.addStoreCard,
            { borderColor: colors.outlineVariant },
          ]}
          onPress={() => {
            if (
              user?.plan === "FREE" &&
              stores.length >= 1
            ) {
              Alert.alert("Premium", t("stores.maxStoresFree"));
              return;
            }
            setShowModal(true);
          }}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.addStoreIcon,
              { backgroundColor: colors.surfaceContainerHighest },
            ]}
          >
            <Ionicons name="add" size={24} color={colors.onSurfaceVariant} />
          </View>
          <ThemedText variant="body" style={{ fontWeight: "700" }}>
            {t("stores.addNewStore")}
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>

      {/* Create Store Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.surfaceContainerLowest },
            ]}
          >
            <ThemedText variant="title" style={{ marginBottom: spacing.xl }}>
              {t("stores.addNewStore")}
            </ThemedText>
            <View
              style={[
                styles.modalInput,
                { backgroundColor: colors.surfaceContainerHighest },
              ]}
            >
              <TextInput
                style={[styles.modalInputText, { color: colors.onSurface }]}
                placeholder={t("stores.storeNamePlaceholder")}
                placeholderTextColor={colors.outline}
                value={storeName}
                onChangeText={setStoreName}
                autoFocus
              />
            </View>
            <View style={styles.modalButtons}>
              <PrimaryButton
                title={t("common.cancel")}
                onPress={() => {
                  setShowModal(false);
                  setStoreName("");
                }}
                variant="outline"
                style={{ flex: 1 }}
              />
              <PrimaryButton
                title={t("stores.createStore")}
                onPress={handleCreateStore}
                loading={creating}
                disabled={!storeName.trim()}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  },
  headline: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -1,
    lineHeight: 40,
  },
  searchContainer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    gap: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  content: {
    padding: spacing.xl,
    paddingTop: 0,
    gap: spacing.lg,
    paddingBottom: 100,
  },
  storeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  storeCard: {
    width: "47%",
    padding: spacing.xl,
    borderRadius: radius.xl,
    gap: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  storeIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  storeName: {
    fontSize: 17,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing["3xl"],
  },
  addStoreCard: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: radius.xl,
    padding: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
  },
  addStoreIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: spacing["3xl"],
  },
  modalInput: {
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  modalInputText: {
    paddingVertical: 16,
    fontSize: 16,
    minHeight: 52,
  },
  modalButtons: {
    flexDirection: "row",
    gap: spacing.md,
  },
});
