import { ReactNode } from "react";
import {
  View,
  ViewProps,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Platform,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";

export type ThemedViewVariant =
  | "default"
  | "primary"
  | "secondary"
  | "card"
  | "surface"
  | "outlined";

export type ThemedViewElevation = 0 | 1 | 2 | 3 | 4 | 8 | 16 | 24;

export interface ThemedViewProps extends ViewProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  lightColor?: string;
  darkColor?: string;
  variant?: ThemedViewVariant;
  elevation?: ThemedViewElevation;
  fullWidth?: boolean;
  centered?: boolean;
  rounded?: boolean | number;
  paddingLevel?: 0 | 1 | 2 | 3 | 4;
}

export function ThemedView({
  style,
  lightColor,
  darkColor,
  variant = "default",
  elevation = 0,
  fullWidth = false,
  centered = false,
  rounded = false,
  paddingLevel = 0,
  children,
  ...otherProps
}: ThemedViewProps) {
  const { colors, isDark } = useTheme();

  // Déterminer la couleur de fond en fonction du thème et de la variante
  const getBackgroundColor = (): string => {
    // Si des couleurs spécifiques sont fournies, les utiliser en priorité
    if (lightColor && !isDark) return lightColor;
    if (darkColor && isDark) return darkColor;

    // Sinon, utiliser les couleurs basées sur la variante
    switch (variant) {
      case "primary":
        return colors.primary;
      case "secondary":
        return colors.secondary;
      case "card":
        return colors.card;
      case "surface":
        return isDark ? colors.backgroundSecondary : colors.background;
      case "outlined":
        return "transparent";
      case "default":
      default:
        return colors.background;
    }
  };

  // Obtenir les styles d'élévation
  const getElevationStyle = (): ViewStyle => {
    if (elevation === 0) return {};

    const shadowOpacity = isDark ? 0.5 : 0.15;
    const shadowRadius = elevation * 0.5;
    const shadowOffset = {
      width: 0,
      height: elevation * 0.25,
    };

    return Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset,
        shadowOpacity,
        shadowRadius,
      },
      android: {
        elevation,
      },
      default: {
        shadowColor: "#000000",
        shadowOffset,
        shadowOpacity,
        shadowRadius,
      },
    }) as ViewStyle;
  };

  // Déterminer le padding en fonction du niveau
  const getPaddingStyle = (): ViewStyle => {
    switch (paddingLevel) {
      case 1:
        return { padding: 4 };
      case 2:
        return { padding: 8 };
      case 3:
        return { padding: 16 };
      case 4:
        return { padding: 24 };
      case 0:
      default:
        return {};
    }
  };

  // Obtenir le style de bordure pour la variante outlined
  const getBorderStyle = (): ViewStyle => {
    if (variant === "outlined") {
      return {
        borderWidth: 1,
        borderColor: colors.border,
      };
    }
    return {};
  };

  // Déterminer le style de coin arrondi
  const getRoundedStyle = (): ViewStyle => {
    if (rounded === false) return {};

    if (typeof rounded === "number") {
      return { borderRadius: rounded };
    }

    return { borderRadius: 8 };
  };

  const backgroundColor = getBackgroundColor();

  return (
    <View
      style={[
        { backgroundColor },
        fullWidth && styles.fullWidth,
        centered && styles.centered,
        getElevationStyle(),
        getPaddingStyle(),
        getBorderStyle(),
        getRoundedStyle(),
        style,
      ]}
      {...otherProps}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fullWidth: {
    width: "100%",
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
});
