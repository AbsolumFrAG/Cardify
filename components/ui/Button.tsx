import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useTheme } from "@/context/ThemeContext";
import { ReactNode } from "react";
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";
export type ButtonSize = "small" | "medium" | "large";

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: string;
  rightIcon?: string;
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "medium",
  leftIcon,
  rightIcon,
  isLoading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  children,
  onPressIn,
  onPressOut,
  ...rest
}: ButtonProps) {
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);

  // Gestion des animations de pression
  const handlePressIn = (e: any) => {
    scale.value = withTiming(0.96, { duration: 100 });
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    scale.value = withTiming(1, { duration: 200 });
    onPressOut?.(e);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  // Déterminer les styles selon la variante
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: disabled ? colors.primaryLight : colors.primary,
          borderColor: "transparent",
        };
      case "secondary":
        return {
          backgroundColor: isDark
            ? "rgba(54, 179, 255, 0.15)"
            : "rgba(0, 153, 255, 0.1)",
          borderColor: "transparent",
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderColor: colors.border,
          borderWidth: 1,
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
          borderColor: "transparent",
        };
      case "danger":
        return {
          backgroundColor: disabled ? "rgba(244, 67, 54, 0.6)" : colors.error,
          borderColor: "transparent",
        };
      default:
        return {
          backgroundColor: colors.primary,
          borderColor: "transparent",
        };
    }
  };

  // Déterminer le style du texte selon la variante
  const getTextStyles = () => {
    switch (variant) {
      case "primary":
        return { color: "#FFFFFF" };
      case "secondary":
        return { color: colors.primary };
      case "outline":
        return { color: colors.text };
      case "ghost":
        return { color: colors.primary };
      case "danger":
        return { color: "#FFFFFF" };
      default:
        return { color: "#FFFFFF" };
    }
  };

  // Déterminer les styles selon la taille
  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          paddingVertical: 8,
          paddingHorizontal: 12,
          minHeight: 36,
          borderRadius: 8,
          fontSize: 14,
        };
      case "medium":
        return {
          paddingVertical: 12,
          paddingHorizontal: 16,
          minHeight: 44,
          borderRadius: 10,
          fontSize: 16,
        };
      case "large":
        return {
          paddingVertical: 14,
          paddingHorizontal: 20,
          minHeight: 52,
          borderRadius: 12,
          fontSize: 16,
        };
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 16,
          minHeight: 44,
          borderRadius: 10,
          fontSize: 16,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  const textStyles = getTextStyles();

  const getIconSize = () => {
    switch (size) {
      case "small":
        return 16;
      case "medium":
        return 18;
      case "large":
        return 20;
      default:
        return 18;
    }
  };

  const iconSize = getIconSize();
  const iconColor = textStyles.color as string;

  // Rendu du contenu du bouton
  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator size="small" color={iconColor} />;
    }

    return (
      <>
        {leftIcon && (
          <View style={styles.iconLeft}>
            <IconSymbol
              name={leftIcon as any}
              size={iconSize}
              color={iconColor}
            />
          </View>
        )}

        <ThemedText
          style={[
            styles.text,
            { fontSize: sizeStyles.fontSize, color: textStyles.color },
            textStyle,
          ]}
        >
          {children}
        </ThemedText>

        {rightIcon && (
          <View style={styles.iconRight}>
            <IconSymbol
              name={rightIcon as any}
              size={iconSize}
              color={iconColor}
            />
          </View>
        )}
      </>
    );
  };

  return (
    <AnimatedTouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || isLoading}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.button,
        {
          ...variantStyles,
          ...sizeStyles,
          opacity: disabled ? 0.6 : 1,
          width: fullWidth ? "100%" : undefined,
        },
        style,
        animatedStyle,
      ]}
      {...rest}
    >
      <View style={styles.contentContainer}>{renderContent()}</View>
    </AnimatedTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "600",
    textAlign: "center",
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
