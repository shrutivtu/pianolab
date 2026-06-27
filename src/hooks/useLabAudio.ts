import { useCallback, useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';

/**
 * Lab audio engine.
 *
 * The teaching tools want clean, predictable spectra, so the default engine
 * is RAW Web Audio: one OscillatorNode per keypress with a selectable
 * waveform (sine / square / sawtooth / triangle) and a short AD envelope.
 *
 * A "realistic piano" engine is also available — it reuses the Tone.js
 * Salamander Grand sampler. Both engines share ONE AudioContext (Tone's raw
 * context) and route through the SAME master gain -> AnalyserNode -> output,
 * so the oscilloscope and spectrum visualize whichever source is playing.
 *
 * The AudioContext is unlocked on the first user gesture (browsers require it).
 */

export type Waveform = 'sine' | 'square' | 'sawtooth' | 'triangle';
export type Engine = 'synth' | 'piano';

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

export interface LabAudio {
  /** Call from a user gesture before any audio plays. */
  unlock: () => Promise<void>;
  /** True once the AudioContext is running. */
  ready: boolean;
  /** True once the realistic-piano samples have loaded. */
  samplesLoaded: boolean;
  /** Play a note. freq drives the raw synth; toneId drives the sampler. */
  play: (freq: number, toneId: string) => void;
  /** Shared analyser node the visualizers read from. */
  analyser: AnalyserNode | null;
  waveform: Waveform;
  setWaveform: (w: Waveform) => void;
  engine: Engine;
  setEngine: (e: Engine) => void;
}

export function useLabAudio(): LabAudio {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const samplerRef = useRef<Tone.Sampler | null>(null);

  const [ready, setReady] = useState(false);
  const [samplesLoaded, setSamplesLoaded] = useState(false);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [waveform, setWaveform] = useState<Waveform>('sine');
  const [engine, setEngine] = useState<Engine>('synth');

  // Keep the latest waveform/engine readable inside the stable play() callback.
  const waveformRef = useRef(waveform);
  const engineRef = useRef(engine);
  useEffect(() => {
    waveformRef.current = waveform;
  }, [waveform]);
  useEffect(() => {
    engineRef.current = engine;
  }, [engine]);

  /** Build the shared graph once the context exists. Idempotent. */
  const ensureGraph = useCallback(() => {
    if (analyserRef.current) return;
    const ctx = Tone.getContext().rawContext as unknown as AudioContext;
    ctxRef.current = ctx;

    const analyserNode = ctx.createAnalyser();
    analyserNode.fftSize = 2048;
    analyserNode.smoothingTimeConstant = 0.8;

    const master = ctx.createGain();
    master.gain.value = 0.9;

    master.connect(analyserNode);
    analyserNode.connect(ctx.destination);

    masterRef.current = master;
    analyserRef.current = analyserNode;
    setAnalyser(analyserNode);

    // Realistic-piano sampler, routed through the same master -> analyser.
    const sampler = new Tone.Sampler({
      urls: SAMPLE_MAP,
      release: 1,
      baseUrl: SAMPLE_BASE,
      onload: () => setSamplesLoaded(true),
    });
    sampler.connect(master);
    samplerRef.current = sampler;
  }, []);

  const unlock = useCallback(async () => {
    if (Tone.getContext().state !== 'running') {
      await Tone.start();
    }
    ensureGraph();
    setReady(true);
  }, [ensureGraph]);

  const playSynth = useCallback((freq: number) => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = waveformRef.current;
    osc.frequency.setValueAtTime(freq, now);

    // Simple AD envelope so the note has a natural attack and decay,
    // and so we never click on start/stop.
    const env = ctx.createGain();
    const peak = 0.22;
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(peak, now + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);

    osc.connect(env);
    env.connect(master);
    osc.start(now);
    osc.stop(now + 1.15);
    osc.onended = () => {
      osc.disconnect();
      env.disconnect();
    };
  }, []);

  const play = useCallback(
    (freq: number, toneId: string) => {
      const fire = () => {
        if (engineRef.current === 'piano' && samplesLoaded && samplerRef.current) {
          samplerRef.current.triggerAttackRelease(toneId, '8n');
        } else {
          playSynth(freq);
        }
      };
      if (!ready) {
        // First tap also unlocks, so it still produces sound.
        void unlock().then(fire);
        return;
      }
      fire();
    },
    [ready, samplesLoaded, unlock, playSynth],
  );

  useEffect(() => {
    return () => {
      samplerRef.current?.dispose();
      analyserRef.current?.disconnect();
      masterRef.current?.disconnect();
      samplerRef.current = null;
      analyserRef.current = null;
      masterRef.current = null;
    };
  }, []);

  return {
    unlock,
    ready,
    samplesLoaded,
    play,
    analyser,
    waveform,
    setWaveform,
    engine,
    setEngine,
  };
}
