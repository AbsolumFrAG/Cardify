import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  TextStyle,
  ViewStyle,
} from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  elevation?: number;
  variant?: "default" | "outlined" | "elevated" | "gradient";
  onPress?: () => void;
  gradientColors?: string[];
  gradientStart?: { x: number; y: number };
  gradientEnd?: { x: number; y: number };
  pressable?: boolean;
  fullWidth?: boolean;
  compact?: boolean;
}

interface CardHeaderProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

interface CardContentProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
}

interface CardFooterProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

interface CardTitleProps {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
}

function CardHeader({ children, style }: CardHeaderProps) {
  const { colors } = useTheme();
  return (
    <ThemedView
      style={[styles.header, { borderBottomColor: colors.border }, style]}
    >
      {children}
    </ThemedView>
  );
}

function CardContent({ children, style, padded = true }: CardContentProps) {
  return (
    <ThemedView style={[styles.content, !padded && styles.noPadding, style]}>
      {children}
    </ThemedView>
  );
}

function CardFooter({ children, style }: CardFooterProps) {
  const { colors } = useTheme();
  return (
    <ThemedView
      style={[styles.footer, { borderTopColor: colors.border }, style]}
    >
      {children}
    </ThemedView>
  );
}

function CardTitle({ children, style }: CardTitleProps) {
  return <ThemedText style={[styles.title, style]}>{children}</ThemedText>;
}

export function Card({
  children,
  style,
  elevation = 2,
  variant = "default",
  onPress,
  gradientColors,
  gradientStart = { x: 0, y: 0 },
  gradientEnd = { x: 1, y: 1 },
  pressable = true,
  fullWidth = false,
  compact = false,
}: CardProps) {
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);
  const backgroundColor = useSharedValue(0);

  // Enhanced animation for press feedback
  const handlePressIn = () => {
    if (pressable && onPress) {
      scale.value = withTiming(0.98, { duration: 100 });
      backgroundColor.value = withTiming(1, { duration: 200 });
    }
  };

  const handlePressOut = () => {
    if (pressable && onPress) {
      scale.value = withTiming(1, { duration: 300 });
      backgroundColor.value = withTiming(0, { duration: 300 });
    }
  };

  // Enhanced animations with smoother transitions
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Enhanced background color animation
  const animatedBackgroundStyle = useAnimatedStyle(() => {
    if (variant === "gradient") return {};

    const bgColor = interpolateColor(
      backgroundColor.value,
      [0, 1],
      [colors.card, isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)"]
    );

    return { backgroundColor: bgColor };
  });

  // Enhanced variant styles with better shadows and depth
  const getVariantStyle = () => {
    const baseElevation = compact ? Math.max(1, elevation - 1) : elevation;

    switch (variant) {
      case "outlined":
        return {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: colors.border,
          shadowOpacity: 0,
        };
      case "elevated":
        return {
          backgroundColor: colors.card,
          shadowColor: isDark ? "#000000" : colors.shadow,
          shadowOffset: { width: 0, height: baseElevation },
          shadowOpacity: isDark ? 0.7 : 0.15,
          shadowRadius: baseElevation * 2,
          elevation: baseElevation * 2,
        };
      case "gradient":
        return {
          backgroundColor: "transparent",
        };
      default:
        return {
          backgroundColor: colors.card,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: baseElevation * 0.5 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: baseElevation,
          elevation: baseElevation,
        };
    }
  };

  const variantStyle = getVariantStyle();
  const defaultGradientColors = isDark
    ? [colors.backgroundSecondary, colors.backgroundTertiary]
    : ["#FFFFFF", "#F8F9FA"];

  // Render conditional gradient card
  const renderCard = () => {
    if (variant === "gradient") {
      return (
        <AnimatedLinearGradient
          colors={
            (gradientColors || defaultGradientColors) as [
              string,
              string,
              ...string[]
            ]
          }
          start={gradientStart}
          end={gradientEnd}
          style={[
            styles.container,
            compact ? styles.compactContainer : null,
            variantStyle,
            fullWidth && styles.fullWidth,
            style,
            animatedStyle,
          ]}
        >
          {children}
        </AnimatedLinearGradient>
      );
    }

    return (
      <Animated.View
        style={[
          styles.container,
          compact ? styles.compactContainer : null,
          variantStyle,
          fullWidth && styles.fullWidth,
          style,
          animatedStyle,
          animatedBackgroundStyle,
        ]}
      >
        {children}
      </Animated.View>
    );
  };

  // Enhanced pressable card with better animations
  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[fullWidth && styles.fullWidth]}
      >
        {renderCard()}
      </AnimatedPressable>
    );
  }

  // Standard card without press interactions
  return renderCard();
}

// Composable card subcomponents
Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;
Card.Title = CardTitle;

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: "hidden",
    marginVertical: 8,
  },
  compactContainer: {
    borderRadius: 12,
    marginVertical: 6,
  },
  fullWidth: {
    width: "100%",
  },
  header: {
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  content: {
    padding: 16,
  },
  noPadding: {
    padding: 0,
  },
  footer: {
    padding: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
});
