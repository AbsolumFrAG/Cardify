import { ContentChunk } from "@/types/content";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

// Configuration de l'API
const API_URL = Constants.expoConfig?.extra?.apiUrl || "http://localhost:8000";

// Type pour la réponse d'extraction de texte
interface ExtractTextResponse {
  text: string;
  success: boolean;
  error_message?: string;
}

// Type pour les flashcards générées
interface GeneratedFlashcard {
  question: string;
  answer: string;
}

// Type pour la réponse de génération de flashcards
interface FlashcardsResponse {
  flashcards: GeneratedFlashcard[];
}

// Type pour la réponse RAG
interface RAGResponse {
  answer: string;
}

/**
 * Fonction utilitaire pour obtenir le token d'authentification
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const tokenData = await AsyncStorage.getItem("auth_token");
    if (!tokenData) return null;
    return JSON.parse(tokenData).token;
  } catch (error) {
    console.error("Erreur lors de la récupération du token:", error);
    return null;
  }
}

/**
 * Fonction utilitaire pour les requêtes HTTP avec gestion de l'authentification
 */
async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAuthToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Extraction de texte à partir d'une image en base64
 */
export async function extractTextFromImage(imageBase64: string): Promise<{
  text: string;
  success: boolean;
  errorMessage?: string;
}> {
  try {
    const response = await fetchWithAuth(`${API_URL}/ai/extract-text`, {
      method: "POST",
      body: JSON.stringify({ image_base64: imageBase64 }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || "Erreur lors de l'extraction de texte"
      );
    }

    const data: ExtractTextResponse = await response.json();

    return {
      text: data.text,
      success: data.success,
      errorMessage: data.error_message,
    };
  } catch (error) {
    console.error("Erreur lors de l'extraction de texte:", error);
    return {
      text: "",
      success: false,
      errorMessage:
        error instanceof Error
          ? error.message
          : "Erreur inconnue lors de l'extraction de texte",
    };
  }
}

/**
 * Génération de flashcards à partir d'un texte
 */
export async function generateFlashcards(
  text: string,
  numCards: number = 5
): Promise<GeneratedFlashcard[]> {
  try {
    const response = await fetchWithAuth(`${API_URL}/ai/generate-flashcards`, {
      method: "POST",
      body: JSON.stringify({
        text,
        num_cards: numCards,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || "Erreur lors de la génération des flashcards"
      );
    }

    const data: FlashcardsResponse = await response.json();
    return data.flashcards;
  } catch (error) {
    console.error("Erreur lors de la génération des flashcards:", error);
    return [];
  }
}

/**
 * Insertion ou mise à jour d'un vecteur dans la base vectorielle
 */
export async function upsertVector(chunk: ContentChunk): Promise<boolean> {
  try {
    const response = await fetchWithAuth(`${API_URL}/vector-store/upsert`, {
      method: "POST",
      body: JSON.stringify(chunk),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || "Erreur lors de l'insertion du vecteur"
      );
    }

    return true;
  } catch (error) {
    console.error("Erreur lors de l'insertion du vecteur:", error);
    return false;
  }
}

/**
 * Recherche de vecteurs similaires dans la base vectorielle
 */
export async function queryVectors(
  queryText: string,
  topK: number = 5
): Promise<ContentChunk[]> {
  try {
    const response = await fetchWithAuth(`${API_URL}/vector-store/query`, {
      method: "POST",
      body: JSON.stringify({ query_text: queryText, top_k: topK }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || "Erreur lors de la recherche de vecteurs"
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la recherche de vecteurs:", error);
    return [];
  }
}

/**
 * Génération d'une réponse enrichie par recherche (RAG)
 */
export async function generateAnswerWithRAG(question: string): Promise<string> {
  try {
    const response = await fetchWithAuth(`${API_URL}/vector-store/rag`, {
      method: "POST",
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || "Erreur lors de la génération de la réponse"
      );
    }

    const data: RAGResponse = await response.json();
    return data.answer;
  } catch (error) {
    console.error("Erreur lors de la génération de la réponse:", error);
    return "Désolé, je n'ai pas pu générer une réponse à cette question.";
  }
}

/**
 * Stockage d'une transcription de texte pour RAG
 */
export async function storeTranscription(
  text: string,
  source: string = "transcription",
  metadata: Record<string, any> = {}
): Promise<{ success: boolean; chunkIds: string[]; chunkCount: number }> {
  try {
    const response = await fetchWithAuth(`${API_URL}/transcriptions/store`, {
      method: "POST",
      body: JSON.stringify({
        text,
        source,
        metadata,
        chunk_size: 3000,
        chunk_overlap: 200,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || "Erreur lors du stockage de la transcription"
      );
    }

    const data = await response.json();
    return {
      success: true,
      chunkIds: data.chunk_ids,
      chunkCount: data.chunk_count,
    };
  } catch (error) {
    console.error("Erreur lors du stockage de la transcription:", error);
    return {
      success: false,
      chunkIds: [],
      chunkCount: 0,
    };
  }
}
