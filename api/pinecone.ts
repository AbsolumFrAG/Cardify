import Constants from "expo-constants";
import { OpenAI } from "openai";
import { ContentChunk } from "../types/content";
import { createEmbedding } from "./openai";

const PINECONE_API_KEY = Constants.expoConfig?.extra?.pineconeApiKey;
const PINECONE_ENVIRONMENT = Constants.expoConfig?.extra?.pineconeEnvironment;
const PINECONE_INDEX = Constants.expoConfig?.extra?.pineconeIndex;
const OPENAI_API_KEY = Constants.expoConfig?.extra?.openAIApiKey;

const BASE_URL = `https://${PINECONE_INDEX}-${PINECONE_ENVIRONMENT}.svc.${PINECONE_ENVIRONMENT}.pinecone.io`;

// Instancier le client OpenAI
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Ajoute ou met à jour un vecteur dans Pinecone
export async function upsertVector(chunk: ContentChunk): Promise<void> {
  if (!chunk.embedding) {
    chunk.embedding = await createEmbedding(chunk.text);
  }

  try {
    await fetch(`${BASE_URL}/vectors/upsert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": PINECONE_API_KEY as string,
      },
      body: JSON.stringify({
        vectors: [
          {
            id: chunk.id,
            values: chunk.embedding,
            metadata: {
              text: chunk.text,
              ...chunk.metadata,
            },
          },
        ],
      }),
    });
  } catch (error) {
    console.error("Erreur lors de l'insertion du vecteur:", error);
    throw error;
  }
}

// Recherche des vecteurs similaires dans Pinecone
export async function queryVectors(
  queryText: string,
  topK: number = 5
): Promise<ContentChunk[]> {
  try {
    const embedding = await createEmbedding(queryText);

    const response = await fetch(`${BASE_URL}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": PINECONE_API_KEY as string,
      },
      body: JSON.stringify({
        vector: embedding,
        topK,
        includeMetadata: true,
      }),
    });

    const data = await response.json();

    return data.matches.map((match: any) => ({
      id: match.id,
      text: match.metadata.text,
      metadata: {
        position: match.metadata.position,
        keywords: match.metadata.keywords,
      },
      score: match.score,
    }));
  } catch (error) {
    console.error("Erreur lors de la recherche de vecteurs:", error);
    throw error;
  }
}

// RAG - Génération augmentée par récupération
export async function generateAnswerWithRAG(question: string): Promise<string> {
  try {
    // 1. Récupérer les documents pertinents
    const relevantChunks = await queryVectors(question);
    const context = relevantChunks.map((chunk) => chunk.text).join("\n\n");

    // 2. Générer une réponse avec le contexte en utilisant la bibliothèque OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Tu es un assistant pédagogique qui aide les étudiants à comprendre leurs cours. Réponds de manière concise et précise en te basant sur le contexte fourni.",
        },
        {
          role: "user",
          content: `Contexte des notes de cours: \n\n${context}\n\nQuestion: ${question}`,
        },
      ],
    });

    return (
      response.choices[0].message.content ||
      "Désolé, je n'ai pas pu générer une réponse à cette question."
    );
  } catch (error) {
    console.error("Erreur lors de la génération de réponse RAG:", error);
    return "Désolé, je n'ai pas pu générer une réponse à cette question.";
  }
}
