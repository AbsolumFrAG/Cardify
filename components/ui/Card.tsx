import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { Pressable, StyleProp, StyleSheet, ViewStyle } from "react-native";
import Animated, {
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
}

interface CardHeaderProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

interface CardContentProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

interface CardFooterProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

interface CardTitleProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

function CardHeader({ children, style }: CardHeaderProps) {
  return <ThemedView style={[styles.header, style]}>{children}</ThemedView>;
}

function CardContent({ children, style }: CardContentProps) {
  return <ThemedView style={[styles.content, style]}>{children}</ThemedView>;
}

function CardFooter({ children, style }: CardFooterProps) {
  return <ThemedView style={[styles.footer, style]}>{children}</ThemedView>;
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
}: CardProps) {
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);

  // Animation de pression
  const handlePressIn = () => {
    if (pressable && onPress) {
      scale.value = withTiming(0.98, { duration: 100 });
    }
  };

  const handlePressOut = () => {
    if (pressable && onPress) {
      scale.value = withTiming(1, { duration: 200 });
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Styles selon la variante
  const getVariantStyle = () => {
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
          shadowOffset: { width: 0, height: elevation },
          shadowOpacity: isDark ? 0.5 : 0.1,
          shadowRadius: elevation * 2,
          elevation: elevation,
        };
      case "gradient":
        return {
          backgroundColor: "transparent",
        };
      default:
        return {
          backgroundColor: colors.card,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        };
    }
  };

  const variantStyle = getVariantStyle();
  const defaultGradientColors = isDark
    ? colors.gradientPrimary
    : ["#FFFFFF", "#F8F9FA"];

  // Rendu conditionnel selon la variante
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
          style={[styles.container, variantStyle, style, animatedStyle]}
        >
          {children}
        </AnimatedLinearGradient>
      );
    }

    return (
      <ThemedView
        style={[styles.container, variantStyle, style, animatedStyle]}
      >
        {children}
      </ThemedView>
    );
  };

  // Si la carte est pressable, on l'entoure d'un Pressable animé
  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={animatedStyle}
      >
        {renderCard()}
      </AnimatedPressable>
    );
  }

  // Sinon on retourne simplement la carte
  return renderCard();
}

// Composants enfants
Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;
Card.Title = CardTitle;

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
    marginVertical: 8,
  },
  header: {
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  content: {
    padding: 16,
  },
  footer: {
    padding: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
});
