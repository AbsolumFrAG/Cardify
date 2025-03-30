import { Flashcard } from "@/types/flashcard";

export const LEITNER_BOX_INTERVALS = [1, 2, 5, 8, 14];

export function calculateNextReviewDate(boxLevel: number): Date {
  const daysToAdd = LEITNER_BOX_INTERVALS[boxLevel - 1] || 1;
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + daysToAdd);
  return nextDate;
}

export function updateFlashcardBox(
  flashcard: Flashcard,
  wasCorrect: boolean
): Flashcard {
  let newBoxLevel = flashcard.boxLevel;

  if (wasCorrect) {
    newBoxLevel = Math.min(newBoxLevel + 1, 5);
  } else {
    newBoxLevel = 1;
  }

  return {
    ...flashcard,
    boxLevel: newBoxLevel,
    nextReviewDate: calculateNextReviewDate(newBoxLevel),
    lastReviewedAt: new Date(),
  };
}

export function getDueFlashcards(flashcards: Flashcard[]): Flashcard[] {
  const now = new Date();
  return flashcards.filter((card) => card.nextReviewDate <= now);
}

export function getFlashcardsByBox(
  flashcards: Flashcard[],
  boxLevel: number
): Flashcard[] {
  return flashcards.filter((card) => card.boxLevel === boxLevel);
}