export type Mode = 'lab' | 'trainer';

interface HeaderProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  isDark: boolean;
  onToggleDark: () => void;
}

const TABS: Array<{ id: Mode; label: string }> = [
  { id: 'lab', label: 'Lab' },
  { id: 'trainer', label: 'Trainer' },
];

export function Header({ mode, onModeChange, isDark, onToggleDark }: HeaderProps) {
  return (
    <header className="w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/70 backdrop-blur">
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500" />
          <h1 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            PianoLab
          </h1>
        </div>

        <nav
          aria-label="Mode"
          className="flex items-center gap-1 rounded-xl glass p-0.5"
        >
          {TABS.map((tab) => {
            const active = mode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onModeChange(tab.id)}
                aria-current={active ? 'page' : undefined}
                className={[
                  'px-3.5 py-1 text-sm font-medium rounded-lg transition-all duration-150',
                  active
                    ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-[0_4px_14px_-2px_rgba(139,92,246,0.6)]'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200',
                ].join(' ')}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={onToggleDark}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="size-8 shrink-0 rounded-md border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
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
    </header>
  );
}
