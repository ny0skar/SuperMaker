import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  Text,
} from "react-native";
import { useThemeColors } from "../hooks/useThemeColors";
import { radius, spacing } from "../theme";

interface Props extends TextInputProps {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

export function ThemedInput({ label, icon, error, style, ...props }: Props) {
  const colors = useThemeColors();

  return (
    <View style={styles.container}>
      {label && (
        <Text
          style={[
            styles.label,
            { color: colors.onSurfaceVariant },
          ]}
        >
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.surfaceContainerHighest,
            borderColor: error ? colors.error : "transparent",
            borderWidth: error ? 1 : 0,
          },
        ]}
      >
        {icon && <View style={styles.icon}>{icon}</View>}
        <TextInput
          style={[
            styles.input,
            {
              color: colors.onSurface,
              paddingLeft: icon ? 0 : spacing.lg,
            },
            style,
          ]}
          placeholderTextColor={colors.outline}
          {...props}
        />
      </View>
      {error && (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  icon: {
    paddingLeft: spacing.lg,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingRight: spacing.lg,
    fontSize: 16,
  },
  error: {
    fontSize: 12,
    marginLeft: 4,
  },
});
