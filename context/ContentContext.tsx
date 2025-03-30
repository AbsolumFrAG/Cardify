import { upsertVector } from "@/api/pinecone";
import {
  getCourseContentById,
  getCourseContents,
  saveCourseContents,
  addCourseContent as storeAddContent,
} from "@/services/storageService";
import { ContentChunk, CourseContent } from "@/types/content";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from "uuid";

interface ContentContextType {
  contents: CourseContent[];
  loading: boolean;
  addContent: (content: CourseContent) => Promise<CourseContent>;
  updateContent: (content: CourseContent) => Promise<void>;
  deleteContent: (id: string) => Promise<void>;
  getContentById: (id: string) => Promise<CourseContent | null>;
  processContentForRAG: (contentId: string) => Promise<void>;
  searchContent: (query: string) => CourseContent[];
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [contents, setContents] = useState<CourseContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContents();
  }, []);

  async function loadContents() {
    try {
      setLoading(true);
      const loadedContents = await getCourseContents();
      setContents(loadedContents);
    } catch (error) {
      console.error("Erreur lors du chargement des contenus :", error);
    } finally {
      setLoading(false);
    }
  }

  function chunkText(text: string, maxChunkSize: 1536): ContentChunk[] {
    const paragraphs = text.split(/\n\s*\n/);
    const chunks: ContentChunk[] = [];
    let currentChunk = "";
    let currentPosition = 0;

    for (const paragraph of paragraphs) {
      if (paragraph.length > maxChunkSize) {
        const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];

        for (const sentence of sentences) {
          if (currentChunk.length + sentence.length > maxChunkSize) {
            if (currentChunk) {
              chunks.push({
                id: uuidv4(),
                text: currentChunk.trim(),
                metadata: {
                  position: currentPosition++,
                },
              });
            }
            currentChunk = sentence;
          } else {
            currentChunk += " " + sentence;
          }
        }
      } else if (currentChunk.length + paragraph.length > maxChunkSize) {
        chunks.push({
          id: uuidv4(),
          text: currentChunk.trim(),
          metadata: {
            position: currentPosition++,
          },
        });
        currentChunk = paragraph;
      } else {
        if (currentChunk) currentChunk += "\n\n";
        currentChunk += paragraph;
      }
    }

    if (currentChunk) {
      chunks.push({
        id: uuidv4(),
        text: currentChunk.trim(),
        metadata: {
          position: currentPosition,
        },
      });
    }

    return chunks;
  }

  async function addContent(content: CourseContent): Promise<CourseContent> {
    try {
      const contentWithId = {
        ...content,
        id: content.id || uuidv4(),
      };

      if (
        !contentWithId.processedChunks ||
        contentWithId.processedChunks.length === 0
      ) {
        contentWithId.processedChunks = chunkText(contentWithId.rawText, 1536);
      }

      await storeAddContent(contentWithId);
      setContents((prev) => [...prev, contentWithId]);

      processContentForRAG(contentWithId.id).catch((error) => {
        console.error("Erreur lors du traitement du contenu pour RAG:", error);
      });

      return contentWithId;
    } catch (error) {
      console.error("Erreur lors de l'ajout du contenu :", error);
      throw error;
    }
  }

  async function updateContent(content: CourseContent): Promise<void> {
    try {
      const updatedContents = contents.map((c) =>
        c.id === content.id ? content : c
      );

      await saveCourseContents(updatedContents);
      setContents(updatedContents);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du contenu :", error);
      throw error;
    }
  }

  async function deleteContent(id: string): Promise<void> {
    try {
      const updatedContents = contents.filter((c) => c.id !== id);
      await saveCourseContents(updatedContents);
      setContents(updatedContents);
    } catch (error) {
      console.error("Erreur lors de la suppression du contenu :", error);
      throw error;
    }
  }

  async function getContentById(id: string): Promise<CourseContent | null> {
    const contentFromState = contents.find((c) => c.id === id);
    if (contentFromState) return contentFromState;

    return await getCourseContentById(id);
  }

  async function processContentForRAG(contentId: string): Promise<void> {
    try {
      const content = await getContentById(contentId);
      if (!content) throw new Error(`Contenu avec ID ${contentId} non trouvé`);

      for (const chunk of content.processedChunks) {
        try {
          await upsertVector(chunk);
        } catch (error) {
          console.error(
            `Erreur lors de l'indexation du chunk ${chunk.id} :`,
            error
          );
        }
      }
    } catch (error) {
      console.error("Erreur lors du traitement du contenu pour RAG :", error);
      throw error;
    }
  }

  function searchContent(query: string): CourseContent[] {
    if (!query.trim()) return [];

    const searchTerms = query.toLowerCase().split(/\s+/);

    return contents.filter((content) => {
      const contentText = content.rawText.toLowerCase();
      return searchTerms.every((term) => contentText.includes(term));
    });
  }

  return (
    <ContentContext.Provider
      value={{
        contents,
        loading,
        addContent,
        updateContent,
        deleteContent,
        getContentById,
        processContentForRAG,
        searchContent,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
}
