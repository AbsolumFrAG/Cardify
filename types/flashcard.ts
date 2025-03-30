export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  boxLevel: number;
  nextReviewDate: Date;
  createdAt: Date;
  lastReviewedAt?: Date;
  sourceContentId?: string;
  tags?: string[];
}
