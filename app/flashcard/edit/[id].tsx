import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useFlashcards } from "@/context/FlashcardContext";
import { formatDateToString } from "@/utils/dateUtils";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function EditFlashcardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getFlashcardById, updateFlashcard } = useFlashcards();

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCard, setLoadingCard] = useState(true);
  const [flashcard, setFlashcard] = useState<any>(null);

  useEffect(() => {
    if (id) {
      const card = getFlashcardById(id);
      if (card) {
        setFlashcard(card);
        setQuestion(card.question);
        setAnswer(card.answer);
      } else {
        Alert.alert("Erreur", "Flashcard introuvable");
        router.back();
      }
      setLoadingCard(false);
    }
  }, [id]);

  const handleUpdate = async () => {
    if (!question.trim() || !answer.trim()) {
      Alert.alert("Erreur", "Veuillez remplir la question et la réponse.");
      return;
    }

    if (!flashcard) {
      Alert.alert("Erreur", "Flashcard introuvable");
      return;
    }

    try {
      setIsLoading(true);
      await updateFlashcard({
        ...flashcard,
        question,
        answer,
      });
      Alert.alert("Succès", "Flashcard mise à jour avec succès!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la flashcard:", error);
      Alert.alert(
        "Erreur",
        "Impossible de mettre à jour la flashcard. Veuillez réessayer."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingCard) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <ThemedText style={styles.loadingText}>
          Chargement de la flashcard...
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.formContainer}>
          <ThemedView style={styles.cardInfo}>
            <ThemedView style={styles.infoItem}>
              <ThemedText style={styles.infoLabel}>Boîte:</ThemedText>
              <ThemedText style={styles.infoValue}>
                {flashcard?.boxLevel}
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.infoItem}>
              <ThemedText style={styles.infoLabel}>Créée le:</ThemedText>
              <ThemedText style={styles.infoValue}>
                {flashcard?.createdAt
                  ? formatDateToString(new Date(flashcard.createdAt))
                  : ""}
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.infoItem}>
              <ThemedText style={styles.infoLabel}>
                Prochaine révision:
              </ThemedText>
              <ThemedText style={styles.infoValue}>
                {flashcard?.nextReviewDate
                  ? formatDateToString(new Date(flashcard.nextReviewDate))
                  : ""}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.inputContainer}>
            <ThemedText style={styles.label}>Question</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Entrez la question..."
              value={question}
              onChangeText={setQuestion}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />
          </ThemedView>

          <ThemedView style={styles.inputContainer}>
            <ThemedText style={styles.label}>Réponse</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Entrez la réponse..."
              value={answer}
              onChangeText={setAnswer}
              multiline
              maxLength={1000}
              textAlignVertical="top"
            />
          </ThemedView>

          <ThemedView style={styles.tips}>
            <IconSymbol name="info.circle.fill" size={20} color="#0a7ea4" />
            <ThemedText style={styles.tipsText}>
              Note: La modification ne changera pas le niveau de la boîte ou la
              date de révision.
            </ThemedText>
          </ThemedView>

          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleUpdate}
            disabled={isLoading}
          >
            <ThemedText style={styles.updateButtonText}>
              {isLoading ? "Mise à jour..." : "Mettre à jour la flashcard"}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={isLoading}
          >
            <ThemedText style={styles.cancelButtonText}>Annuler</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  cardInfo: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: {
    fontWeight: "600",
    color: "#666",
  },
  infoValue: {
    color: "#333",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    minHeight: 50,
  },
  textArea: {
    minHeight: 150,
    textAlignVertical: "top",
  },
  tips: {
    flexDirection: "row",
    backgroundColor: "#e1f5fe",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    alignItems: "flex-start",
  },
  tipsText: {
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
  },
  updateButton: {
    backgroundColor: "#0a7ea4",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  updateButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
  },
});
