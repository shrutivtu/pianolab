import { useState } from 'react';
import { Staff } from './Staff';
import { Keyboard } from './Keyboard';
import { ScoreDisplay } from './ScoreDisplay';
import { useNoteTrainer } from '../hooks/useNoteTrainer';
import { TREBLE_TARGETS, type Note } from '../lib/notes';
import type { PianoSynth } from '../hooks/usePianoSynth';

interface TrainerViewProps {
  synth: PianoSynth;
  isDark: boolean;
}

/**
 * Sight-reading trainer: a note appears on the staff, you tap the matching
 * piano key, and it scores you. This is the app's original mode, now living
 * behind the "Trainer" tab.
 */
export function TrainerView({ synth, isDark }: TrainerViewProps) {
  const [showLabels, setShowLabels] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const trainer = useNoteTrainer(TREBLE_TARGETS);

  function handleKeyPress(note: Note) {
    setHasStarted(true);
    synth.play(note.toneId);
    trainer.attempt(note);
  }

  const staffState =
    trainer.feedback.kind === 'wrong'
      ? 'wrong'
      : trainer.feedback.kind === 'correct'
        ? 'correct'
        : 'idle';

  const labelMidis = TREBLE_TARGETS.map((n) => n.midi);

  return (
    <>
      <section className="flex-1 flex flex-col items-center justify-center px-4 pt-6 pb-4">
        <div className="mb-3 flex items-center gap-4">
          <p className="text-center text-xs uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500">
            Tap the piano key that matches the note
          </p>
          <ScoreDisplay correct={trainer.correct} wrong={trainer.wrong} />
          <button
            type="button"
            onClick={trainer.reset}
            className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
          >
            Reset
          </button>
        </div>
        <Staff note={trainer.target} state={staffState} isDark={isDark} />
        <div className="mt-4 flex flex-col items-center gap-1">
          <p className="text-center text-base sm:text-lg text-neutral-700 dark:text-neutral-200">
            Find{' '}
            <span className="font-semibold text-violet-600 dark:text-violet-400 text-xl sm:text-2xl">
              {trainer.target.pitch}
            </span>{' '}
            on the piano
          </p>
          <p className="text-center text-xs text-neutral-500 dark:text-neutral-400 min-h-[16px]">
            {trainer.feedback.kind === 'wrong'
              ? 'Not quite — the correct key is highlighted in orange'
              : trainer.feedback.kind === 'correct'
                ? 'Nice!'
                : !synth.samplesLoaded && synth.ready
                  ? 'Loading piano sound…'
                  : ' '}
          </p>
        </div>
      </section>

      <section className="px-3 sm:px-6 pb-6 sm:pb-10">
        <Keyboard
          onPress={handleKeyPress}
          feedback={trainer.feedback}
          showLabels={showLabels}
          labelMidis={labelMidis}
          hintMidi={hasStarted ? null : trainer.target.midi}
        />
        <div className="flex justify-center mt-4">
          <label className="inline-flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 cursor-pointer select-none">
            <span className="relative inline-block">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
                className="sr-only peer"
              />
              <span className="block w-8 h-[18px] rounded-full bg-neutral-300 dark:bg-neutral-700 peer-checked:bg-violet-500 transition-colors" />
              <span className="absolute top-0.5 left-0.5 size-[14px] rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-[14px]" />
            </span>
            Show note names
          </label>
        </div>
      </section>
    </>
  );
}
