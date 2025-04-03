import { useRef } from "react";
import { Animated } from "react-native";
import {
  Easing,
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

  const pulse = (duration = 500) => {
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

  const slide = (toValue = 1, duration = 300) => {
    Animated.timing(animation, {
      toValue,
      duration,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.ease),
    }).start();
  };

  const fade = (toValue = 1, duration = 300) => {
    Animated.timing(animation, {
      toValue,
      duration,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.ease),
    }).start();
  };

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
 * Hook pour les animations avec Reanimated v2
 */
export function useReanimatedAnimation(initialValue = 0) {
  const progress = useSharedValue(initialValue);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: progress.value }],
  }));

  const spring = (toValue = 1, config = {}) => {
    progress.value = withSpring(toValue, {
      damping: 15,
      stiffness: 120,
      ...config,
    });
  };

  const timing = (toValue = 1, duration = 300, delay = 0) => {
    progress.value = withDelay(
      delay,
      withTiming(toValue, { duration })
    );
  };

  const pulse = (intensity = 1.1, duration = 500) => {
    progress.value = withSequence(
      withTiming(intensity, {
        duration: duration / 2,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      withTiming(1, {
        duration: duration / 2,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })
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
 * Hook pour animation de bouton avec feedback tactile
 */
export function useButtonAnimation() {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withTiming(0.95, {
      duration: 100,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  };

  const onPressOut = () => {
    scale.value = withTiming(1, {
      duration: 200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
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

  const screenStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const show = (duration = 300) => {
    opacity.value = withTiming(1, { duration });
    translateY.value = withTiming(0, { duration });
  };

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
