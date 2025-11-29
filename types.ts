export interface Question {
  id: string;
  stem: string; // The question text
  options: string[]; // 4 options
  correctIndex: number; // 0-3
  explanation: string; // Detailed breakdown
  topic: string; // e.g., "Advanced Algebra"
  difficultyLevel: number; // 1-10 scale internal
  svg?: string; // Optional: Geometry shape or graph for the question
  explanationSvg?: string; // Optional: Visual aid for the explanation
}

export enum GameState {
  LOADING = 'LOADING',
  ACTIVE = 'ACTIVE', // User is solving
  REVIEW = 'REVIEW', // User submitted, showing explanation
  ERROR = 'ERROR'
}

export interface SessionStats {
  correct: number;
  total: number;
  currentStreak: number;
  difficultyRating: number; // 1 to 10 scale
}