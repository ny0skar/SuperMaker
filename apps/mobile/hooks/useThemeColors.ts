import { useColorScheme } from "react-native";
import { LightColors, DarkColors } from "../theme";

export type ThemeColors = typeof LightColors | typeof DarkColors;

export function useThemeColors() {
  const scheme = useColorScheme();
  return scheme === "dark" ? DarkColors : LightColors;
}
