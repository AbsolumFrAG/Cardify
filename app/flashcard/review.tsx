import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useFlashcards } from "@/context/FlashcardContext";
import { useTheme } from "@/context/ThemeContext";
import { getDueFlashcards } from "@/services/leitnerSystem";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  SlideInDown,
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");
const CARD_HEIGHT = height * 0.45;

export default function ReviewScreen() {
  const { flashcards, reviewFlashcard } = useFlashcards();
  const { colors, isDark } = useTheme();
  const [dueCards, setDueCards] = useState<Array<any>>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [exitingCard, setExitingCard] = useState<
    "correct" | "incorrect" | null
  >(null);

  // Valeurs d'animation
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Animer un bouton de réponse lorsqu'il est pressé
  const buttonScaleCorrect = useSharedValue(1);
  const buttonScaleIncorrect = useSharedValue(1);
  const buttonBounceCorrect = useSharedValue(0);
  const buttonBounceIncorrect = useSharedValue(0);

  useEffect(() => {
    const cards = getDueFlashcards(flashcards);
    setDueCards(cards);

    if (cards.length === 0) {
      setCompleted(true);
    }
  }, [flashcards]);

  // Style animé pour la rotation de la carte
  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(rotate.value, [0, 1], [0, 180]);
    const shadowOpacity = interpolate(rotate.value, [0, 0.5], [0.1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    });

    return {
      transform: [
        { perspective: 1000 },
        { scale: scale.value },
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotateY: `${rotateValue}deg` },
      ],
      opacity: rotate.value > 0.5 ? 0 : 1,
      position: "absolute",
      width: "100%",
      height: "100%",
      backfaceVisibility: "hidden",
      shadowColor: isDark ? '#000' : '#888',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity,
      shadowRadius: 4,
      elevation: 5,
    };
  });

  // Style animé pour le dos de la carte
  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(rotate.value, [0, 1], [180, 360]);
    const shadowOpacity = interpolate(rotate.value, [0.5, 1], [0, 0.1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    });

    return {
      transform: [
        { perspective: 1000 },
        { scale: scale.value },
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotateY: `${rotateValue}deg` },
      ],
      opacity: rotate.value < 0.5 ? 0 : 1,
      position: "absolute",
      width: "100%",
      height: "100%",
      backfaceVisibility: "hidden",
      shadowColor: isDark ? '#000' : '#888',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity,
      shadowRadius: 4,
      elevation: 5,
    };
  });

  // Style animé pour le bouton correct
  const correctButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: buttonScaleCorrect.value },
        { translateY: buttonBounceCorrect.value * -5 }
      ],
    };
  });

  // Style animé pour le bouton incorrect
  const incorrectButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: buttonScaleIncorrect.value },
        { translateY: buttonBounceIncorrect.value * -5 }
      ],
    };
  });

  // Retourner la carte
  const flipCard = () => {
    const newValue = flipped ? 0 : 1;
    rotate.value = withTiming(
      newValue,
      {
        duration: 400,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      },
      () => {
        runOnJS(setFlipped)(!flipped);
      }
    );
  };

  // Gestion de la réponse
  const handleResponse = async (correct: boolean) => {
    if (dueCards.length === 0) return;

    // Animation de pression du bouton
    if (correct) {
      buttonScaleCorrect.value = withSequence(
        withTiming(0.9, { duration: 100 }),
        withTiming(1, { duration: 200 })
      );
      buttonBounceCorrect.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0, { duration: 200, easing: Easing.out(Easing.elastic(1)) })
      );
    } else {
      buttonScaleIncorrect.value = withSequence(
        withTiming(0.9, { duration: 100 }),
        withTiming(1, { duration: 200 })
      );
      buttonBounceIncorrect.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0, { duration: 200, easing: Easing.out(Easing.elastic(1)) })
      );
    }

    // Marquer la direction de sortie de la carte
    setExitingCard(correct ? "correct" : "incorrect");

    // Animation de sortie de la carte
    translateX.value = withTiming(
      correct ? width : -width,
      { duration: 300, easing: Easing.bezier(0.25, 0.1, 0.25, 1) },
      async () => {
        const currentCard = dueCards[currentIndex];
        await reviewFlashcard(currentCard.id, correct);

        if (currentIndex < dueCards.length - 1) {
          runOnJS(setCurrentIndex)(currentIndex + 1);
        } else {
          runOnJS(setCompleted)(true);
        }

        // Réinitialiser les valeurs pour la prochaine carte
        translateX.value = 0;
        rotate.value = 0;
        runOnJS(setFlipped)(false);
        runOnJS(setExitingCard)(null);
      }
    );
  };

  if (completed) {
    return (
      <ThemedView style={styles.completedContainer}>
        <Animated.View
          style={styles.completedContent}
          entering={FadeInDown.duration(800).springify()}
        >
          <View style={styles.completedIconContainer}>
            <LinearGradient
              colors={isDark ? ["#0d566e", "#0a7ea4"] : ["#b3e5fc", "#4fc3f7"]}
              style={styles.completedIconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.completedIconInner}>
                <IconSymbol name="checkmark" size={40} color="#FFFFFF" />
              </View>
            </LinearGradient>
          </View>

          <ThemedText type="title" style={styles.completedTitle}>
            Bravo !
          </ThemedText>

          <ThemedText style={styles.completedText}>
            Vous avez terminé toutes vos révisions pour aujourd'hui. Revenez
            plus tard pour continuer votre progression !
          </ThemedText>

          <Animated.View entering={FadeIn.delay(300).duration(500)}>
            <Button
              variant="primary"
              leftIcon="house.fill"
              style={styles.homeButton}
              onPress={() => router.push("/")}
              fullWidth
            >
              Retour à l'accueil
            </Button>
          </Animated.View>

          <Animated.View entering={FadeIn.delay(400).duration(500)}>
            <Button
              variant="outline"
              leftIcon="plus.square.fill"
              style={styles.createButton}
              onPress={() => router.push("/flashcard/create")}
              fullWidth
            >
              Créer de nouvelles flashcards
            </Button>
          </Animated.View>
        </Animated.View>
      </ThemedView>
    );
  }

  if (dueCards.length === 0) {
    return (
      <ThemedView style={styles.noCardsContainer}>
        <Animated.View
          style={styles.noCardsContent}
          entering={FadeInDown.duration(800).springify()}
        >
          <View style={styles.noCardsIconContainer}>
            <LinearGradient
              colors={isDark ? ["#0d566e", "#0a7ea4"] : ["#b3e5fc", "#4fc3f7"]}
              style={styles.completedIconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.completedIconInner}>
                <IconSymbol name="sparkles" size={36} color="#FFFFFF" />
              </View>
            </LinearGradient>
          </View>

          <ThemedText type="title" style={styles.completedTitle}>
            Félicitations !
          </ThemedText>

          <ThemedText style={styles.completedText}>
            Vous n'avez aucune carte à réviser pour le moment. Vous pouvez créer
            de nouvelles flashcards ou attendre que vos cartes actuelles soient
            disponibles pour révision.
          </ThemedText>

          <Animated.View entering={FadeIn.delay(300).duration(500)}>
            <Button
              variant="primary"
              leftIcon="house.fill"
              style={styles.homeButton}
              onPress={() => router.push("/")}
              fullWidth
            >
              Retour à l'accueil
            </Button>
          </Animated.View>
        </Animated.View>
      </ThemedView>
    );
  }

  const currentCard = dueCards[currentIndex];
  const progress = (currentIndex + 1) / dueCards.length;

  return (
    <ThemedView style={styles.container}>
      <Animated.View
        style={styles.progressContainer}
        entering={FadeInDown.duration(400)}
      >
        <ThemedText style={styles.progressText}>
          Carte {currentIndex + 1} sur {dueCards.length}
        </ThemedText>
        <ProgressBar
          progress={progress}
          height={8}
          width="100%"
          useGradient
          style={styles.progressBar}
          animated
        />
      </Animated.View>

      <View style={styles.cardContainer}>
        <TouchableOpacity
          onPress={flipCard}
          activeOpacity={0.9}
          style={styles.cardTouchable}
        >
          <View style={styles.cardWrapper}>
            <Animated.View
              style={[styles.card, frontAnimatedStyle]}
              entering={exitingCard ? undefined : SlideInRight.duration(300)}
              exiting={
                exitingCard === "correct"
                  ? SlideOutRight.duration(300)
                  : SlideOutLeft.duration(300)
              }
            >
              <LinearGradient
                colors={
                  isDark ? ["#1d2529", "#293238"] : ["#ffffff", "#f5f5f5"]
                }
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Card.Content style={styles.cardContent}>
                  <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                    Question
                  </ThemedText>
                  <ThemedText style={styles.cardContentText}>
                    {currentCard.question}
                  </ThemedText>
                  <ThemedText style={styles.tapHint}>
                    Appuyez pour voir la réponse
                  </ThemedText>
                </Card.Content>
              </LinearGradient>
            </Animated.View>

            <Animated.View
              style={[styles.card, styles.cardBack, backAnimatedStyle]}
              entering={exitingCard ? undefined : SlideInLeft.duration(300)}
              exiting={
                exitingCard === "correct"
                  ? SlideOutRight.duration(300)
                  : SlideOutLeft.duration(300)
              }
            >
              <LinearGradient
                colors={
                  isDark ? ["#293238", "#1d2529"] : ["#f5f5f5", "#ffffff"]
                }
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Card.Content style={styles.cardContent}>
                  <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                    Réponse
                  </ThemedText>
                  <ThemedText style={styles.cardContentText}>
                    {currentCard.answer}
                  </ThemedText>
                  <ThemedText style={styles.tapHint}>
                    Appuyez pour voir la question
                  </ThemedText>
                </Card.Content>
              </LinearGradient>
            </Animated.View>
          </View>
        </TouchableOpacity>
      </View>

      <Animated.View
        style={styles.responseButtons}
        entering={SlideInDown.duration(500)}
      >
        <Animated.View style={incorrectButtonStyle}>
          <Button
            variant="danger"
            size="large"
            leftIcon="xmark"
            style={styles.incorrectButton}
            onPress={() => handleResponse(false)}
          >
            Incorrect
          </Button>
        </Animated.View>

        <Animated.View style={correctButtonStyle}>
          <Button
            variant="primary"
            size="large"
            leftIcon="checkmark"
            style={styles.correctButton}
            onPress={() => handleResponse(true)}
          >
            Correct
          </Button>
        </Animated.View>
      </Animated.View>

      <Animated.View
        style={styles.boxInfoContainer}
        entering={FadeIn.delay(300).duration(500)}
      >
        <ThemedView style={styles.boxInfo}>
          <ThemedText style={styles.boxInfoText}>
            Boîte actuelle: {currentCard.boxLevel}
          </ThemedText>
          <View
            style={[
              styles.boxIndicator,
              {
                backgroundColor:
                  colors.boxColors[
                  currentCard.boxLevel as keyof typeof colors.boxColors
                  ],
              },
            ]}
          />
        </ThemedView>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    marginBottom: 8,
    fontSize: 14,
  },
  progressBar: {
    borderRadius: 6,
  },
  cardContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  cardTouchable: {
    width: width - 40,
    height: CARD_HEIGHT,
  },
  cardWrapper: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  card: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardGradient: {
    width: "100%",
    height: "100%",
  },
  cardBack: {
    backgroundColor: "#f8f8f8",
  },
  cardContent: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
  },
  cardTitle: {
    marginBottom: 16,
    fontSize: 20,
    textAlign: "center",
  },
  cardContentText: {
    flex: 1,
    fontSize: 18,
    textAlign: "center",
    paddingVertical: 10,
  },
  tapHint: {
    textAlign: "center",
    opacity: 0.6,
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 16,
  },
  responseButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  incorrectButton: {
    width: (width - 50) / 2,
  },
  correctButton: {
    width: (width - 50) / 2,
  },
  boxInfoContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  boxInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  boxInfoText: {
    opacity: 0.7,
    fontSize: 14,
    marginRight: 8,
  },
  boxIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  completedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  completedContent: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  completedIconContainer: {
    marginBottom: 24,
  },
  completedIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  completedIconInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  completedTitle: {
    marginBottom: 12,
    textAlign: "center",
  },
  completedText: {
    textAlign: "center",
    marginBottom: 32,
    fontSize: 16,
    opacity: 0.8,
    lineHeight: 24,
  },
  homeButton: {
    marginBottom: 16,
  },
  createButton: {
    marginBottom: 0,
  },
  noCardsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noCardsContent: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  noCardsIconContainer: {
    marginBottom: 24,
  },
});
