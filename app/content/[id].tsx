import { generateFlashcards } from "@/api/openai";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useContent } from "@/context/ContentContext";
import { useFlashcards } from "@/context/FlashcardContext";
import { formatDateToString, formatRelativeDate } from "@/utils/dateUtils";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Share,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

export default function ContentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getContentById, processContentForRAG } = useContent();
  const { flashcards, addFlashcard } = useFlashcards();

  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generatingCards, setGeneratingCards] = useState(false);
  const [indexingContent, setIndexingContent] = useState(false);
  const [contentFlashcards, setContentFlashcards] = useState<any[]>([]);

  useEffect(() => {
    loadContent();
  }, [id]);

  useEffect(() => {
    if (content && flashcards) {
      // Filtrer les flashcards associées à ce contenu
      const relatedFlashcards = flashcards.filter(
        (card) => card.sourceContentId === id
      );
      setContentFlashcards(relatedFlashcards);
    }
  }, [content, flashcards, id]);

  const loadContent = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const contentData = await getContentById(id);
      if (contentData) {
        setContent(contentData);
      } else {
        Alert.alert("Erreur", "Contenu introuvable");
        router.back();
      }
    } catch (error) {
      console.error("Erreur lors du chargement du contenu:", error);
      Alert.alert("Erreur", "Impossible de charger le contenu");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!content) return;

    try {
      setGeneratingCards(true);
      const generatedCards = await generateFlashcards(content.rawText, 5);

      // Créer les flashcards dans l'application
      for (const card of generatedCards) {
        await addFlashcard(card.question, card.answer, id);
      }

      Alert.alert(
        "Succès",
        `${generatedCards.length} flashcards ont été générées avec succès!`
      );
    } catch (error) {
      console.error("Erreur lors de la génération des flashcards:", error);
      Alert.alert("Erreur", "Impossible de générer les flashcards");
    } finally {
      setGeneratingCards(false);
    }
  };

  const handleIndexContent = async () => {
    if (!content) return;

    try {
      setIndexingContent(true);
      await processContentForRAG(id);
      Alert.alert("Succès", "Contenu indexé avec succès pour la recherche!");
    } catch (error) {
      console.error("Erreur lors de l'indexation du contenu:", error);
      Alert.alert("Erreur", "Impossible d'indexer le contenu");
    } finally {
      setIndexingContent(false);
    }
  };

  const handleShare = async () => {
    if (!content) return;

    try {
      await Share.share({
        message: content.rawText,
        title:
          content.title ||
          `Notes capturées le ${formatDateToString(
            new Date(content.capturedAt)
          )}`,
      });
    } catch (error) {
      console.error("Erreur lors du partage:", error);
    }
  };

  const handleCreateFlashcard = () => {
    router.push({
      pathname: "/flashcard/create",
      params: { sourceContentId: id },
    });
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <ThemedText style={styles.loadingText}>
          Chargement du contenu...
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.contentContainer}>
        {content.imageUri && (
          <Image
            source={{ uri: content.imageUri }}
            style={styles.contentImage}
            resizeMode="contain"
          />
        )}

        <ThemedView style={styles.contentHeader}>
          <ThemedText style={styles.contentTitle}>
            {content.title ||
              `Notes du ${formatDateToString(new Date(content.capturedAt))}`}
          </ThemedText>
          <ThemedText style={styles.captureDate}>
            Capturé {formatRelativeDate(new Date(content.capturedAt))}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleGenerateFlashcards}
            disabled={generatingCards}
          >
            {generatingCards ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <IconSymbol name="square.stack.fill" size={20} color="white" />
                <ThemedText style={styles.actionButtonText}>
                  Générer des flashcards
                </ThemedText>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleIndexContent}
            disabled={indexingContent}
          >
            {indexingContent ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <IconSymbol name="magnifyingglass" size={20} color="white" />
                <ThemedText style={styles.actionButtonText}>
                  Indexer pour recherche
                </ThemedText>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <IconSymbol name="square.and.arrow.up" size={20} color="white" />
            <ThemedText style={styles.actionButtonText}>Partager</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ThemedText style={styles.contentText}>{content.rawText}</ThemedText>

        <ThemedView style={styles.flashcardsSection}>
          <ThemedView style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              Flashcards associées ({contentFlashcards.length})
            </ThemedText>
            <TouchableOpacity onPress={handleCreateFlashcard}>
              <ThemedText style={styles.addFlashcardText}>+ Créer</ThemedText>
            </TouchableOpacity>
          </ThemedView>

          {contentFlashcards.length > 0 ? (
            contentFlashcards.map((card) => (
              <ThemedView key={card.id} style={styles.flashcardItem}>
                <ThemedText style={styles.flashcardQuestion}>
                  {card.question}
                </ThemedText>
                <TouchableOpacity
                  style={styles.editFlashcardButton}
                  onPress={() => router.push(`/flashcard/edit/${card.id}`)}
                >
                  <IconSymbol name="pencil" size={16} color="#0a7ea4" />
                </TouchableOpacity>
              </ThemedView>
            ))
          ) : (
            <ThemedText style={styles.noFlashcardsText}>
              Aucune flashcard associée à ce contenu
            </ThemedText>
          )}
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
  },
  contentContainer: {
    padding: 16,
  },
  contentImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  contentHeader: {
    marginBottom: 16,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  captureDate: {
    fontSize: 14,
    color: "#666",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: "#0a7ea4",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 12,
    marginLeft: 4,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  flashcardsSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  addFlashcardText: {
    color: "#0a7ea4",
    fontWeight: "600",
  },
  flashcardItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  flashcardQuestion: {
    flex: 1,
  },
  editFlashcardButton: {
    padding: 8,
  },
  noFlashcardsText: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    padding: 20,
  },
});
