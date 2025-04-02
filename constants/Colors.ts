/**
 * Système de couleurs Cardify - Une palette moderne et cohérente
 * Supportant les modes clair et sombre avec des variantes sémantiques
 */

// Palette de couleurs primaires
const primaryPalette = {
  50: "#e6f4ff",
  100: "#bae3ff",
  200: "#7cc9ff",
  300: "#36b3ff",
  400: "#0099ff", // Couleur principale
  500: "#0084e3",
  600: "#0066b8",
  700: "#004c8c",
  800: "#003566",
  900: "#001f3d",
};

// Palette de couleurs secondaires
const secondaryPalette = {
  50: "#f0f9ff",
  100: "#daf0ff",
  200: "#b3e0ff",
  300: "#80ceff",
  400: "#4db8ff",
  500: "#1a9fff",
  600: "#007acc",
  700: "#0062a3",
  800: "#004875",
  900: "#002e4d",
};

// Couleurs sémantiques
const semanticColors = {
  success: {
    light: "#4CAF50",
    dark: "#8BC34A",
  },
  warning: {
    light: "#FF9800",
    dark: "#FFC107",
  },
  error: {
    light: "#F44336",
    dark: "#FF5252",
  },
  info: {
    light: "#03A9F4",
    dark: "#29B6F6",
  },
};

// Niveaux de boîtes Leitner (pour les flashcards)
const boxColors = {
  1: "#F44336", // Rouge - connaissances fragiles
  2: "#FF9800", // Orange
  3: "#FFC107", // Jaune
  4: "#8BC34A", // Vert clair
  5: "#4CAF50", // Vert - maîtrisé
};

export const Colors = {
  light: {
    // Couleurs de base
    text: "#11181C",
    textSecondary: "#4D5E6C",
    textTertiary: "#687076",
    background: "#FFFFFF",
    backgroundSecondary: "#F8F9FA",
    backgroundTertiary: "#F1F3F5",

    // Couleurs d'interface
    tint: primaryPalette[400],
    primaryLight: primaryPalette[300],
    primary: primaryPalette[400],
    primaryDark: primaryPalette[600],
    secondary: secondaryPalette[400],
    border: "#E5E7EB",
    borderLight: "#F3F4F6",
    shadow: "rgba(0, 0, 0, 0.06)",

    // Composants spécifiques
    card: "#FFFFFF",
    input: "#FFFFFF",
    icon: "#687076",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: primaryPalette[400],
    tabBar: "rgba(255, 255, 255, 0.8)",

    // Couleurs sémantiques
    success: semanticColors.success.light,
    warning: semanticColors.warning.light,
    error: semanticColors.error.light,
    info: semanticColors.info.light,

    // Couleurs spécifiques à l'application
    boxColors,

    // Gradients
    gradientPrimary: ["#0099FF", "#0066B8"],
    gradientSecondary: ["#36B3FF", "#0099FF"],
  },
  dark: {
    // Couleurs de base
    text: "#ECEDEE",
    textSecondary: "#A9B6C2",
    textTertiary: "#9BA1A6",
    background: "#151718",
    backgroundSecondary: "#1E2021",
    backgroundTertiary: "#292A2B",

    // Couleurs d'interface
    tint: primaryPalette[300],
    primaryLight: primaryPalette[200],
    primary: primaryPalette[300],
    primaryDark: primaryPalette[500],
    secondary: secondaryPalette[300],
    border: "#2E3132",
    borderLight: "#3E4142",
    shadow: "rgba(0, 0, 0, 0.2)",

    // Composants spécifiques
    card: "#1E2021",
    input: "#292A2B",
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: primaryPalette[300],
    tabBar: "rgba(30, 32, 33, 0.8)",

    // Couleurs sémantiques
    success: semanticColors.success.dark,
    warning: semanticColors.warning.dark,
    error: semanticColors.error.dark,
    info: semanticColors.info.dark,

    // Couleurs spécifiques à l'application
    boxColors,

    // Gradients
    gradientPrimary: ["#0099FF", "#007ACC"],
    gradientSecondary: ["#36B3FF", "#0084E3"],
  },
};

// Exporter également les palettes pour une utilisation avancée
export const palettes = {
  primary: primaryPalette,
  secondary: secondaryPalette,
};
