import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
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
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");
const CARD_HEIGHT = height * 0.48;

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

  // Animation values
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const elevation = useSharedValue(isDark ? 5 : 3);
  const progress = useSharedValue(0);

  // Button animation values
  const buttonScaleCorrect = useSharedValue(1);
  const buttonScaleIncorrect = useSharedValue(1);
  const buttonOpacity = useSharedValue(0);
  const cardShadow = useSharedValue(0.1);

  useEffect(() => {
    const cards = getDueFlashcards(flashcards);
    setDueCards(cards);

    if (cards.length === 0) {
      setCompleted(true);
    } else {
      // Entrance animation for first card
      scale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withTiming(1, { duration: 500, easing: Easing.elastic(1.2) })
      );

      // Fade in buttons
      buttonOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));

      // Update progress
      progress.value = withTiming(1 / cards.length, { duration: 800 });
    }
  }, [flashcards]);

  // Enhanced front card animation
  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(rotate.value, [0, 1], [0, 180]);
    const zIndex = rotate.value > 0.5 ? -1 : 1;
    const shadowOpacity = interpolate(
      rotate.value,
      [0, 0.5],
      [cardShadow.value, 0],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }
    );

    return {
      transform: [
        { perspective: 1500 },
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
      zIndex,

      // Enhanced shadows with animated values
      shadowColor: isDark ? "#000" : "#888",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity,
      shadowRadius: elevation.value,
      elevation: elevation.value,
    };
  });

  // Enhanced back card animation
  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(rotate.value, [0, 1], [180, 360]);
    const zIndex = rotate.value < 0.5 ? -1 : 1;
    const shadowOpacity = interpolate(
      rotate.value,
      [0.5, 1],
      [0, cardShadow.value],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }
    );

    return {
      transform: [
        { perspective: 1500 },
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
      zIndex,

      // Enhanced shadows with animated values
      shadowColor: isDark ? "#000" : "#888",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity,
      shadowRadius: elevation.value,
      elevation: elevation.value,
    };
  });

  // Button animations
  const correctButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScaleCorrect.value }],
    opacity: buttonOpacity.value,
  }));

  const incorrectButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScaleIncorrect.value }],
    opacity: buttonOpacity.value,
  }));

  // Progress animation
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  // Enhanced card flip with better 3D feel
  const flipCard = () => {
    const newValue = flipped ? 0 : 1;

    // Increase elevation during flip for better 3D effect
    elevation.value = withSequence(
      withTiming(isDark ? 10 : 8, { duration: 150 }),
      withTiming(isDark ? 5 : 3, {
        duration: 150,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
      })
    );

    // Increase shadow during flip
    cardShadow.value = withSequence(
      withTiming(0.25, { duration: 150 }),
      withTiming(0.1, { duration: 150 })
    );

    // Smoother rotation animation
    rotate.value = withTiming(newValue, {
      duration: 600,
      easing: Easing.bezier(0.25, 1, 0.5, 1),
    });

    setFlipped(!flipped);
  };

  // Enhanced response handling with better animations
  const handleResponse = async (correct: boolean) => {
    if (dueCards.length === 0) return;

    // Enhanced button animation
    if (correct) {
      buttonScaleCorrect.value = withSequence(
        withTiming(0.9, { duration: 100 }),
        withTiming(1.1, { duration: 150 }),
        withTiming(1, { duration: 200 })
      );
    } else {
      buttonScaleIncorrect.value = withSequence(
        withTiming(0.9, { duration: 100 }),
        withTiming(1.1, { duration: 150 }),
        withTiming(1, { duration: 200 })
      );
    }

    // Hide buttons during card transition
    buttonOpacity.value = withTiming(0, { duration: 200 });

    // Mark exit direction
    setExitingCard(correct ? "correct" : "incorrect");

    // Add small delay to see button animation
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Enhanced card exit animation with physics
    translateX.value = withTiming(
      correct ? width * 1.5 : -width * 1.5,
      {
        duration: 400,
        easing: Easing.bezier(0.2, 1, 0.3, 1),
      },
      async () => {
        const currentCard = dueCards[currentIndex];
        await reviewFlashcard(currentCard.id, correct);

        if (currentIndex < dueCards.length - 1) {
          runOnJS(setCurrentIndex)(currentIndex + 1);

          // Update progress
          progress.value = withTiming((currentIndex + 2) / dueCards.length, {
            duration: 600,
          });

          // Show buttons for next card
          buttonOpacity.value = withDelay(
            400,
            withTiming(1, { duration: 300 })
          );
        } else {
          runOnJS(setCompleted)(true);
        }

        // Reset animation values for next card
        translateX.value = 0;
        translateY.value = 0;
        rotate.value = 0;
        scale.value = withSequence(
          withTiming(0.8, { duration: 0 }),
          withSpring(1, { damping: 14, stiffness: 100 })
        );
        runOnJS(setFlipped)(false);
        runOnJS(setExitingCard)(null);
      }
    );

    // Add slight rotation during slide
    translateY.value = withTiming(correct ? -50 : 50, { duration: 400 });
  };

  // Completion screen
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

  // Empty state
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
  const progressPercentage = (currentIndex + 1) / dueCards.length;

  return (
    <ThemedView style={styles.container}>
      {/* Enhanced progress indicator */}
      <Animated.View
        style={styles.progressContainer}
        entering={FadeIn.duration(400)}
      >
        <View style={styles.progressHeader}>
          <ThemedText style={styles.progressText}>
            Carte {currentIndex + 1} sur {dueCards.length}
          </ThemedText>
          <ThemedText
            style={[
              styles.boxText,
              {
                backgroundColor:
                  colors.boxColors[
                    currentCard.boxLevel as keyof typeof colors.boxColors
                  ],
              },
            ]}
          >
            Boîte {currentCard.boxLevel}
          </ThemedText>
        </View>

        <View style={styles.progressBarContainer}>
          <ProgressBar
            progress={progressPercentage}
            height={6}
            width="100%"
            useGradient
            style={styles.progressBar}
            animated
          />
        </View>
      </Animated.View>

      {/* Card container with 3D effect */}
      <View style={styles.cardContainer}>
        <TouchableOpacity
          onPress={flipCard}
          activeOpacity={0.97}
          style={styles.cardTouchable}
        >
          <View style={styles.cardWrapper}>
            {/* Front card face */}
            <Animated.View style={[styles.card, frontAnimatedStyle]}>
              <LinearGradient
                colors={
                  isDark ? ["#1d2529", "#293238"] : ["#ffffff", "#f5f5f5"]
                }
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardIconContainer}>
                    <IconSymbol
                      name="questionmark.circle"
                      size={28}
                      color={colors.primary}
                    />
                  </View>

                  <ThemedText type="subtitle" style={styles.cardTitle}>
                    Question
                  </ThemedText>

                  <View style={styles.cardTextContainer}>
                    <ThemedText style={styles.cardContentText}>
                      {currentCard.question}
                    </ThemedText>
                  </View>

                  <View style={styles.tapHintContainer}>
                    <IconSymbol
                      name="hand.tap"
                      size={16}
                      color={colors.textTertiary}
                    />
                    <ThemedText style={styles.tapHint}>
                      Appuyez pour voir la réponse
                    </ThemedText>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>

            {/* Back card face */}
            <Animated.View
              style={[styles.card, styles.cardBack, backAnimatedStyle]}
            >
              <LinearGradient
                colors={
                  isDark ? ["#293238", "#1d2529"] : ["#f5f5f5", "#ffffff"]
                }
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.cardContent}>
                  <View
                    style={[
                      styles.cardIconContainer,
                      {
                        backgroundColor: isDark
                          ? "rgba(241, 124, 213, 0.15)"
                          : "rgba(241, 124, 213, 0.1)",
                      },
                    ]}
                  >
                    <IconSymbol
                      name="lightbulb.fill"
                      size={28}
                      color={colors.primary}
                    />
                  </View>

                  <ThemedText type="subtitle" style={styles.cardTitle}>
                    Réponse
                  </ThemedText>

                  <View style={styles.cardTextContainer}>
                    <ThemedText style={styles.cardContentText}>
                      {currentCard.answer}
                    </ThemedText>
                  </View>

                  <View style={styles.tapHintContainer}>
                    <IconSymbol
                      name="hand.tap"
                      size={16}
                      color={colors.textTertiary}
                    />
                    <ThemedText style={styles.tapHint}>
                      Appuyez pour revoir la question
                    </ThemedText>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Enhanced response buttons */}
      <View style={styles.responseButtonsContainer}>
        <Animated.View
          style={[styles.responseButtons, { opacity: buttonOpacity.value }]}
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
          style={styles.reviewTip}
          entering={FadeIn.delay(600).duration(500)}
        >
          <ThemedText style={styles.reviewTipText}>
            {flipped
              ? "Avez-vous su répondre correctement ?"
              : "Essayez de répondre mentalement avant de retourner la carte"}
          </ThemedText>
        </Animated.View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  progressText: {
    fontSize: 15,
    fontWeight: "500",
  },
  boxText: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "600",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  progressBarContainer: {
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBar: {
    borderRadius: 6,
  },
  cardContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  cardTouchable: {
    width: width - 40,
    height: CARD_HEIGHT,
    borderRadius: 20,
  },
  cardWrapper: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  card: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    overflow: "hidden",
  },
  cardGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  cardBack: {
    backgroundColor: "#f8f8f8",
  },
  cardContent: {
    flex: 1,
    padding: 24,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  cardIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0, 153, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 24,
    fontSize: 22,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  cardTextContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
  },
  cardContentText: {
    fontSize: 18,
    textAlign: "center",
    lineHeight: 28,
  },
  tapHintContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 16,
    paddingBottom: 8,
  },
  tapHint: {
    textAlign: "center",
    opacity: 0.6,
    fontSize: 14,
    fontStyle: "italic",
    marginLeft: 6,
  },
  responseButtonsContainer: {
    marginBottom: 20,
  },
  responseButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  incorrectButton: {
    width: (width - 50) / 2,
  },
  correctButton: {
    width: (width - 50) / 2,
  },
  reviewTip: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  reviewTipText: {
    fontSize: 14,
    opacity: 0.7,
    fontStyle: "italic",
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
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
  },
  completedIconInner: {
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  completedTitle: {
    marginBottom: 16,
    textAlign: "center",
    fontSize: 28,
    letterSpacing: -0.5,
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
