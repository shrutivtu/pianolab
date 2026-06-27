import { useState } from 'react';
import { Keyboard } from './Keyboard';
import { Oscilloscope } from './Oscilloscope';
import { Spectrum } from './Spectrum';
import { midiToFreq, type Note } from '../lib/notes';
import type { LabAudio, Waveform } from '../hooks/useLabAudio';

interface LabViewProps {
  audio: LabAudio;
}

const WAVEFORMS: Array<{ id: Waveform; label: string }> = [
  { id: 'sine', label: 'Sine' },
  { id: 'square', label: 'Square' },
  { id: 'sawtooth', label: 'Saw' },
  { id: 'triangle', label: 'Triangle' },
];

/**
 * The Lab: play a key, hear it, and watch what the sound actually IS —
 * its waveform (oscilloscope) and its harmonic content (spectrum) in real
 * time. This is the core "aha" loop the whole project hangs off.
 */
export function LabView({ audio }: LabViewProps) {
  const [last, setLast] = useState<Note | null>(null);

  function handleKeyPress(note: Note) {
    setLast(note);
    audio.play(midiToFreq(note.midi), note.toneId);
  }

  const isSynth = audio.engine === 'synth';

  return (
    <section className="flex-1 flex flex-col px-4 sm:px-6 py-8 gap-7 max-w-[980px] mx-auto w-full">
      {/* Hero */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-400 bg-clip-text text-transparent">
          See the physics of sound
        </h2>
        <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
          Play a key — hear it, and watch the waveform and its harmonics react
          in real time.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-3">
        <Segmented label="Sound engine">
          <SegButton active={isSynth} onClick={() => audio.setEngine('synth')}>
            Synth
          </SegButton>
          <SegButton active={!isSynth} onClick={() => audio.setEngine('piano')}>
            Realistic piano
          </SegButton>
        </Segmented>

        <Segmented
          label="Waveform"
          className={
            isSynth ? 'opacity-100' : 'opacity-40 pointer-events-none'
          }
        >
          {WAVEFORMS.map((w) => (
            <SegButton
              key={w.id}
              active={audio.waveform === w.id}
              onClick={() => audio.setWaveform(w.id)}
            >
              {w.label}
            </SegButton>
          ))}
        </Segmented>
      </div>

      {/* Visualizers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <figure className="glass rounded-2xl p-3 shadow-sm">
          <figcaption className="flex items-center justify-between px-1 pb-2 text-xs font-medium">
            <span className="text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Waveform · time
            </span>
            <span className="tabular-nums text-violet-600 dark:text-violet-300">
              {last
                ? `${last.pitch}${last.accidental}${last.octave} · ${midiToFreq(last.midi).toFixed(1)} Hz`
                : '—'}
            </span>
          </figcaption>
          <Oscilloscope analyser={audio.analyser} />
        </figure>

        <figure className="glass rounded-2xl p-3 shadow-sm">
          <figcaption className="flex items-center justify-between px-1 pb-2 text-xs font-medium">
            <span className="text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Spectrum · harmonics
            </span>
            <span className="text-neutral-400 dark:text-neutral-500">
              low → high
            </span>
          </figcaption>
          <Spectrum analyser={audio.analyser} />
        </figure>
      </div>

      {/* Keyboard */}
      <Keyboard onPress={handleKeyPress} feedback={{ kind: 'idle' }} showLabels />

      {/* Explain card */}
      <div className="glass max-w-[780px] mx-auto rounded-2xl p-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300 shadow-sm">
        <p>
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
            What you're seeing.
          </span>{' '}
          The left panel is the <em>waveform</em> — air pressure over time. The
          right panel is the <em>spectrum</em> — the same sound split into the
          frequencies it contains. A pure <strong>sine</strong> shows a single
          spike; <strong>square</strong> and <strong>saw</strong> stack up extra
          harmonics, which is exactly why they sound brighter. Switch waveforms
          and watch the spectrum change.
        </p>
      </div>
    </section>
  );
}

function Segmented({
  label,
  className = '',
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={[
        'flex items-center gap-1 rounded-xl glass p-1 shadow-sm transition-opacity',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

function SegButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        'px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-150',
        active
          ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-[0_4px_14px_-2px_rgba(139,92,246,0.6)]'
          : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-black/5 dark:hover:bg-white/5',
      ].join(' ')}
    >
      {children}
    </button>
  );
}
