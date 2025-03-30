export interface CourseContent {
  id: string;
  rawText: string;
  processedChunks: ContentChunk[];
  title?: string;
  subject?: string;
  capturedAt: Date;
  imageUri?: string;
}

export interface ContentChunk {
  id: string;
  text: string;
  embedding?: number[];
  metadata?: {
    position: number;
    keywords?: string[];
  };
}
