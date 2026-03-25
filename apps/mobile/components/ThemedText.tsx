import { Text, TextProps, StyleSheet } from "react-native";
import { useThemeColors } from "../hooks/useThemeColors";

interface Props extends TextProps {
  variant?: "headline" | "title" | "body" | "label" | "caption";
  color?: string;
}

export function ThemedText({
  variant = "body",
  color,
  style,
  ...props
}: Props) {
  const colors = useThemeColors();

  return (
    <Text
      style={[
        styles[variant],
        { color: color ?? colors.onSurface },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  headline: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  body: {
    fontSize: 16,
    fontWeight: "400",
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  caption: {
    fontSize: 13,
    fontWeight: "500",
  },
});
