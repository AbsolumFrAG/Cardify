import { CourseContent } from "@/types/content";
import { Flashcard } from "@/types/flashcard";
import AsyncStorage from "@react-native-async-storage/async-storage";

const FLASHCARDS_KEY = "flashcards";
const CONTENT_KEY = "courseContent";

export async function saveFlashcards(flashcards: Flashcard[]): Promise<void> {
  try {
    await AsyncStorage.setItem(FLASHCARDS_KEY, JSON.stringify(flashcards));
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des flashcards:", error);
    throw error;
  }
}

export async function getFlashcards(): Promise<Flashcard[]> {
  try {
    const flashcardsJson = await AsyncStorage.getItem(FLASHCARDS_KEY);
    if (!flashcardsJson) return [];

    const flashcards = JSON.parse(flashcardsJson) as Flashcard[];

    return flashcards.map((card) => ({
      ...card,
      nextReviewDate: new Date(card.nextReviewDate),
      createdAt: new Date(card.createdAt),
      lastReviewedAt: card.lastReviewedAt
        ? new Date(card.lastReviewedAt)
        : undefined,
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des flashcards:", error);
    return [];
  }
}

export async function addFlashcard(flashcard: Flashcard): Promise<void> {
  try {
    const flashcards = await getFlashcards();
    flashcards.push(flashcard);
    await saveFlashcards(flashcards);
  } catch (error) {
    console.error("Erreur lors de l'ajout d'une flashcard:", error);
    throw error;
  }
}

export async function updateFlashcard(updatedCard: Flashcard): Promise<void> {
  try {
    const flashcards = await getFlashcards();
    const index = flashcards.findIndex((card) => card.id === updatedCard.id);

    if (index !== -1) {
      flashcards[index] = updatedCard;
      await saveFlashcards(flashcards);
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour d'une flashcard:", error);
    throw error;
  }
}

export async function deleteFlashcard(id: string): Promise<void> {
  try {
    const flashcards = await getFlashcards();
    const updatedFlashcards = flashcards.filter((card) => card.id !== id);
    await saveFlashcards(updatedFlashcards);
  } catch (error) {
    console.error("Erreur lors de la suppression d'une flashcard:", error);
    throw error;
  }
}

export async function saveCourseContents(
  contents: CourseContent[]
): Promise<void> {
  try {
    await AsyncStorage.setItem(CONTENT_KEY, JSON.stringify(contents));
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du contenu des cours:", error);
    throw error;
  }
}

export async function getCourseContents(): Promise<CourseContent[]> {
  try {
    const contentsJson = await AsyncStorage.getItem(CONTENT_KEY);
    if (!contentsJson) return [];

    const contents = JSON.parse(contentsJson) as CourseContent[];

    return contents.map((content) => ({
      ...content,
      capturedAt: new Date(content.capturedAt),
    }));
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du contenu des cours:",
      error
    );
    return [];
  }
}

export async function addCourseContent(content: CourseContent): Promise<void> {
  try {
    const contents = await getCourseContents();
    contents.push(content);
    await saveCourseContents(contents);
  } catch (error) {
    console.error("Erreur lors de l'ajout de contenu de cours:", error);
    throw error;
  }
}

export async function getCourseContentById(
  id: string
): Promise<CourseContent | null> {
  try {
    const contents = await getCourseContents();
    return contents.find((content) => content.id === id) || null;
  } catch (error) {
    console.error("Erreur lors de la récupération du contenu de cours:", error);
    return null;
  }
}
