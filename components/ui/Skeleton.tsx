import { useTheme } from "@/context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { StyleSheet, View, ViewProps } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

interface SkeletonProps extends ViewProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  variant?: "rectangular" | "circular" | "text";
  animation?: "pulse" | "wave" | "none";
  speed?: number;
}

export function Skeleton({
  width = "100%",
  height = 16,
  borderRadius,
  variant = "rectangular",
  animation = "pulse",
  speed = 1500,
  style,
  ...rest
}: SkeletonProps) {
  const { colors, isDark } = useTheme();
  const opacity = useSharedValue(0.5);
  const translateX = useSharedValue(-1);

  // Définir le rayon de la bordure en fonction de la variante
  const getBorderRadius = () => {
    if (borderRadius !== undefined) return borderRadius;

    switch (variant) {
      case "circular":
        return 9999;
      case "text":
        return 4;
      default:
        return 4;
    }
  };

  // Couleurs pour le skeleton
  const baseColor = isDark ? colors.backgroundTertiary : "#E5E7EB";
  const highlightColor = isDark ? colors.backgroundSecondary : "#F3F4F6";

  // Animation de pulsation
  useEffect(() => {
    if (animation === "pulse") {
      opacity.value = withRepeat(
        withTiming(1, { duration: speed, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else if (animation === "wave") {
      translateX.value = withRepeat(
        withTiming(1, { duration: speed, easing: Easing.inOut(Easing.ease) }),
        -1,
        false
      );
    }
  }, [animation, speed]);

  // Style animé pour la pulsation
  const pulseAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(opacity.value, [0.5, 1], [0.5, 1]),
    };
  });

  // Style animé pour l'effet de vague
  const waveAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(translateX.value, [-1, 1], [-100, 100]),
        },
      ],
    };
  });

  // Hauteur pour la variante texte
  const getTextHeight = () => {
    return typeof height === "number" ? height : 16;
  };

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height: variant === "text" ? getTextHeight() : height,
          borderRadius: getBorderRadius(),
          backgroundColor: baseColor,
        },
        animation === "pulse" ? pulseAnimatedStyle : {},
        style,
      ]}
      {...rest}
    >
      {animation === "wave" && (
        <Animated.View style={[styles.waveContainer, waveAnimatedStyle]}>
          <LinearGradient
            colors={[baseColor, highlightColor, baseColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.wave}
          />
        </Animated.View>
      )}
    </Animated.View>
  );
}

// Composants de squelette prêts à l'emploi
export const SkeletonText = (props: Omit<SkeletonProps, "variant">) => (
  <Skeleton variant="text" {...props} />
);

export const SkeletonCircle = (props: Omit<SkeletonProps, "variant">) => (
  <Skeleton variant="circular" {...props} />
);

export const SkeletonRectangle = (props: Omit<SkeletonProps, "variant">) => (
  <Skeleton variant="rectangular" {...props} />
);

// Composant pour créer une ligne de texte avec un squelette
export function SkeletonLine({
  width = "100%",
  height = 16,
  style,
  ...rest
}: Omit<SkeletonProps, "variant">) {
  return (
    <Skeleton
      variant="text"
      width={width}
      height={height}
      style={[{ marginVertical: 4 }, style]}
      {...rest}
    />
  );
}

// Composant pour créer un paragraphe avec plusieurs lignes de squelette
export function SkeletonParagraph({
  lines = 3,
  lastLineWidth = "80%",
  spacing = 8,
  lineHeight = 16,
  style,
  ...rest
}: {
  lines?: number;
  lastLineWidth?: number | string;
  spacing?: number;
  lineHeight?: number;
  style?: SkeletonProps["style"];
  animation?: SkeletonProps["animation"];
  speed?: SkeletonProps["speed"];
}) {
  return (
    <View style={[styles.paragraph, style]}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? lastLineWidth : "100%"}
          height={lineHeight}
          style={{ marginBottom: i === lines - 1 ? 0 : spacing }}
          {...rest}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    overflow: "hidden",
  },
  waveContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  wave: {
    width: "200%",
    height: "100%",
  },
  paragraph: {
    width: "100%",
  },
});
