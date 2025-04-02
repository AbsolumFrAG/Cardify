import { useTheme } from "@/context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  width?: number | string;
  color?: string;
  backgroundColor?: string;
  animated?: boolean;
  indeterminate?: boolean;
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
  useGradient?: boolean;
  gradientColors?: string[];
  gradientStart?: { x: number; y: number };
  gradientEnd?: { x: number; y: number };
}

export function ProgressBar({
  progress = 0,
  height = 8,
  width = "100%",
  color,
  backgroundColor,
  animated = true,
  indeterminate = false,
  style,
  borderRadius,
  useGradient = false,
  gradientColors,
  gradientStart = { x: 0, y: 0 },
  gradientEnd = { x: 1, y: 0 },
}: ProgressBarProps) {
  const { colors } = useTheme();
  const progressValue = useSharedValue(0);
  const indeterminateValue = useSharedValue(0);

  // Normaliser la valeur de progression
  const normalizedProgress = Math.min(Math.max(progress, 0), 1);

  // Définir les couleurs par défaut
  const progressColor = color || colors.primary;
  const gradientColorsDefault = gradientColors || [
    colors.primary,
    colors.secondary,
  ];
  const bgColor = backgroundColor || colors.backgroundTertiary;
  const radiusValue = borderRadius !== undefined ? borderRadius : height / 2;

  // Animation de la barre de progression
  useEffect(() => {
    if (!indeterminate && animated) {
      progressValue.value = withTiming(normalizedProgress, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }
  }, [normalizedProgress, animated, indeterminate]);

  // Animation de la barre indéterminée
  useEffect(() => {
    if (indeterminate) {
      indeterminateValue.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // répéter indéfiniment
        true // reverse
      );
    }
  }, [indeterminate]);

  // Style animé pour la barre de progression
  const progressAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progressValue.value * 100}%`,
    };
  });

  // Style animé pour la barre indéterminée
  const indeterminateAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: "30%",
      transform: [{ translateX: `${indeterminateValue.value * 230}%` }],
      opacity: withTiming(indeterminate ? 1 : 0, { duration: 200 }),
    };
  });

  // Rendu de la barre de progression
  return (
    <View
      style={[
        styles.container,
        {
          height,
          width,
          backgroundColor: bgColor,
          borderRadius: radiusValue,
        },
        style,
      ]}
    >
      {!indeterminate ? (
        <Animated.View
          style={[
            styles.progressBar,
            {
              borderRadius: radiusValue,
              backgroundColor: useGradient ? "transparent" : progressColor,
            },
            progressAnimatedStyle,
          ]}
        >
          {useGradient && (
            <LinearGradient
              colors={gradientColorsDefault}
              start={gradientStart}
              end={gradientEnd}
              style={styles.gradient}
            />
          )}
        </Animated.View>
      ) : (
        <Animated.View
          style={[
            styles.progressBar,
            {
              borderRadius: radiusValue,
              backgroundColor: useGradient ? "transparent" : progressColor,
            },
            indeterminateAnimatedStyle,
          ]}
        >
          {useGradient && (
            <LinearGradient
              colors={gradientColorsDefault}
              start={gradientStart}
              end={gradientEnd}
              style={styles.gradient}
            />
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    overflow: "hidden",
  },
  gradient: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});
