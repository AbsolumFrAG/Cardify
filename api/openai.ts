import { OpenAI } from "openai";
import Constants from "expo-constants";

const OPENAI_API_KEY = Constants.expoConfig?.extra?.openAIApiKey;

// Instancier le client OpenAI
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

interface OpenAIResponse {
  text: string;
  success?: boolean;
  errorMessage?: string;
  confidence?: number;
}

/**
 * Extrait le texte d'une image en utilisant l'API Vision de OpenAI
 */
export async function extractTextFromImage(
  imageBase64: string
): Promise<OpenAIResponse> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extrais tout le texte de cette image de notes de cours. Réponds uniquement avec le texte extrait. Si tu ne peux pas extraire de texte, réponds seulement avec 'EXTRACTION_IMPOSSIBLE'.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
    });

    const extractedText = response.choices[0]?.message?.content || "";

    // Vérification explicite si l'extraction a échoué
    if (extractedText === "EXTRACTION_IMPOSSIBLE" || !extractedText) {
      return {
        text: "",
        success: false,
        errorMessage: "Impossible d'extraire du texte de cette image",
      };
    }

    return {
      text: extractedText,
      success: true,
    };
  } catch (error) {
    console.error("Erreur lors de l'extraction du texte de l'image:", error);
    return {
      text: "",
      success: false,
      errorMessage:
        "Erreur lors de la communication avec l'API d'extraction de texte",
    };
  }
}

/**
 * Génère automatiquement des flashcards à partir d'un texte
 */
export async function generateFlashcards(
  text: string,
  numCards: number = 5
): Promise<Array<{ question: string; answer: string }>> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Génère ${numCards} flashcards au format question/réponse à partir de ce texte de cours. Renvoie uniquement un tableau JSON au format [{question: "...", answer: "..."}]. Le contenu est: ${text}`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content || "";

    // Extraire le JSON de la réponse
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return [];
  } catch (error) {
    console.error("Erreur lors de la génération des flashcards:", error);
    return [];
  }
}

/**
 * Génère des embeddings pour le texte en utilisant l'API OpenAI
 */
export async function createEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("Erreur lors de la création de l'embedding:", error);
    throw error;
  }
}
