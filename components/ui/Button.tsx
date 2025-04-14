import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useTheme } from "@/context/ThemeContext";
import { useButtonAnimation } from "@/hooks/useAnimations";
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
import Animated from "react-native-reanimated";

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
  const {
    animatedStyle,
    onPressIn: animatedPressIn,
    onPressOut: animatedPressOut,
  } = useButtonAnimation();

  // Enhanced press handling with haptic feedback simulation
  const handlePressIn = (e: any) => {
    animatedPressIn();
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    animatedPressOut();
    onPressOut?.(e);
  };

  // Enhanced variant styles with more visual depth
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: disabled ? colors.primaryLight : colors.primary,
          borderColor: "transparent",
          // Add subtle inner shadow for depth
          shadowColor: "rgba(0,0,0,0.1)",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.8,
          shadowRadius: 2,
          elevation: 3,
        };
      case "secondary":
        return {
          backgroundColor: isDark
            ? "rgba(54, 179, 255, 0.15)"
            : "rgba(0, 153, 255, 0.1)",
          borderColor: colors.primary,
          borderWidth: 1,
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
          // Add subtle inner shadow for depth
          shadowColor: "rgba(0,0,0,0.1)",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.8,
          shadowRadius: 2,
          elevation: 2,
        };
      default:
        return {
          backgroundColor: colors.primary,
          borderColor: "transparent",
        };
    }
  };

  // Fixed: use specific values for fontWeight that match React Native's TextStyle type
  const getTextStyles = () => {
    switch (variant) {
      case "primary":
        return { color: "#FFFFFF", fontWeight: "600" as const };
      case "secondary":
        return { color: colors.primary, fontWeight: "600" as const };
      case "outline":
        return { color: colors.text, fontWeight: "500" as const };
      case "ghost":
        return { color: colors.primary, fontWeight: "500" as const };
      case "danger":
        return { color: "#FFFFFF", fontWeight: "600" as const };
      default:
        return { color: "#FFFFFF", fontWeight: "600" as const };
    }
  };

  // Improved size configurations for better touch targets
  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          minHeight: 38,
          borderRadius: 10,
          fontSize: 14,
        };
      case "medium":
        return {
          paddingVertical: 12,
          paddingHorizontal: 20,
          minHeight: 48,
          borderRadius: 12,
          fontSize: 16,
        };
      case "large":
        return {
          paddingVertical: 16,
          paddingHorizontal: 24,
          minHeight: 56,
          borderRadius: 14,
          fontSize: 16,
        };
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 20,
          minHeight: 48,
          borderRadius: 12,
          fontSize: 16,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  const textStyles = getTextStyles();

  // Optimized icon sizing
  const getIconSize = () => {
    switch (size) {
      case "small":
        return 16;
      case "medium":
        return 18;
      case "large":
        return 22;
      default:
        return 18;
    }
  };

  const iconSize = getIconSize();
  const iconColor = textStyles.color as string;

  // Enhanced loading state with better visual feedback
  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={iconColor} />
          <ThemedText
            style={[
              styles.loadingText,
              { fontSize: sizeStyles.fontSize - 2, color: textStyles.color },
            ]}
          >
            {typeof children === "string" ? children : "Chargement..."}
          </ThemedText>
        </View>
      );
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
            {
              fontSize: sizeStyles.fontSize,
              color: textStyles.color,
              fontWeight: textStyles.fontWeight,
            },
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
      activeOpacity={0.7}
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
    letterSpacing: 0.3,
  },
  iconLeft: {
    marginRight: 10,
  },
  iconRight: {
    marginLeft: 10,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginLeft: 8,
    fontWeight: "500",
  },
});
