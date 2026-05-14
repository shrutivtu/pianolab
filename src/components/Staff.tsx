import { useEffect, useRef } from 'react';
import { Renderer, Stave, StaveNote, Formatter, Voice } from 'vexflow';
import type { Note } from '../lib/notes';

interface StaffProps {
  note: Note;
  /** 'wrong' tints the note red briefly; 'correct' tints green. */
  state?: 'idle' | 'correct' | 'wrong';
  isDark: boolean;
}

export function Staff({ note, state = 'idle', isDark }: StaffProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    host.innerHTML = '';

    const width = Math.min(host.clientWidth || 520, 640);
    const height = 180;

    const renderer = new Renderer(host, Renderer.Backends.SVG);
    renderer.resize(width, height);
    const ctx = renderer.getContext();

    const fg =
      state === 'correct'
        ? '#22c55e'
        : state === 'wrong'
          ? '#ef4444'
          : isDark
            ? '#f5f5f5'
            : '#171717';

    ctx.setFillStyle(fg);
    ctx.setStrokeStyle(fg);

    const staveX = 10;
    const staveWidth = width - 20;
    const stave = new Stave(staveX, 30, staveWidth);
    stave.addClef('treble');
    stave.setContext(ctx).draw();

    const staveNote = new StaveNote({
      keys: [note.vexKey],
      duration: 'w',
      clef: 'treble',
    });
    staveNote.setStyle({ fillStyle: fg, strokeStyle: fg });

    const voice = new Voice({ numBeats: 4, beatValue: 4 });
    voice.addTickables([staveNote]);

    new Formatter().joinVoices([voice]).format([voice], staveWidth - 80);

    // Center the note horizontally within the stave.
    const noteX = staveX + staveWidth / 2 - 30;
    staveNote.setXShift(noteX - staveNote.getAbsoluteX());

    voice.draw(ctx, stave);
  }, [note.vexKey, state, isDark]);

  return (
    <div
      ref={hostRef}
      className="staff w-full max-w-[640px] mx-auto"
      aria-label={`Target note ${note.pitch}${note.octave}`}
    />
  );
}
