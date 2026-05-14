import { useCallback, useMemo, useRef, useState } from 'react';
import { TREBLE_TARGETS, type Note } from '../lib/notes';

export type Feedback =
  | { kind: 'idle' }
  | { kind: 'correct'; key: string }
  | { kind: 'wrong'; wrongKey: string; correctKey: string };

export interface NoteTrainer {
  target: Note;
  correct: number;
  wrong: number;
  feedback: Feedback;
  /** Returns true if the tapped note matched the target. */
  attempt: (note: Note) => boolean;
  reset: () => void;
}

function pickNextTarget(prev: Note | null, pool: Note[]): Note {
  if (pool.length <= 1) return pool[0];
  let next: Note;
  // Avoid immediate repeats so practice doesn't get monotonous.
  do {
    next = pool[Math.floor(Math.random() * pool.length)];
  } while (prev && next.midi === prev.midi);
  return next;
}

export function useNoteTrainer(pool: Note[] = TREBLE_TARGETS): NoteTrainer {
  const [target, setTarget] = useState<Note>(() => pickNextTarget(null, pool));
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>({ kind: 'idle' });
  const feedbackTimer = useRef<number | null>(null);

  const clearFeedbackLater = useCallback((ms: number) => {
    if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = window.setTimeout(() => {
      setFeedback({ kind: 'idle' });
      feedbackTimer.current = null;
    }, ms);
  }, []);

  const attempt = useCallback(
    (note: Note): boolean => {
      const isCorrect = note.midi === target.midi;
      if (isCorrect) {
        setCorrect((c) => c + 1);
        setFeedback({ kind: 'correct', key: note.toneId });
        clearFeedbackLater(400);
        setTarget((prev) => pickNextTarget(prev, pool));
      } else {
        setWrong((w) => w + 1);
        setFeedback({
          kind: 'wrong',
          wrongKey: note.toneId,
          correctKey: target.toneId,
        });
        clearFeedbackLater(600);
      }
      return isCorrect;
    },
    [target, pool, clearFeedbackLater],
  );

  const reset = useCallback(() => {
    setCorrect(0);
    setWrong(0);
    setFeedback({ kind: 'idle' });
    setTarget((prev) => pickNextTarget(prev, pool));
  }, [pool]);

  return useMemo(
    () => ({ target, correct, wrong, feedback, attempt, reset }),
    [target, correct, wrong, feedback, attempt, reset],
  );
}
