import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useFlashcards } from "@/context/FlashcardContext";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function CreateFlashcardScreen() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { addFlashcard } = useFlashcards();

  const handleCreate = async () => {
    if (!question.trim() || !answer.trim()) {
      Alert.alert("Erreur", "Veuillez remplir la question et la réponse.");
      return;
    }

    try {
      setIsLoading(true);
      await addFlashcard(question, answer);
      Alert.alert("Succès", "Flashcard créée avec succès!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Erreur lors de la création de la flashcard:", error);
      Alert.alert(
        "Erreur",
        "Impossible de créer la flashcard. Veuillez réessayer."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.formContainer}>
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
            <IconSymbol name="lightbulb.fill" size={20} color="#FFC107" />
            <ThemedText style={styles.tipsText}>
              Conseil: Créez des questions précises et des réponses concises
              pour une meilleure mémorisation.
            </ThemedText>
          </ThemedView>

          <ThemedText style={styles.infoText}>
            Cette flashcard sera placée dans la Boîte 1 et programmée pour
            révision aujourd'hui.
          </ThemedText>

          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreate}
            disabled={isLoading}
          >
            <ThemedText style={styles.createButtonText}>
              {isLoading ? "Création..." : "Créer la flashcard"}
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
    backgroundColor: "#FFF9C4",
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
  infoText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    fontStyle: "italic",
  },
  createButton: {
    backgroundColor: "#0a7ea4",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  createButtonText: {
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
});
