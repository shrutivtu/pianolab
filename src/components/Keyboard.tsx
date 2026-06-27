import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

  // Explicit press highlight: a CSS :active state is too brief to notice on a
  // quick tap, so we hold a visible "pressed" state for ~160ms per key.
  const [pressed, setPressed] = useState<Set<string>>(() => new Set());
  const timers = useRef<Map<string, number>>(new Map());

  const triggerPress = useCallback((id: string) => {
    setPressed((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    const existing = timers.current.get(id);
    if (existing) window.clearTimeout(existing);
    const t = window.setTimeout(() => {
      setPressed((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      timers.current.delete(id);
    }, 160);
    timers.current.set(id, t);
  }, []);

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach((t) => window.clearTimeout(t));
  }, []);

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
    <div className="w-full max-w-[840px] mx-auto select-none">
      <div className="relative w-full" style={{ aspectRatio: '7 / 3' }}>
        {/* White keys */}
        <div className="absolute inset-0 flex rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.45)] ring-1 ring-black/5">
          {whites.map((w) => {
            const flash = stateClassesFor(w);
            const isPressed = pressed.has(w.toneId);
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
                  triggerPress(w.toneId);
                  onPress(w);
                }}
                className={[
                  'relative flex-1 bg-white text-neutral-600',
                  'border-r border-neutral-200/80 last:border-r-0',
                  'transition-all duration-100',
                  'flex items-end justify-center pb-3',
                  'min-h-[140px] touch-manipulation',
                  isPressed
                    ? 'bg-violet-100 translate-y-[1.5px] shadow-[inset_0_-4px_14px_-2px_rgba(139,92,246,0.6)] z-10'
                    : 'shadow-[inset_0_-8px_12px_-8px_rgba(0,0,0,0.22)]',
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
            const isPressed = pressed.has(note.toneId);
            return (
              <button
                key={note.toneId}
                type="button"
                aria-label={`${note.pitch}${note.accidental}${note.octave}`}
                onPointerDown={(e) => {
                  e.preventDefault();
                  triggerPress(note.toneId);
                  onPress(note);
                }}
                style={{
                  left: `calc(${leftPct}% - 4.2%)`,
                  width: '8.4%',
                  height: '62%',
                }}
                className={[
                  'absolute top-0 pointer-events-auto',
                  'bg-gradient-to-b from-neutral-700 to-neutral-950',
                  'border border-black/60',
                  'rounded-b-lg',
                  'transition-all duration-75',
                  'touch-manipulation',
                  isPressed
                    ? 'translate-y-[1.5px] brightness-150 shadow-[0_2px_4px_rgba(0,0,0,0.5),0_0_18px_rgba(139,92,246,0.85)] z-20'
                    : 'shadow-[0_5px_8px_rgba(0,0,0,0.5),inset_0_2px_2px_rgba(255,255,255,0.14)]',
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
