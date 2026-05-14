import { useMemo } from 'react';
import { KEYBOARD_RANGE, isNaturalWhiteKey, type Note } from '../lib/notes';
import type { Feedback } from '../hooks/useNoteTrainer';

interface KeyboardProps {
  onPress: (note: Note) => void;
  feedback: Feedback;
  showLabels: boolean;
  /** White-key letters to overlay when showLabels is on (e.g. C,D,E,F,G). */
  labelPitches?: Array<Note['pitch']>;
  /** Only these MIDI numbers (if provided) will show overlay labels. */
  labelMidis?: number[];
  /** Optional: pulse a soft glow on this MIDI (used to hint before first tap). */
  hintMidi?: number | null;
}

/**
 * Two-octave piano (C3–C5). White keys laid out as a flex row; black keys
 * absolutely positioned over the boundary between adjacent whites.
 */
export function Keyboard({
  onPress,
  feedback,
  showLabels,
  labelMidis,
  hintMidi,
}: KeyboardProps) {
  const whites = useMemo(
    () => KEYBOARD_RANGE.filter(isNaturalWhiteKey),
    [],
  );
  const blacks = useMemo(
    () => KEYBOARD_RANGE.filter((n) => !isNaturalWhiteKey(n)),
    [],
  );

  // For each black key, find its position: it sits at the right edge of the
  // white key whose pitch matches its "natural" letter (D# sits on D, etc.).
  const blackPositions = useMemo(() => {
    return blacks.map((b) => {
      const naturalIdx = whites.findIndex(
        (w) => w.pitch === b.pitch && w.octave === b.octave,
      );
      // Center the black key on the boundary between this white and the next.
      const leftPct = ((naturalIdx + 1) / whites.length) * 100;
      return { note: b, leftPct };
    });
  }, [whites, blacks]);

  const labelSet = useMemo(
    () => (labelMidis ? new Set(labelMidis) : null),
    [labelMidis],
  );

  function stateClassesFor(note: Note): string {
    if (feedback.kind === 'correct' && feedback.key === note.toneId) {
      return 'animate-flash-green';
    }
    if (feedback.kind === 'wrong') {
      if (feedback.wrongKey === note.toneId) return 'animate-flash-red';
      if (feedback.correctKey === note.toneId) return 'animate-flash-amber';
    }
    return '';
  }

  return (
    <div className="w-full max-w-[820px] mx-auto select-none">
      <div className="relative w-full" style={{ aspectRatio: '7 / 3' }}>
        {/* White keys */}
        <div className="absolute inset-0 flex rounded-xl overflow-hidden border border-line dark:border-line-dark shadow-sm">
          {whites.map((w) => {
            const flash = stateClassesFor(w);
            const showLabel =
              showLabels && (!labelSet || labelSet.has(w.midi));
            const isHint = hintMidi != null && w.midi === hintMidi;
            return (
              <button
                key={w.toneId}
                type="button"
                aria-label={`${w.pitch}${w.octave}`}
                onPointerDown={(e) => {
                  e.preventDefault();
                  onPress(w);
                }}
                className={[
                  'relative flex-1 bg-white text-neutral-700',
                  'border-r border-neutral-200 last:border-r-0',
                  'active:bg-neutral-100',
                  'transition-colors duration-150',
                  'flex items-end justify-center pb-3',
                  'min-h-[140px] touch-manipulation',
                  isHint ? 'ring-4 ring-inset ring-violet-400 z-10' : '',
                  flash,
                ].join(' ')}
              >
                <span
                  className={[
                    'text-xs font-medium tracking-wide',
                    showLabel ? 'opacity-70' : 'opacity-0',
                    'transition-opacity duration-200',
                  ].join(' ')}
                >
                  {w.pitch}
                </span>
              </button>
            );
          })}
        </div>

        {/* Black keys */}
        <div className="absolute inset-0 pointer-events-none">
          {blackPositions.map(({ note, leftPct }) => {
            const flash = stateClassesFor(note);
            return (
              <button
                key={note.toneId}
                type="button"
                aria-label={`${note.pitch}${note.accidental}${note.octave}`}
                onPointerDown={(e) => {
                  e.preventDefault();
                  onPress(note);
                }}
                style={{
                  left: `calc(${leftPct}% - 4.2%)`,
                  width: '8.4%',
                  height: '62%',
                }}
                className={[
                  'absolute top-0 pointer-events-auto',
                  'bg-neutral-900 dark:bg-neutral-950',
                  'border border-neutral-800',
                  'rounded-b-md shadow-md',
                  'active:translate-y-[1px] transition-transform duration-75',
                  'touch-manipulation',
                  flash,
                ].join(' ')}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
