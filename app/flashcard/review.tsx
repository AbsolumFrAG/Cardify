import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useFlashcards } from "@/context/FlashcardContext";
import { getDueFlashcards } from "@/services/leitnerSystem";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function ReviewScreen() {
  const { flashcards, reviewFlashcard } = useFlashcards();
  const [dueCards, setDueCards] = useState<Array<any>>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    const cards = getDueFlashcards(flashcards);
    setDueCards(cards);

    if (cards.length === 0) {
      setCompleted(true);
    }
  }, [flashcards]);

  const flipCard = () => {
    setFlipped(!flipped);
    Animated.spring(animation, {
      toValue: flipped ? 0 : 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const frontInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  const handleResponse = async (correct: boolean) => {
    if (dueCards.length === 0) return;

    const currentCard = dueCards[currentIndex];
    await reviewFlashcard(currentCard.id, correct);

    setFlipped(false);
    animation.setValue(0);

    if (currentIndex < dueCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCompleted(true);
    }
  };

  const restart = () => {
    const cards = getDueFlashcards(flashcards);
    setDueCards(cards);
    setCurrentIndex(0);
    setCompleted(false);
    setFlipped(false);
    animation.setValue(0);
  };

  if (completed) {
    return (
      <ThemedView style={styles.completedContainer}>
        <IconSymbol name="checkmark.circle.fill" size={80} color="#0a7ea4" />
        <ThemedText type="title" style={styles.completedTitle}>
          Bravo !
        </ThemedText>
        <ThemedText style={styles.completedText}>
          Vous avez terminé toutes vos révisions pour aujourd'hui.
        </ThemedText>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.push("/")}
        >
          <ThemedText style={styles.homeButtonText}>
            Retour à l'accueil
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push("/flashcard/create")}
        >
          <ThemedText style={styles.createButtonText}>
            Créer de nouvelles flashcards
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  if (dueCards.length === 0) {
    return (
      <ThemedView style={styles.noCardsContainer}>
        <IconSymbol name="checkmark.circle.fill" size={80} color="#0a7ea4" />
        <ThemedText type="title" style={styles.noCardsTitle}>
          Félicitations !
        </ThemedText>
        <ThemedText style={styles.noCardsText}>
          Vous n'avez aucun carte à réviser pour le moment.
        </ThemedText>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.push("/")}
        >
          <ThemedText style={styles.homeButtonText}>
            Retour à l'accueil
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const currentCard = dueCards[currentIndex];

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.progressContainer}>
        <ThemedText>
          Carte {currentIndex + 1} sur {dueCards.length}
        </ThemedText>
        <ThemedView style={styles.progressBar}>
          <ThemedView
            style={[
              styles.progressFill,
              { width: `${((currentIndex + 1) / dueCards.length) * 100}%` },
            ]}
          />
        </ThemedView>
      </ThemedView>

      <View style={styles.cardContainer}>
        <TouchableOpacity onPress={flipCard} activeOpacity={0.9}>
          <Animated.View style={[styles.card, frontAnimatedStyle]}>
            <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
              Question
            </ThemedText>
            <ThemedText style={styles.cardContent}>
              {currentCard.question}
            </ThemedText>
            <ThemedText style={styles.tapHint}>
              Appuyez pour voir la réponse
            </ThemedText>
          </Animated.View>

          <Animated.View
            style={[styles.card, styles.cardBack, backAnimatedStyle]}
          >
            <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
              Réponse
            </ThemedText>
            <ThemedText style={styles.cardContent}>
              {currentCard.answer}
            </ThemedText>
            <ThemedText style={styles.tapHint}>
              Appuyez pour voir la question
            </ThemedText>
          </Animated.View>
        </TouchableOpacity>
      </View>

      <ThemedView style={styles.responseButtons}>
        <TouchableOpacity
          style={[styles.responseButton, styles.incorrectButton]}
          onPress={() => handleResponse(false)}
        >
          <IconSymbol name="xmark" size={24} color="white" />
          <ThemedText style={styles.responseButtonText}>Incorrect</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.responseButton, styles.correctButton]}
          onPress={() => handleResponse(true)}
        >
          <IconSymbol name="checkmark" size={24} color="white" />
          <ThemedText style={styles.responseButtonText}>Correct</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedText style={styles.boxInfo}>
        Boîte actuelle: {currentCard.boxLevel}
      </ThemedText>
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
  progressBar: {
    height: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    marginTop: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#0a7ea4",
    borderRadius: 5,
  },
  cardContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  card: {
    width: width - 40,
    height: height * 0.45,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    backfaceVisibility: "hidden",
    justifyContent: "space-between",
  },
  cardBack: {
    position: "absolute",
    top: 0,
    backgroundColor: "#f8f8f8",
  },
  cardTitle: {
    marginBottom: 10,
    fontSize: 20,
    textAlign: "center",
  },
  cardContent: {
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
  },
  responseButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  responseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
    width: "45%",
  },
  incorrectButton: {
    backgroundColor: "#ff5252",
  },
  correctButton: {
    backgroundColor: "#4caf50",
  },
  responseButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 8,
  },
  boxInfo: {
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 10,
  },
  completedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  completedTitle: {
    marginTop: 20,
    marginBottom: 10,
  },
  completedText: {
    textAlign: "center",
    marginBottom: 30,
    fontSize: 16,
  },
  homeButton: {
    backgroundColor: "#0a7ea4",
    padding: 15,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
    marginBottom: 15,
  },
  homeButtonText: {
    color: "white",
    fontWeight: "600",
  },
  createButton: {
    borderColor: "#0a7ea4",
    borderWidth: 1,
    padding: 15,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  createButtonText: {
    color: "#0a7ea4",
    fontWeight: "600",
  },
  noCardsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noCardsTitle: {
    marginTop: 20,
    marginBottom: 10,
  },
  noCardsText: {
    textAlign: "center",
    marginBottom: 30,
    fontSize: 16,
  },
});
