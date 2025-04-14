/**
 * Thème Cardify – Direction artistique rose-violet avec accent noir
 * Inspiré du logo de l'application
 */

// Couleurs principales extraites du logo
const pink = "#f17cd5"; // Rose principal
const violet = "#d083f1"; // Violet principal
const black = "#212121"; // Noir profond pour le texte et les accents
const white = "#FFFFFF"; // Blanc pour les contrastes
const lightPink = "#faf0f8"; // Rose très clair pour les fonds

// Dégradés principaux
const primaryGradient = [pink, violet];
const secondaryGradient = [lightPink, pink];

// Couleurs pour les boîtes Leitner
const boxColors = {
  1: "#ff7eb3", // Rose vif pour la boîte 1
  2: "#ff9cee", // Rose clair pour la boîte 2
  3: "#c78fff", // Violet clair pour la boîte 3
  4: "#9d7aff", // Violet pour la boîte 4
  5: violet, // Violet principal pour la boîte 5
};

export const Colors = {
  light: {
    text: black,
    textSecondary: pink,
    textTertiary: "#6d6d6d",

    background: white,
    backgroundSecondary: lightPink,
    backgroundTertiary: "#f5e7f7",

    tint: pink,
    primary: pink,
    primaryLight: "#f59ddd",
    primaryDark: "#ce58b3",
    secondary: violet,
    icon: pink,

    border: "#f5d4f7",
    borderLight: "#f9e5fb",
    shadow: "rgba(241, 124, 213, 0.15)",

    card: white,
    input: white,
    tabIconDefault: "#aaaaaa",
    tabIconSelected: pink,
    tabBar: "rgba(255, 255, 255, 0.95)",

    success: "#66bb6a",
    warning: "#ffb74d",
    error: "#ff7674",
    info: "#64b5f6",

    gradientPrimary: primaryGradient,
    gradientSecondary: secondaryGradient,

    boxColors,
  },

  dark: {
    text: white,
    textSecondary: pink,
    textTertiary: "#b8b8b8",

    background: "#121212",
    backgroundSecondary: "#1e1e1e",
    backgroundTertiary: "#2d2d2d",

    tint: pink,
    primary: pink,
    primaryLight: "#f59ddd",
    primaryDark: "#ce58b3",
    secondary: violet,
    icon: pink,

    border: "#383838",
    borderLight: "#484848",
    shadow: "rgba(0, 0, 0, 0.4)",

    card: "#242424",
    input: "#333333",
    tabIconDefault: "#888888",
    tabIconSelected: pink,
    tabBar: "rgba(18, 18, 18, 0.95)",

    success: "#66bb6a",
    warning: "#ffb74d",
    error: "#ff7674",
    info: "#64b5f6",

    gradientPrimary: primaryGradient,
    gradientSecondary: ["#3d2d3d", pink],

    boxColors,
  },
};

export const palettes = {
  pink,
  violet,
  black,
  white,
  lightPink,
  primaryGradient,
  secondaryGradient,
};
