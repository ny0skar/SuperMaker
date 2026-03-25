import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { radius } from "../theme";

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  variant?: "primary" | "outline" | "danger";
}

export function PrimaryButton({
  title,
  onPress,
  loading,
  disabled,
  icon,
  style,
  variant = "primary",
}: Props) {
  if (variant === "outline") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.outlineButton, style]}
        activeOpacity={0.7}
      >
        {icon}
        <Text style={styles.outlineText}>{title}</Text>
      </TouchableOpacity>
    );
  }

  if (variant === "danger") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.dangerButton, style]}
        activeOpacity={0.7}
      >
        {icon}
        <Text style={styles.dangerText}>{title}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={style}
    >
      <LinearGradient
        colors={["#0d631b", "#2e7d32"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          (disabled || loading) && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            {icon}
            <Text style={styles.text}>{title}</Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: radius.lg,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  outlineButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "#bfcaba",
  },
  outlineText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#40493d",
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: radius.lg,
    backgroundColor: "#ffdad6",
  },
  dangerText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ba1a1a",
  },
});
