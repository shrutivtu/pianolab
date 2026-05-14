import { useCallback, useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';

/**
 * Piano audio.
 *
 * Strategy:
 *   - A tiny PolySynth is always ready and plays the first taps instantly.
 *   - In parallel, the Salamander Grand Piano Sampler streams from the
 *     Tone.js-hosted samples. Once loaded, we switch over.
 *
 * The AudioContext is unlocked on the first user gesture (`unlock()`),
 * which must be called from a click/tap handler — browsers require this.
 */

const SAMPLE_BASE = 'https://tonejs.github.io/audio/salamander/';

const SAMPLE_MAP: Record<string, string> = {
  A0: 'A0.mp3',
  C1: 'C1.mp3',
  'D#1': 'Ds1.mp3',
  'F#1': 'Fs1.mp3',
  A1: 'A1.mp3',
  C2: 'C2.mp3',
  'D#2': 'Ds2.mp3',
  'F#2': 'Fs2.mp3',
  A2: 'A2.mp3',
  C3: 'C3.mp3',
  'D#3': 'Ds3.mp3',
  'F#3': 'Fs3.mp3',
  A3: 'A3.mp3',
  C4: 'C4.mp3',
  'D#4': 'Ds4.mp3',
  'F#4': 'Fs4.mp3',
  A4: 'A4.mp3',
  C5: 'C5.mp3',
  'D#5': 'Ds5.mp3',
  'F#5': 'Fs5.mp3',
  A5: 'A5.mp3',
  C6: 'C6.mp3',
};

export interface PianoSynth {
  /** Call from a user gesture before any audio plays. */
  unlock: () => Promise<void>;
  /** Play a single note (e.g. "C4", "F#4"). */
  play: (toneId: string) => void;
  /** True once the AudioContext is running. */
  ready: boolean;
  /** True once high-quality samples have loaded. */
  samplesLoaded: boolean;
}

export function usePianoSynth(): PianoSynth {
  const fallbackRef = useRef<Tone.PolySynth | null>(null);
  const samplerRef = useRef<Tone.Sampler | null>(null);
  const [ready, setReady] = useState(false);
  const [samplesLoaded, setSamplesLoaded] = useState(false);

  useEffect(() => {
    const fallback = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.005, decay: 0.2, sustain: 0.2, release: 1.2 },
      volume: -8,
    }).toDestination();
    fallbackRef.current = fallback;

    const sampler = new Tone.Sampler({
      urls: SAMPLE_MAP,
      release: 1,
      baseUrl: SAMPLE_BASE,
      onload: () => setSamplesLoaded(true),
    }).toDestination();
    samplerRef.current = sampler;

    return () => {
      fallback.dispose();
      sampler.dispose();
      fallbackRef.current = null;
      samplerRef.current = null;
    };
  }, []);

  const unlock = useCallback(async () => {
    if (Tone.getContext().state !== 'running') {
      await Tone.start();
    }
    setReady(true);
  }, []);

  const play = useCallback(
    (toneId: string) => {
      if (!ready) {
        // Schedule unlock + play together so the first tap still produces sound.
        void Tone.start().then(() => {
          setReady(true);
          const src =
            samplesLoaded && samplerRef.current
              ? samplerRef.current
              : fallbackRef.current;
          src?.triggerAttackRelease(toneId, '8n');
        });
        return;
      }
      const src =
        samplesLoaded && samplerRef.current
          ? samplerRef.current
          : fallbackRef.current;
      src?.triggerAttackRelease(toneId, '8n');
    },
    [ready, samplesLoaded],
  );

  return { unlock, play, ready, samplesLoaded };
}
