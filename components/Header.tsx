import React from 'react';

interface HeaderProps {
  streak: number;
  difficulty: number;
}

export const Header: React.FC<HeaderProps> = ({ streak, difficulty }) => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold tracking-tight text-gray-900">
          SatPrep<span className="text-blue-600">.ai</span>
        </h1>
        <div className="h-6 w-px bg-gray-300 mx-2"></div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">Section:</span> Math (Advanced)
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
          <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Difficulty</span>
          <div className="flex gap-1 mt-1">
             {[...Array(10)].map((_, i) => (
               <div 
                 key={i} 
                 className={`h-1.5 w-3 rounded-full ${i < difficulty ? 'bg-indigo-600' : 'bg-gray-200'}`}
               />
             ))}
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
          <span className="text-xs uppercase text-gray-500 font-bold">Streak</span>
          <span className={`font-mono font-bold ${streak > 0 ? 'text-green-600' : 'text-gray-400'}`}>
            {streak}
          </span>
        </div>
        
        <div className="text-sm font-medium text-gray-500">
          Time Remaining: <span className="text-gray-900">Hidden</span>
        </div>
      </div>
    </header>
  );
};