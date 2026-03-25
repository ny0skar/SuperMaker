export const LightColors = {
  primary: "#0d631b",
  onPrimary: "#ffffff",
  primaryContainer: "#2e7d32",
  onPrimaryContainer: "#cbffc2",

  secondary: "#206393",
  onSecondary: "#ffffff",
  secondaryContainer: "#90c9ff",
  onSecondaryContainer: "#035584",

  tertiary: "#824600",
  onTertiary: "#ffffff",
  tertiaryContainer: "#a55b00",
  onTertiaryContainer: "#ffeee3",

  error: "#ba1a1a",
  onError: "#ffffff",
  errorContainer: "#ffdad6",
  onErrorContainer: "#93000a",

  surface: "#f7fbf0",
  surfaceBright: "#f7fbf0",
  surfaceDim: "#d7dbd2",
  surfaceContainer: "#ebefe5",
  surfaceContainerLow: "#f1f5eb",
  surfaceContainerHigh: "#e5eadf",
  surfaceContainerHighest: "#e0e4da",
  surfaceContainerLowest: "#ffffff",

  onSurface: "#181d17",
  onSurfaceVariant: "#40493d",
  outline: "#707a6c",
  outlineVariant: "#bfcaba",

  background: "#f7fbf0",
  onBackground: "#181d17",

  inverseSurface: "#2d322b",
  inverseOnSurface: "#eef2e8",
  inversePrimary: "#88d982",

  surfaceTint: "#1b6d24",
} as const;

export const DarkColors = {
  primary: "#88d982",
  onPrimary: "#00390a",
  primaryContainer: "#005312",
  onPrimaryContainer: "#a3f69c",

  secondary: "#96ccff",
  onSecondary: "#003353",
  secondaryContainer: "#004a75",
  onSecondaryContainer: "#cee5ff",

  tertiary: "#ffb77a",
  onTertiary: "#4b2700",
  tertiaryContainer: "#6d3a00",
  onTertiaryContainer: "#ffdcc2",

  error: "#ffb4ab",
  onError: "#690005",
  errorContainer: "#93000a",
  onErrorContainer: "#ffdad6",

  surface: "#10140f",
  surfaceBright: "#363a34",
  surfaceDim: "#10140f",
  surfaceContainer: "#1c211b",
  surfaceContainerLow: "#181d17",
  surfaceContainerHigh: "#272b25",
  surfaceContainerHighest: "#323630",
  surfaceContainerLowest: "#0c100b",

  onSurface: "#e0e4da",
  onSurfaceVariant: "#bfcaba",
  outline: "#8a9385",
  outlineVariant: "#40493d",

  background: "#10140f",
  onBackground: "#e0e4da",

  inverseSurface: "#e0e4da",
  inverseOnSurface: "#2d322b",
  inversePrimary: "#1b6d24",

  surfaceTint: "#88d982",
} as const;

export type ColorScheme = typeof LightColors;
