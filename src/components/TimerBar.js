'use client';

import { formatTime } from '@/lib/useTimers';

export default function TimerBar({ timers, onToggle, onReset, onRemove }) {
  const activeTimers = timers.filter((t) => !t.finished || t.remaining === 0);
  if (timers.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg max-w-md mx-auto">
      <div className="p-2 space-y-1.5 max-h-48 overflow-y-auto">
        {timers.map((t) => {
          const progress = t.totalSeconds > 0 ? (t.remaining / t.totalSeconds) * 100 : 0;
          const isFinished = t.finished || t.remaining === 0;

          return (
            <div
              key={t.id}
              className={`rounded-lg p-2 flex items-center gap-2 ${
                isFinished ? 'bg-[#EAF3DE] border border-[#6B8E4E]' : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs text-gray-600 truncate">⏱ {t.label}</span>
                  <span className={`text-sm font-mono font-medium ml-2 flex-shrink-0 ${isFinished ? 'text-[#6B8E4E]' : 'text-gray-800'}`}>
                    {isFinished ? '✓ Pronto!' : formatTime(t.remaining)}
                  </span>
                </div>
                {!isFinished && (
                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#C65D3B] rounded-full transition-all duration-1000"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {!isFinished && (
                  <button
                    onClick={() => onToggle(t.id)}
                    className="w-7 h-7 flex items-center justify-center bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 text-xs"
                    aria-label={t.running ? 'Pausa' : 'Riprendi'}
                  >
                    {t.running ? '⏸' : '▶'}
                  </button>
                )}
                <button
                  onClick={() => isFinished ? onRemove(t.id) : onReset(t.id)}
                  className="w-7 h-7 flex items-center justify-center bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 text-xs"
                  aria-label={isFinished ? 'Chiudi' : 'Reset'}
                >
                  {isFinished ? '✕' : '↺'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
