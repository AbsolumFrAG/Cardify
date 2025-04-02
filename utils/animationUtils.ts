import { Animated, Easing } from "react-native";

/**
 * Animation de séquence avec Promises pour un chaînage facile
 * @param animation - Valeur Animated à animer
 * @param toValue - Valeur cible
 * @param duration - Durée de l'animation en ms
 * @param easing - Fonction d'easing
 * @returns Promise qui se résout à la fin de l'animation
 */
export function animateTiming(
  animation: Animated.Value,
  toValue: number,
  duration: number = 300,
  easing: any = Easing.inOut(Easing.ease)
): Promise<void> {
  return new Promise((resolve) => {
    Animated.timing(animation, {
      toValue,
      duration,
      easing,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        resolve();
      }
    });
  });
}

/**
 * Animation de ressort avec Promises
 * @param animation - Valeur Animated à animer
 * @param toValue - Valeur cible
 * @param friction - Friction du ressort
 * @param tension - Tension du ressort
 * @returns Promise qui se résout à la fin de l'animation
 */
export function animateSpring(
  animation: Animated.Value,
  toValue: number,
  friction: number = 7,
  tension: number = 40
): Promise<void> {
  return new Promise((resolve) => {
    Animated.spring(animation, {
      toValue,
      friction,
      tension,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        resolve();
      }
    });
  });
}

/**
 * Animation de séquence pour plusieurs étapes
 * @param animation - Valeur Animated à animer
 * @param values - Tableau de valeurs cibles
 * @param durations - Tableau de durées pour chaque étape
 * @returns Promise qui se résout à la fin de la séquence
 */
export async function animateSequence(
  animation: Animated.Value,
  values: number[],
  durations: number[]
): Promise<void> {
  if (values.length !== durations.length) {
    throw new Error(
      "Les tableaux values et durations doivent avoir la même longueur"
    );
  }

  for (let i = 0; i < values.length; i++) {
    await animateTiming(animation, values[i], durations[i]);
  }
}

/**
 * Animation de fondu avec délai
 * @param animation - Valeur Animated à animer
 * @param toValue - Valeur cible
 * @param duration - Durée de l'animation
 * @param delay - Délai avant le début de l'animation
 * @returns Promise qui se résout à la fin de l'animation
 */
export function animateWithDelay(
  animation: Animated.Value,
  toValue: number,
  duration: number = 300,
  delay: number = 0
): Promise<void> {
  return new Promise((resolve) => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(animation, {
        toValue,
        duration,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        resolve();
      }
    });
  });
}

/**
 * Animation en parallèle pour plusieurs animations
 * @param animations - Tableau d'objets animation contenant value, toValue, et duration
 * @returns Promise qui se résout quand toutes les animations sont terminées
 */
export function animateParallel(
  animations: Array<{
    value: Animated.Value;
    toValue: number;
    duration: number;
  }>
): Promise<void> {
  return new Promise((resolve) => {
    const animationArray = animations.map((animation) =>
      Animated.timing(animation.value, {
        toValue: animation.toValue,
        duration: animation.duration,
        useNativeDriver: true,
      })
    );

    Animated.parallel(animationArray).start(({ finished }) => {
      if (finished) {
        resolve();
      }
    });
  });
}

/**
 * Crée une interpolation pour les animations de couleur
 * @param animation - Valeur Animated à interpoler
 * @param inputRange - Plage d'entrée [0, 1] par défaut
 * @param outputRange - Plage de sortie (couleurs)
 * @returns Valeur interpolée
 */
export function interpolateColor(
  animation: Animated.Value,
  inputRange: number[] = [0, 1],
  outputRange: string[]
): Animated.AnimatedInterpolation<string> {
  return animation.interpolate({
    inputRange,
    outputRange,
  });
}

/**
 * Génère une animation de loop (répétitive)
 * @param animation - Valeur Animated à animer
 * @param config - Configuration de l'animation
 * @returns Fonction pour arrêter l'animation
 */
export function createLoop(
  animation: Animated.Value,
  config: {
    toValue: number;
    duration: number;
    initialValue?: number;
    easing?: any;
    iterations?: number;
  }
): () => void {
  const {
    toValue,
    duration,
    initialValue = 0,
    easing = Easing.inOut(Easing.ease),
    iterations = -1,
  } = config;

  animation.setValue(initialValue);

  const loop = Animated.loop(
    Animated.sequence([
      Animated.timing(animation, {
        toValue,
        duration,
        easing,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: initialValue,
        duration,
        easing,
        useNativeDriver: true,
      }),
    ]),
    { iterations }
  );

  loop.start();

  return () => {
    loop.stop();
  };
}
