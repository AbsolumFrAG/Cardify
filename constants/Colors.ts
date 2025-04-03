/**
 * Thème Cardify – Médecine équilibrée : Vert & Gris doux
 * Texte principal en gris, accents en vert
 */

const green = '#16877e';      // Accent principal
const grey = '#4D5E6C';       // Texte principal (gris doux)
const greyTertiary = '#6C7A89'; // Texte tertiaire
const white = '#FFFFFF';      // Fond
const softGrey = '#F1F3F5';   // Fond secondaire

export const Colors = {
  light: {
    text: grey,
    textSecondary: green,
    textTertiary: greyTertiary,

    background: white,
    backgroundSecondary: softGrey,
    backgroundTertiary: '#E8ECEF',

    tint: green,
    primary: green,
    primaryLight: '#3DAA9C',
    primaryDark: '#0D5C55',
    secondary: green,
    icon: green,

    border: '#D0D8DA',
    borderLight: '#E2E8EA',
    shadow: 'rgba(0, 0, 0, 0.04)',

    card: white,
    input: white,
    tabIconDefault: greyTertiary,
    tabIconSelected: green,
    tabBar: 'rgba(255, 255, 255, 0.95)',

    success: green,
    warning: green,
    error: green,
    info: green,

    gradientPrimary: [green, grey],
    gradientSecondary: ['#DDECF1', green],
  },

  dark: {
    text: white,
    textSecondary: green,
    textTertiary: greyTertiary,

    background: '#121616',
    backgroundSecondary: '#1A2020',
    backgroundTertiary: '#1F2A2A',

    tint: green,
    primary: green,
    primaryLight: '#3DAA9C',
    primaryDark: '#0D5C55',
    secondary: green,
    icon: green,

    border: '#2A3B3A',
    borderLight: '#3A4D4D',
    shadow: 'rgba(0, 0, 0, 0.15)',

    card: '#1E2626',
    input: '#2B3C3A',
    tabIconDefault: greyTertiary,
    tabIconSelected: green,
    tabBar: 'rgba(24, 32, 30, 0.95)',

    success: green,
    warning: green,
    error: green,
    info: green,

    gradientPrimary: [green, '#0D5C55'],
    gradientSecondary: ['#223F3F', green],
  },
};

export const palettes = {
  green,
  grey,
  greyTertiary,
  white,
  softGrey,
};
