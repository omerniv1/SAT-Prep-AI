import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { QuestionScreen } from './components/QuestionScreen';
import { generateMathQuestion } from './services/geminiService';
import { Question, GameState } from './types';

// Initial Difficulty (1-10 scale). 
// 8 represents "Hard" start as requested (Q18+ equivalent).
const INITIAL_DIFFICULTY = 8;

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.LOADING);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  // Stats
  const [difficulty, setDifficulty] = useState<number>(INITIAL_DIFFICULTY);
  const [streak, setStreak] = useState<number>(0);
  
  const loadNewQuestion = useCallback(async (targetDifficulty: number) => {
    try {
      const q = await generateMathQuestion(targetDifficulty);
      setCurrentQuestion(q);
      setSelectedOption(null);
      setGameState(GameState.ACTIVE);
    } catch (error) {
      console.error("Failed to load question", error);
      setGameState(GameState.ERROR);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadNewQuestion(INITIAL_DIFFICULTY);
  }, [loadNewQuestion]);

  const handleSelectOption = (index: number) => {
    if (gameState === GameState.ACTIVE) {
      setSelectedOption(index);
    }
  };

  const handleSubmit = () => {
    if (!currentQuestion || selectedOption === null) return;

    setGameState(GameState.REVIEW);
    const isCorrect = selectedOption === currentQuestion.correctIndex;

    if (isCorrect) {
      setStreak(s => s + 1);
      // Increase difficulty, max 10
      setDifficulty(prev => Math.min(10, prev + 0.5));
    } else {
      setStreak(0);
      // Decrease difficulty, min 1 (but realistically keep it somewhat challenging)
      setDifficulty(prev => Math.max(4, prev - 1)); 
    }
  };

  const handleNext = () => {
    setGameState(GameState.LOADING); 
    loadNewQuestion(difficulty);
  };

  const handleSkip = () => {
    // Skip just loads a new question without affecting streak/difficulty significantly
    // Optional: Could slightly penalize or just keep same. For now, keep same.
    setGameState(GameState.LOADING);
    loadNewQuestion(difficulty);
  }

  if (gameState === GameState.ERROR) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 text-center p-4">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-6">We couldn't generate a question. Please check your connection.</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Reload App
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      <Header streak={streak} difficulty={difficulty} />
      
      {gameState === GameState.LOADING && !currentQuestion ? (
        // Initial Skeleton Loader
        <div className="flex-1 flex flex-col md:flex-row p-8 animate-pulse">
          <div className="w-full md:w-1/2 p-12 space-y-6">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-12"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="w-full md:w-1/2 p-12 space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg w-full"></div>
            ))}
          </div>
        </div>
      ) : (
        currentQuestion && (
          <QuestionScreen 
            question={currentQuestion}
            selectedOption={selectedOption}
            gameState={gameState}
            onSelectOption={handleSelectOption}
            onSubmit={handleSubmit}
            onNext={handleNext}
            onSkip={handleSkip}
            loadingNext={gameState === GameState.LOADING}
          />
        )
      )}
    </div>
  );
};

export default App;