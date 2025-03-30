import { updateFlashcardBox } from "@/services/leitnerSystem";
import {
  getFlashcards,
  addFlashcard as storeAddFlashcard,
  deleteFlashcard as storeDeleteFlashcard,
  updateFlashcard as storeUpdateFlashcard,
} from "@/services/storageService";
import { Flashcard } from "@/types/flashcard";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

interface FlashcardContextType {
  flashcards: Flashcard[];
  loading: boolean;
  addFlashcard: (
    question: string,
    answer: string,
    sourceContentId?: string
  ) => Promise<Flashcard>;
  updateFlashcard: (flashcard: Flashcard) => Promise<void>;
  deleteFlashcard: (id: string) => Promise<void>;
  reviewFlashcard: (id: string, wasCorrect: boolean) => Promise<void>;
  getFlashcardById: (id: string) => Flashcard | undefined;
}

const FlashcardContext = createContext<FlashcardContextType | undefined>(
  undefined
);

export function FlashcardProvider({ children }: { children: ReactNode }) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFlashcards();
  }, []);

  async function loadFlashcards() {
    try {
      setLoading(true);
      const cards = await getFlashcards();
      setFlashcards(cards);
    } catch (error) {
      console.error("Erreur lors du chargement des flashcards :", error);
    } finally {
      setLoading(false);
    }
  }

  async function addFlashcard(
    question: string,
    answer: string,
    sourceContentId?: string
  ): Promise<Flashcard> {
    const newFlashcard: Flashcard = {
      id: uuidv4(),
      question,
      answer,
      boxLevel: 1,
      nextReviewDate: new Date(),
      createdAt: new Date(),
      sourceContentId,
    };

    try {
      await storeAddFlashcard(newFlashcard);
      setFlashcards((prev) => [...prev, newFlashcard]);
      return newFlashcard;
    } catch (error) {
      console.error("Erreur lors de l'ajout de la flashcard :", error);
      throw error;
    }
  }

  async function updateFlashcard(flashcard: Flashcard): Promise<void> {
    try {
      await storeUpdateFlashcard(flashcard);
      setFlashcards((prev) =>
        prev.map((card) => (card.id === flashcard.id ? flashcard : card))
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la flashcard :", error);
      throw error;
    }
  }

  async function deleteFlashcard(id: string): Promise<void> {
    try {
      await storeDeleteFlashcard(id);
      setFlashcards((prev) => prev.filter((card) => card.id !== id));
    } catch (error) {
      console.error("Erreur lors de la suppression d'une flashcard :", error);
      throw error;
    }
  }

  async function reviewFlashcard(
    id: string,
    wasCorrect: boolean
  ): Promise<void> {
    const flashcard = flashcards.find((card) => card.id === id);
    if (!flashcard) return;

    const updatedCard = updateFlashcardBox(flashcard, wasCorrect);

    try {
      await storeUpdateFlashcard(updatedCard);
      setFlashcards((prev) =>
        prev.map((card) => (card.id === id ? updatedCard : card))
      );
    } catch (error) {
      console.error("Erreur lors de la révision d'une flashcard :", error);
      throw error;
    }
  }

  function getFlashcardById(id: string): Flashcard | undefined {
    return flashcards.find((card) => card.id === id);
  }

  return (
    <FlashcardContext.Provider
      value={{
        flashcards,
        loading,
        addFlashcard,
        updateFlashcard,
        deleteFlashcard,
        reviewFlashcard,
        getFlashcardById,
      }}
    >
      {children}
    </FlashcardContext.Provider>
  );
}

export function useFlashcards() {
  const context = useContext(FlashcardContext);
  if (!context) {
    throw new Error("useFlashcards must be used within a FlashcardProvider");
  }
  return context;
}
