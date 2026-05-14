import { ScoreDisplay } from './ScoreDisplay';

interface HeaderProps {
  correct: number;
  wrong: number;
  isDark: boolean;
  onToggleDark: () => void;
  onReset: () => void;
}

export function Header({
  correct,
  wrong,
  isDark,
  onToggleDark,
  onReset,
}: HeaderProps) {
  return (
    <header className="w-full border-b border-line dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/70 backdrop-blur">
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500" />
          <h1 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            PianoLab
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <ScoreDisplay correct={correct} wrong={wrong} />
          <button
            type="button"
            onClick={onReset}
            aria-label="Reset score"
            className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onToggleDark}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="size-8 rounded-md border border-line dark:border-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
          >
            {isDark ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="size-4"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="size-4"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
