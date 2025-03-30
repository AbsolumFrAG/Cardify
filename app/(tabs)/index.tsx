import { FlashcardStats } from "@/components/FlashcardStats";
import { HeroCard } from "@/components/HeroCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useFlashcards } from "@/context/FlashcardContext";
import { getDueFlashcards } from "@/services/leitnerSystem";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";

export default function HomeScreen() {
  const { flashcards } = useFlashcards();
  const [dueCards, setDueCards] = useState<number>(0);

  useEffect(() => {
    const dueFlashcards = getDueFlashcards(flashcards);
    setDueCards(dueFlashcards.length);
  }, [flashcards]);

  const handleCapture = () => {
    router.push("/capture");
  };

  const handleStartReview = () => {
    router.push("/flashcard/review");
  };

  const handleSearch = () => {
    router.push("/search");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <ThemedView style={styles.header}>
        <ThemedText type="title">Cardify</ThemedText>
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <IconSymbol name="magnifyingglass" size={24} color="#0a7ea4" />
        </TouchableOpacity>
      </ThemedView>

      <HeroCard
        title="Capture des notes"
        description="Prenez une photo de vos notes pour créer des flashcards"
        actionLabel="Capturer"
        onAction={handleCapture}
        imageSource={require("@/assets/images/camera.png")}
      />

      <ThemedView style={styles.statsContainer}>
        <ThemedText type="subtitle">Votre progression</ThemedText>
        <FlashcardStats flashcards={flashcards} />
      </ThemedView>

      {dueCards > 0 && (
        <ThemedView style={styles.reviewCard}>
          <ThemedView style={styles.reviewCardContent}>
            <ThemedText type="defaultSemiBold">
              {dueCards} cartes à réviser aujourd'hui
            </ThemedText>
            <ThemedText>
              Continuez votre routine de révision pour ne rien oublier !
            </ThemedText>
          </ThemedView>
          <TouchableOpacity
            style={styles.reviewButton}
            onPress={handleStartReview}
          >
            <ThemedText style={styles.reviewButtonText}>
              Réviser maintenant
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}

      <ThemedView style={styles.quickActions}>
        <ThemedText type="subtitle">Actions rapides</ThemedText>
        <ThemedView style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/flashcards")}
          >
            <IconSymbol name="square.stack.fill" size={32} color="#0a7ea4" />
            <ThemedText style={styles.actionText}>Mes Flashcards</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/flashcard/create")}
          >
            <IconSymbol name="plus.square.fill" size={32} color="#0a7ea4" />
            <ThemedText style={styles.actionText}>Créer une carte</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/contents")}
          >
            <IconSymbol name="doc.text.fill" size={32} color="#0a7ea4" />
            <ThemedText style={styles.actionText}>Mes cours</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/quiz")}
          >
            <IconSymbol
              name="questionmark.square.fill"
              size={32}
              color="#0a7ea4"
            />
            <ThemedText style={styles.actionText}>Quiz IA</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  searchButton: {
    padding: 8,
  },
  statsContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  reviewCard: {
    backgroundColor: "#e1f5fe",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reviewCardContent: {
    marginBottom: 12,
  },
  reviewButton: {
    backgroundColor: "#0a7ea4",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  reviewButtonText: {
    color: "white",
    fontWeight: "600",
  },
  quickActions: {
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 12,
  },
  actionButton: {
    width: "48%",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  actionText: {
    marginTop: 8,
    textAlign: "center",
  },
});
