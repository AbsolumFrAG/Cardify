import { generateAnswerWithRAG } from "@/api/pinecone";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useContent } from "@/context/ContentContext";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function QuizScreen() {
  const { contents } = useContent();
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>("");
  const [quizMode, setQuizMode] = useState<"ask" | "quiz">("ask");
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    "Définissez le concept principal abordé dans le cours.",
    "Expliquez les relations entre les termes clés du cours.",
    "Quelles sont les applications pratiques de cette théorie ?",
    "Comparez et contrastez les différentes méthodes présentées.",
    "Résumez les points principaux de ce chapitre.",
  ]);
  const [customQuestion, setCustomQuestion] = useState<string>("");

  const hasContent = contents.length > 0;

  const handleGenerateQuestion = async () => {
    if (!hasContent) {
      Alert.alert(
        "Aucun contenu disponible",
        "Vous devez d'abord capturer des notes pour pouvoir générer des questions de quiz."
      );
      return;
    }

    try {
      setIsGenerating(true);
      setUserAnswer("");
      setAnswer("");
      setFeedback("");

      // Utiliser une des questions suggérées au hasard
      const randomIndex = Math.floor(Math.random() * suggestedQuestions.length);
      const randomQuestion = suggestedQuestions[randomIndex];
      setCurrentQuestion(randomQuestion);

      // Générer la réponse en arrière-plan
      const generatedAnswer = await generateAnswerWithRAG(randomQuestion);
      setAnswer(generatedAnswer);
    } catch (error) {
      console.error("Erreur lors de la génération de question:", error);
      Alert.alert("Erreur", "Impossible de générer une question");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!customQuestion.trim()) {
      Alert.alert("Erreur", "Veuillez entrer une question");
      return;
    }

    if (!hasContent) {
      Alert.alert(
        "Aucun contenu disponible",
        "Vous devez d'abord capturer des notes pour pouvoir poser des questions."
      );
      return;
    }

    try {
      setIsGenerating(true);
      setCurrentQuestion(customQuestion);
      setUserAnswer("");
      setAnswer("");
      setFeedback("");

      // Générer la réponse
      const generatedAnswer = await generateAnswerWithRAG(customQuestion);
      setAnswer(generatedAnswer);
    } catch (error) {
      console.error("Erreur lors de la génération de réponse:", error);
      Alert.alert("Erreur", "Impossible de générer une réponse");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCheckAnswer = async () => {
    if (!userAnswer.trim()) {
      Alert.alert("Erreur", "Veuillez entrer votre réponse");
      return;
    }

    try {
      setIsChecking(true);

      // Simuler un délai pour donner l'impression que l'IA évalue
      setTimeout(() => {
        // Comparer la réponse de l'utilisateur avec la réponse générée
        const userKeywords = extractKeywords(userAnswer);
        const answerKeywords = extractKeywords(answer);

        const commonKeywords = userKeywords.filter((keyword) =>
          answerKeywords.includes(keyword)
        );

        const score = commonKeywords.length / answerKeywords.length;

        let feedbackText = "";
        if (score > 0.7) {
          feedbackText =
            "Excellente réponse ! Vous avez couvert tous les points importants.";
        } else if (score > 0.4) {
          feedbackText =
            "Bonne réponse, mais il manque quelques éléments importants.";
        } else {
          feedbackText =
            "Votre réponse pourrait être améliorée. Voici les éléments clés à considérer:";
        }

        setFeedback(`${feedbackText}\n\nRéponse suggérée:\n${answer}`);
        setIsChecking(false);
      }, 1500);
    } catch (error) {
      console.error("Erreur lors de la vérification de la réponse:", error);
      setIsChecking(false);
    }
  };

  const extractKeywords = (text: string): string[] => {
    // Version simplifiée: extraction des mots de plus de 4 lettres
    const words = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
    return [...new Set(words)]; // Enlever les doublons
  };

  const handleReset = () => {
    setCurrentQuestion("");
    setUserAnswer("");
    setAnswer("");
    setFeedback("");
    setCustomQuestion("");
  };

  const renderAskMode = () => (
    <ThemedView style={styles.askContainer}>
      <ThemedText style={styles.askLabel}>
        Posez une question sur vos notes
      </ThemedText>
      <TextInput
        style={styles.askInput}
        placeholder="Entrez votre question..."
        value={customQuestion}
        onChangeText={setCustomQuestion}
        multiline
      />
      <TouchableOpacity
        style={styles.askButton}
        onPress={handleAskQuestion}
        disabled={isGenerating || !customQuestion.trim()}
      >
        {isGenerating ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <ThemedText style={styles.askButtonText}>
            Poser la question
          </ThemedText>
        )}
      </TouchableOpacity>
    </ThemedView>
  );

  const renderQuizMode = () => (
    <ThemedView style={styles.quizContainer}>
      <TouchableOpacity
        style={styles.generateButton}
        onPress={handleGenerateQuestion}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <>
            <IconSymbol name="lightbulb.fill" size={20} color="white" />
            <ThemedText style={styles.generateButtonText}>
              Générer une question
            </ThemedText>
          </>
        )}
      </TouchableOpacity>

      <ThemedText style={styles.orText}>- ou -</ThemedText>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.suggestedQuestionsContainer}
      >
        {suggestedQuestions.map((question, index) => (
          <TouchableOpacity
            key={index}
            style={styles.questionChip}
            onPress={() => {
              setCurrentQuestion(question);
              setUserAnswer("");
              setAnswer("");
              setFeedback("");

              // Générer la réponse en arrière-plan
              setIsGenerating(true);
              generateAnswerWithRAG(question)
                .then((generatedAnswer) => {
                  setAnswer(generatedAnswer);
                })
                .catch((error) => {
                  console.error("Erreur:", error);
                })
                .finally(() => {
                  setIsGenerating(false);
                });
            }}
          >
            <ThemedText style={styles.questionChipText} numberOfLines={1}>
              {question.length > 30
                ? question.substring(0, 30) + "..."
                : question}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ThemedView>
  );

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            quizMode === "quiz" && styles.modeButtonActive,
          ]}
          onPress={() => setQuizMode("quiz")}
        >
          <ThemedText
            style={[
              styles.modeButtonText,
              quizMode === "quiz" && styles.modeButtonTextActive,
            ]}
          >
            Mode Quiz
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeButton,
            quizMode === "ask" && styles.modeButtonActive,
          ]}
          onPress={() => setQuizMode("ask")}
        >
          <ThemedText
            style={[
              styles.modeButtonText,
              quizMode === "ask" && styles.modeButtonTextActive,
            ]}
          >
            Poser une question
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {!hasContent && (
        <ThemedView style={styles.noContentContainer}>
          <IconSymbol
            name="exclamationmark.triangle"
            size={50}
            color="#FFC107"
          />
          <ThemedText style={styles.noContentText}>
            Vous n'avez pas encore de contenu pour pouvoir utiliser cette
            fonctionnalité. Commencez par capturer des notes.
          </ThemedText>
        </ThemedView>
      )}

      {quizMode === "quiz" ? renderQuizMode() : renderAskMode()}

      {currentQuestion ? (
        <ThemedView style={styles.questionContainer}>
          <ThemedText style={styles.questionLabel}>Question:</ThemedText>
          <ThemedText style={styles.questionText}>{currentQuestion}</ThemedText>

          {quizMode === "quiz" && (
            <>
              <ThemedText style={styles.answerLabel}>Votre réponse:</ThemedText>
              <TextInput
                style={styles.answerInput}
                placeholder="Entrez votre réponse..."
                value={userAnswer}
                onChangeText={setUserAnswer}
                multiline
                textAlignVertical="top"
              />

              {!feedback ? (
                <TouchableOpacity
                  style={styles.checkButton}
                  onPress={handleCheckAnswer}
                  disabled={isChecking || !userAnswer.trim()}
                >
                  {isChecking ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <ThemedText style={styles.checkButtonText}>
                      Vérifier ma réponse
                    </ThemedText>
                  )}
                </TouchableOpacity>
              ) : (
                <ThemedView style={styles.feedbackContainer}>
                  <ThemedText style={styles.feedbackLabel}>
                    Feedback:
                  </ThemedText>
                  <ThemedText style={styles.feedbackText}>
                    {feedback}
                  </ThemedText>
                </ThemedView>
              )}
            </>
          )}

          {quizMode === "ask" && !isGenerating && answer && (
            <ThemedView style={styles.aiResponseContainer}>
              <ThemedText style={styles.aiResponseLabel}>Réponse:</ThemedText>
              <ThemedText style={styles.aiResponseText}>{answer}</ThemedText>
            </ThemedView>
          )}

          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <ThemedText style={styles.resetButtonText}>
              Nouvelle question
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    marginBottom: 20,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#e0e0e0",
  },
  modeButtonActive: {
    borderBottomColor: "#0a7ea4",
  },
  modeButtonText: {
    fontSize: 16,
    color: "#666",
  },
  modeButtonTextActive: {
    color: "#0a7ea4",
    fontWeight: "600",
  },
  noContentContainer: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff3e0",
    borderRadius: 12,
    marginBottom: 20,
  },
  noContentText: {
    textAlign: "center",
    marginTop: 10,
  },
  quizContainer: {
    marginBottom: 20,
  },
  generateButton: {
    backgroundColor: "#0a7ea4",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
  },
  generateButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  orText: {
    textAlign: "center",
    marginVertical: 12,
    color: "#666",
  },
  suggestedQuestionsContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  questionChip: {
    backgroundColor: "#e1f5fe",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxWidth: 200,
  },
  questionChipText: {
    color: "#0a7ea4",
  },
  askContainer: {
    marginBottom: 20,
  },
  askLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  askInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 12,
  },
  askButton: {
    backgroundColor: "#0a7ea4",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  askButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  questionContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  questionLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  questionText: {
    fontSize: 16,
    marginBottom: 20,
  },
  answerLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  answerInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    minHeight: 120,
    marginBottom: 12,
  },
  checkButton: {
    backgroundColor: "#4caf50",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  checkButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  feedbackContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  feedbackLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 16,
    lineHeight: 24,
  },
  aiResponseContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  aiResponseLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  aiResponseText: {
    fontSize: 16,
    lineHeight: 24,
  },
  resetButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  resetButtonText: {
    color: "#666",
    fontSize: 16,
  },
});
