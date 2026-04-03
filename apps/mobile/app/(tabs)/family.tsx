import { useState, useEffect, useCallback } from "react";
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
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "../../hooks/useThemeColors";
import { useAuthStore } from "../../store/authStore";
import { useFamilyStore } from "../../store/familyStore";
import { ThemedText } from "../../components/ThemedText";
import { ThemedInput } from "../../components/ThemedInput";
import { PrimaryButton } from "../../components/PrimaryButton";
import { spacing, radius } from "../../theme";

export default function FamilyScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const user = useAuthStore((s) => s.user);
  const {
    group,
    myInvites,
    isLoading,
    fetchFamily,
    createFamily,
    sendInvite,
    fetchMyInvites,
    respondToInvite,
    removeMember,
    leaveFamily,
  } = useFamilyStore();

  const [refreshing, setRefreshing] = useState(false);
  const [familyName, setFamilyName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [creating, setCreating] = useState(false);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    fetchFamily();
    fetchMyInvites();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchFamily(), fetchMyInvites()]);
    setRefreshing(false);
  }, []);

  const handleCreate = async () => {
    if (!familyName.trim()) return;
    setCreating(true);
    try {
      await createFamily(familyName.trim());
      setFamilyName("");
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.error || t("common.error"));
    } finally {
      setCreating(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await sendInvite(inviteEmail.trim().toLowerCase());
      setInviteEmail("");
      Alert.alert("OK", t("family.inviteSent"));
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.error || t("common.error"));
    } finally {
      setInviting(false);
    }
  };

  const handleRespond = async (inviteId: string, accept: boolean) => {
    try {
      await respondToInvite(inviteId, accept);
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.error || t("common.error"));
    }
  };

  const handleRemove = (memberId: string, name: string) => {
    Alert.alert(
      t("family.removeMember"),
      t("family.removeMemberConfirm", { name }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await removeMember(memberId);
            } catch (err: any) {
              Alert.alert("Error", err?.response?.data?.error || t("common.error"));
            }
          },
        },
      ],
    );
  };

  const handleLeave = () => {
    Alert.alert(t("family.leaveGroup"), t("family.leaveGroupConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("family.leave"),
        style: "destructive",
        onPress: async () => {
          try {
            await leaveFamily();
          } catch (err: any) {
            Alert.alert("Error", err?.response?.data?.error || t("common.error"));
          }
        },
      },
    ]);
  };

  const isOwner = group?.ownerId === user?.id;

  // --- No family group yet ---
  if (!group) {
    return (
      <SafeAreaView
        style={[styles.safe, { backgroundColor: colors.surface }]}
        edges={["top"]}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.header}>
            <ThemedText variant="label" color={colors.onSurfaceVariant}>
              {t("family.sectionTitle")}
            </ThemedText>
            <Text style={[styles.headline, { color: colors.onSurface }]}>
              {t("family.title")}
            </Text>
          </View>

          {/* Pending invites */}
          {myInvites.length > 0 && (
            <View
              style={[
                styles.card,
                { backgroundColor: colors.tertiaryContainer },
              ]}
            >
              <View style={styles.cardHeader}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={colors.onTertiaryContainer}
                />
                <ThemedText
                  variant="title"
                  color={colors.onTertiaryContainer}
                >
                  {t("family.pendingInvites")}
                </ThemedText>
              </View>
              {myInvites.map((invite) => (
                <View
                  key={invite.id}
                  style={[
                    styles.inviteCard,
                    { backgroundColor: colors.surfaceContainerLowest },
                  ]}
                >
                  <Text style={[styles.inviteGroup, { color: colors.onSurface }]}>
                    {invite.group?.name}
                  </Text>
                  <Text
                    style={[
                      styles.inviteFrom,
                      { color: colors.onSurfaceVariant },
                    ]}
                  >
                    {t("family.invitedBy", {
                      name: invite.group?.owner?.displayName || invite.group?.owner?.email,
                    })}
                  </Text>
                  <View style={styles.inviteActions}>
                    <TouchableOpacity
                      style={[
                        styles.inviteBtn,
                        { backgroundColor: colors.primary },
                      ]}
                      onPress={() => handleRespond(invite.id, true)}
                    >
                      <Text style={{ color: colors.onPrimary, fontWeight: "700" }}>
                        {t("family.accept")}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.inviteBtn,
                        { backgroundColor: colors.surfaceContainer },
                      ]}
                      onPress={() => handleRespond(invite.id, false)}
                    >
                      <Text style={{ color: colors.onSurface, fontWeight: "600" }}>
                        {t("family.decline")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Create family group (only FAMILY plan) */}
          {user?.plan === "FAMILY" && (
            <View
              style={[
                styles.card,
                { backgroundColor: colors.surfaceContainerLowest },
              ]}
            >
              <View style={styles.cardHeader}>
                <Ionicons name="people-outline" size={20} color={colors.primary} />
                <ThemedText variant="title">
                  {t("family.createGroup")}
                </ThemedText>
              </View>
              <Text
                style={[styles.description, { color: colors.onSurfaceVariant }]}
              >
                {t("family.createGroupDesc")}
              </Text>
              <View style={{ gap: spacing.lg }}>
                <ThemedInput
                  label={t("family.groupName")}
                  placeholder={t("family.groupNamePlaceholder")}
                  value={familyName}
                  onChangeText={setFamilyName}
                />
                <PrimaryButton
                  title={t("family.createGroup")}
                  onPress={handleCreate}
                  loading={creating}
                  disabled={!familyName.trim()}
                />
              </View>
            </View>
          )}

          {/* No family, no FAMILY plan */}
          {user?.plan !== "FAMILY" && myInvites.length === 0 && (
            <View
              style={[
                styles.card,
                { backgroundColor: colors.surfaceContainerLowest },
              ]}
            >
              <View style={styles.emptyState}>
                <Ionicons
                  name="people-outline"
                  size={48}
                  color={colors.outlineVariant}
                />
                <Text
                  style={[styles.emptyTitle, { color: colors.onSurface }]}
                >
                  {t("family.noFamily")}
                </Text>
                <Text
                  style={[
                    styles.emptyDesc,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  {t("family.noFamilyDesc")}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- Has family group ---
  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.surface }]}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <ThemedText variant="label" color={colors.onSurfaceVariant}>
            {t("family.sectionTitle")}
          </ThemedText>
          <Text style={[styles.headline, { color: colors.onSurface }]}>
            {group.name}
          </Text>
        </View>

        {/* Wishlist Button */}
        <TouchableOpacity
          style={[
            styles.wishlistBtn,
            { backgroundColor: colors.primaryContainer },
          ]}
          onPress={() => router.push("/wishlist")}
          activeOpacity={0.7}
        >
          <Ionicons name="list" size={24} color={colors.onPrimaryContainer} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.wishlistBtnTitle, { color: colors.onPrimaryContainer }]}>
              {t("family.wishlist")}
            </Text>
            <Text style={[styles.wishlistBtnDesc, { color: colors.onPrimaryContainer }]}>
              {t("family.wishlistDesc")}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.onPrimaryContainer}
          />
        </TouchableOpacity>

        {/* Members */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surfaceContainerLowest },
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="people" size={20} color={colors.primary} />
            <ThemedText variant="title">
              {t("family.members")} ({group.members?.length ?? 0}/5)
            </ThemedText>
          </View>

          {group.members?.map((member) => (
            <View
              key={member.id}
              style={[
                styles.memberRow,
                { backgroundColor: colors.surfaceContainer },
              ]}
            >
              <View style={styles.memberInfo}>
                <Ionicons
                  name={member.role === "OWNER" ? "shield" : "person"}
                  size={20}
                  color={
                    member.role === "OWNER" ? colors.primary : colors.onSurfaceVariant
                  }
                />
                <View>
                  <Text style={[styles.memberName, { color: colors.onSurface }]}>
                    {member.user?.displayName || member.user?.email}
                  </Text>
                  <Text
                    style={[
                      styles.memberRole,
                      { color: colors.onSurfaceVariant },
                    ]}
                  >
                    {member.role === "OWNER"
                      ? t("family.owner")
                      : t("family.member")}
                  </Text>
                </View>
              </View>
              {isOwner && member.role !== "OWNER" && (
                <TouchableOpacity
                  onPress={() =>
                    handleRemove(
                      member.id,
                      member.user?.displayName || member.user?.email || "",
                    )
                  }
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={22}
                    color={colors.error}
                  />
                </TouchableOpacity>
              )}
            </View>
          ))}

          {/* Pending invites in group */}
          {isOwner &&
            group.invites &&
            group.invites.length > 0 && (
              <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
                <ThemedText variant="label" color={colors.onSurfaceVariant}>
                  {t("family.pendingInvites")}
                </ThemedText>
                {group.invites.map((inv) => (
                  <View
                    key={inv.id}
                    style={[
                      styles.pendingRow,
                      { backgroundColor: colors.surfaceContainerHigh },
                    ]}
                  >
                    <Ionicons
                      name="hourglass-outline"
                      size={16}
                      color={colors.onSurfaceVariant}
                    />
                    <Text style={{ color: colors.onSurfaceVariant, flex: 1 }}>
                      {inv.email}
                    </Text>
                  </View>
                ))}
              </View>
            )}
        </View>

        {/* Invite new member (owner only) */}
        {isOwner && (
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surfaceContainerLowest },
            ]}
          >
            <View style={styles.cardHeader}>
              <Ionicons
                name="person-add-outline"
                size={20}
                color={colors.secondary}
              />
              <ThemedText variant="title">
                {t("family.inviteMember")}
              </ThemedText>
            </View>
            <View style={{ gap: spacing.lg }}>
              <ThemedInput
                label={t("auth.email")}
                placeholder={t("auth.emailPlaceholder")}
                value={inviteEmail}
                onChangeText={setInviteEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <PrimaryButton
                title={t("family.sendInvite")}
                onPress={handleInvite}
                loading={inviting}
                disabled={!inviteEmail.trim()}
                variant="outline"
              />
            </View>
          </View>
        )}

        {/* Leave group (members only) */}
        {!isOwner && (
          <PrimaryButton
            title={t("family.leaveGroup")}
            onPress={handleLeave}
            variant="danger"
            icon={
              <Ionicons name="exit-outline" size={20} color="#ba1a1a" />
            }
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    padding: spacing.xl,
    gap: spacing.lg,
    paddingBottom: 100,
  },
  header: { marginBottom: spacing.sm },
  headline: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -1,
    marginTop: spacing.xs,
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
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
    borderRadius: radius.lg,
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: "700",
  },
  memberRole: {
    fontSize: 12,
    marginTop: 2,
  },
  pendingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  inviteCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    gap: spacing.sm,
  },
  inviteGroup: {
    fontSize: 16,
    fontWeight: "700",
  },
  inviteFrom: {
    fontSize: 13,
  },
  inviteActions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  inviteBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  wishlistBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.xl,
  },
  wishlistBtnTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  wishlistBtnDesc: {
    fontSize: 12,
    opacity: 0.8,
    marginTop: 2,
  },
  emptyState: {
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  emptyDesc: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 280,
  },
});
