import { useRef } from "react";
import { Animated, Easing } from "react-native";
import {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

/**
 * Hook pour gérer différentes animations réutilisables avec Animated API classique
 */
export function useAnimation(initialValue = 0) {
  const animation = useRef(new Animated.Value(initialValue)).current;

  // Animation de rebond (bounce)
  const bounce = (duration = 300) => {
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 1.1,
        duration: duration / 2,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(animation, {
        toValue: 1,
        duration: duration / 2,
        useNativeDriver: true,
        easing: Easing.bounce,
      }),
    ]).start();
  };

  // Animation de pulsation (pulse)
  const pulse = (duration = 500, iterations = 1) => {
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 1.1,
        duration: duration / 2,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: 1,
        duration: duration / 2,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Animation de glissement (slide)
  const slide = (toValue = 1, duration = 300) => {
    Animated.timing(animation, {
      toValue,
      duration,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.ease),
    }).start();
  };

  // Animation de fondu (fade)
  const fade = (toValue = 1, duration = 300) => {
    Animated.timing(animation, {
      toValue,
      duration,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.ease),
    }).start();
  };

  // Réinitialisation de l'animation
  const reset = (callback?: () => void) => {
    Animated.timing(animation, {
      toValue: initialValue,
      duration: 0,
      useNativeDriver: true,
    }).start(callback);
  };

  return {
    animation,
    bounce,
    pulse,
    slide,
    fade,
    reset,
  };
}

/**
 * Hook pour les animations avec Reanimated v2, plus performantes
 */
export function useReanimatedAnimation(initialValue = 0) {
  const progress = useSharedValue(initialValue);

  // Créer un style animé basé sur la valeur partagée
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: progress.value }],
    };
  });

  // Animation avec ressort (spring)
  const spring = (toValue = 1, config = {}) => {
    progress.value = withSpring(toValue, {
      damping: 15,
      stiffness: 120,
      ...config,
    });
  };

  // Animation avec timing
  const timing = (toValue = 1, duration = 300, delay = 0) => {
    progress.value = withDelay(
      delay,
      withTiming(toValue, {
        duration,
      })
    );
  };

  // Animation de pulsation (pulse)
  const pulse = (intensity = 1.1, duration = 500) => {
    progress.value = withSequence(
      withTiming(intensity, { duration: duration / 2 }),
      withTiming(1, { duration: duration / 2 })
    );
  };

  return {
    progress,
    animatedStyle,
    spring,
    timing,
    pulse,
  };
}

/**
 * Hook pour créer des animations de bouton avec feedback tactile
 */
export function useButtonAnimation() {
  const scale = useSharedValue(1);

  // Style animé pour l'échelle du bouton
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  // Fonctions pour animer le bouton lors des interactions
  const onPressIn = () => {
    scale.value = withTiming(0.95, { duration: 100 });
  };

  const onPressOut = () => {
    scale.value = withTiming(1, { duration: 200 });
  };

  return {
    animatedStyle,
    onPressIn,
    onPressOut,
  };
}

/**
 * Hook pour créer des transitions fluides entre écrans
 */
export function useScreenTransition(isVisible = false) {
  const opacity = useSharedValue(isVisible ? 1 : 0);
  const translateY = useSharedValue(isVisible ? 0 : 20);

  // Style animé pour la transition d'écran
  const screenStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  // Afficher l'écran avec une transition
  const show = (duration = 300) => {
    opacity.value = withTiming(1, { duration });
    translateY.value = withTiming(0, { duration });
  };

  // Masquer l'écran avec une transition
  const hide = (duration = 300) => {
    opacity.value = withTiming(0, { duration });
    translateY.value = withTiming(20, { duration });
  };

  return {
    screenStyle,
    show,
    hide,
  };
}
