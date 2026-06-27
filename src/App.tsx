import { useEffect, useState } from 'react';
import { Header, type Mode } from './components/Header';
import { LabView } from './components/LabView';
import { TrainerView } from './components/TrainerView';
import { usePianoSynth } from './hooks/usePianoSynth';
import { useLabAudio } from './hooks/useLabAudio';

function useDarkMode() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('pianolab.dark');
    if (saved !== null) return saved === '1';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('pianolab.dark', isDark ? '1' : '0');
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute('content', isDark ? '#0a0a0a' : '#fafafa');
  }, [isDark]);

  return [isDark, () => setIsDark((d) => !d)] as const;
}

export default function App() {
  const [isDark, toggleDark] = useDarkMode();
  const [mode, setMode] = useState<Mode>('lab');

  // Trainer keeps its own Tone-based piano; the Lab owns the shared raw +
  // sampler engine that feeds the visualizers.
  const synth = usePianoSynth();
  const audio = useLabAudio();

  return (
    <div className="app-bg min-h-screen flex flex-col text-neutral-900 dark:text-neutral-100">
      <div className="relative z-10 flex flex-col flex-1">
        <Header
          mode={mode}
          onModeChange={setMode}
          isDark={isDark}
          onToggleDark={toggleDark}
        />

        <main className="flex-1 flex flex-col">
          {mode === 'lab' ? (
            <LabView audio={audio} />
          ) : (
            <TrainerView synth={synth} isDark={isDark} />
          )}
        </main>
      </div>
    </div>
  );
}
