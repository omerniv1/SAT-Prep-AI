import React, { useState } from 'react';
import { Question, GameState } from '../types';

interface QuestionScreenProps {
  question: Question;
  selectedOption: number | null;
  gameState: GameState;
  onSelectOption: (index: number) => void;
  onSubmit: () => void;
  onNext: () => void;
  onSkip: () => void;
  loadingNext: boolean;
}

export const QuestionScreen: React.FC<QuestionScreenProps> = ({
  question,
  selectedOption,
  gameState,
  onSelectOption,
  onSubmit,
  onNext,
  onSkip,
  loadingNext,
}) => {
  const [checking, setChecking] = useState(false);
  const isReview = gameState === GameState.REVIEW;
  const isCorrect = selectedOption === question.correctIndex;

  const handleCheck = () => {
    setChecking(true);
    // Small delay to prevent accidental double clicks and show "checking" state
    setTimeout(() => {
      onSubmit();
      setChecking(false);
    }, 300);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">
      {/* Left Panel: Question Stem */}
      <div className="md:w-1/2 p-8 md:p-12 overflow-y-auto border-b md:border-b-0 md:border-r border-gray-200 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 flex items-center gap-3">
             <span className="bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded">
               {question.topic}
             </span>
             {isReview && (
               <span className={`text-xs font-bold px-2 py-1 rounded ${
                 selectedOption === question.correctIndex 
                   ? 'bg-green-100 text-green-700' 
                   : 'bg-red-100 text-red-700'
               }`}>
                 {selectedOption === question.correctIndex ? 'Correct' : 'Incorrect'}
               </span>
             )}
          </div>
          
          <div className="prose prose-lg text-gray-900 mb-6">
            <p className="whitespace-pre-wrap leading-relaxed math-font text-lg">
              {question.stem}
            </p>
          </div>

          {/* Question SVG */}
          {question.svg && (
            <div className="mb-8 p-4 bg-white border border-gray-100 rounded-lg shadow-sm flex justify-center">
              <div 
                className="w-full max-w-[300px]"
                dangerouslySetInnerHTML={{ __html: question.svg }} 
              />
            </div>
          )}

          {/* Explanation View */}
          {isReview && (
            <div className={`mt-8 p-6 border-l-4 rounded-r-lg animate-in fade-in slide-in-from-bottom-4 duration-500 ${
              isCorrect 
                ? 'bg-green-50 border-green-500' 
                : 'bg-red-50 border-red-500'
            }`}>
              <h3 className={`font-bold mb-2 ${
                isCorrect ? 'text-green-900' : 'text-red-900'
              }`}>
                {isCorrect ? 'Explanation' : 'Incorrect - Detailed Solution & Tips'}
              </h3>
              <p className={`leading-relaxed whitespace-pre-wrap mb-4 ${
                isCorrect ? 'text-green-800' : 'text-red-900'
              }`}>
                {question.explanation}
              </p>
              
              {/* Explanation SVG (Graphs for functions, etc) */}
              {question.explanationSvg && (
                <div className="mt-4 p-4 bg-white/50 rounded-lg border border-black/5 flex justify-center">
                   <div 
                    className="w-full max-w-[300px]"
                    dangerouslySetInnerHTML={{ __html: question.explanationSvg }} 
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Options & Controls */}
      <div className="md:w-1/2 bg-gray-50 p-6 md:p-12 flex flex-col justify-between overflow-y-auto">
        <div className="max-w-md mx-auto w-full">
          <h2 className="text-gray-500 text-sm font-medium mb-4 uppercase tracking-wider">
            Select the best answer
          </h2>
          
          <div className="space-y-3">
            {question.options.map((option, idx) => {
              const letter = String.fromCharCode(65 + idx); // A, B, C, D
              let containerClass = "relative flex items-start p-4 cursor-pointer border rounded-lg transition-all duration-200 ";
              let circleClass = "flex items-center justify-center w-8 h-8 rounded-full border text-sm font-bold mr-4 transition-colors ";
              
              if (isReview) {
                // Review State Styling
                if (idx === question.correctIndex) {
                  containerClass += "bg-green-50 border-green-500 ring-1 ring-green-500 z-10";
                  circleClass += "bg-green-500 border-green-500 text-white";
                } else if (idx === selectedOption && idx !== question.correctIndex) {
                  containerClass += "bg-red-50 border-red-500 opacity-75";
                  circleClass += "bg-red-500 border-red-500 text-white";
                } else {
                  containerClass += "bg-white border-gray-200 opacity-50";
                  circleClass += "border-gray-300 text-gray-500";
                }
              } else {
                // Active State Styling
                if (selectedOption === idx) {
                  containerClass += "bg-indigo-50 border-indigo-600 ring-1 ring-indigo-600 shadow-sm z-10";
                  circleClass += "bg-indigo-600 border-indigo-600 text-white";
                } else {
                  containerClass += "bg-white border-gray-300 hover:border-gray-400 hover:bg-gray-50";
                  circleClass += "border-gray-400 text-gray-600 bg-white";
                }
              }

              return (
                <div 
                  key={idx}
                  onClick={() => !isReview && !checking && onSelectOption(idx)}
                  className={containerClass}
                >
                  <div className={circleClass}>
                    {letter}
                  </div>
                  <div className="flex-1 pt-1 math-font text-gray-800 font-medium">
                    {option}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Bar */}
        <div className="max-w-md mx-auto w-full mt-8 border-t border-gray-200 pt-6">
          {!isReview ? (
            <div className="flex gap-4">
              <button
                onClick={onSkip}
                disabled={checking}
                className="flex-1 py-3.5 px-6 rounded-full font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Skip
              </button>
              <button
                onClick={handleCheck}
                disabled={selectedOption === null || checking}
                className={`flex-[2] py-3.5 px-6 rounded-full font-semibold text-white shadow-sm transition-all flex items-center justify-center gap-2
                  ${selectedOption !== null && !checking
                    ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-md transform hover:-translate-y-0.5' 
                    : 'bg-gray-300 cursor-not-allowed'}
                `}
              >
                {checking ? (
                  <>
                     <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Checking...</span>
                  </>
                ) : (
                  "Check Answer"
                )}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="text-center text-sm text-gray-500 italic mb-2">
                {selectedOption === question.correctIndex 
                  ? "Good job! Getting ready for the next challenge..." 
                  : "Don't worry, the next one will adjust to help you learn."}
              </div>
              <button
                onClick={onNext}
                disabled={loadingNext}
                className="w-full py-3.5 px-6 rounded-full font-semibold text-white bg-gray-900 hover:bg-gray-800 shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-80 disabled:cursor-wait"
              >
                {loadingNext ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Generating Question...</span>
                  </>
                ) : (
                  <span>Next Question</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};