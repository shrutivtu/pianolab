# PianoLab

**An interactive piano that lets you see and hear the physics of sound.**

Play a note and you don't just hear it — you watch what the sound actually *is*: its waveform on an oscilloscope and its harmonic content on a live frequency spectrum, both reacting in real time. It turns a piano into a hands-on lab for how audio works, bridging music, physics, and audio engineering.

<!-- Screenshot / GIF of the Lab goes here — a short clip of switching sine → square and watching the spectrum stack harmonics sells it instantly. -->

## Two modes

**Lab** — the core experience. Press a key and watch:

- an **oscilloscope** (the waveform — air pressure over time), and
- a **frequency spectrum** (an FFT — the same sound split into the frequencies it contains).

Switch the waveform between **sine, square, sawtooth, and triangle** and watch the spectrum change: a pure sine is a single spike, while square and saw stack up extra harmonics — which is exactly why they sound brighter. A **"realistic piano"** toggle swaps the raw synth for a sampled grand piano, routed through the same analyser so the visualizers track it too.

**Trainer** — a focused sight-reading drill. A note appears on a staff, you tap the matching key, and it scores you. Wrong tap? The correct key flashes amber as a hint.

## How it works

The whole thing runs on the **Web Audio API** and **canvas** — no audio libraries doing the heavy lifting for the visualizations.

- One shared `AudioContext` feeds a master gain → `AnalyserNode` → output.
- The Lab's default engine creates a raw `OscillatorNode` per keypress with a short envelope and a selectable waveform.
- The "realistic piano" engine reuses a Tone.js Salamander sampler, connected through the **same** analyser, so a single visualizer pipeline renders whichever source is playing.
- The oscilloscope reads `getByteTimeDomainData`; the spectrum reads `getByteFrequencyData`. Both draw to high-DPI canvases and settle to a calm baseline when silent (friendly to `prefers-reduced-motion`).
- The `AudioContext` is unlocked on the first user gesture, as browsers require.

## Tech

- **Web Audio API + Canvas** — oscillators, analyser, and the live visualizers
- Vite + React 19 + TypeScript
- Tailwind CSS (class-based dark mode)
- Tone.js — the sampled "realistic piano" engine
- VexFlow 5 — staff notation in the Trainer
- `vite-plugin-pwa` — installable, offline-capable

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173/`).

```bash
npm run build     # production build to dist/
npm run preview   # preview the production build
```

## Accessibility

Keyboard-playable, `aria` labels on keys and visualizers, ≥44px touch targets on phones, a light/dark toggle whose choice is persisted, and reduced-motion-friendly visualizers.

## Project layout

```
src/
  components/
    LabView.tsx        # the Lab: engine + waveform controls, visualizers, keyboard
    Oscilloscope.tsx   # time-domain waveform canvas
    Spectrum.tsx       # FFT frequency-spectrum canvas
    TrainerView.tsx    # sight-reading mode
    Keyboard.tsx       # shared two-octave on-screen piano
    Staff.tsx          # VexFlow staff for the Trainer
    Header.tsx         # Lab/Trainer tabs + dark-mode toggle
    ScoreDisplay.tsx
  hooks/
    useLabAudio.ts     # shared AudioContext, raw synth + sampler, analyser
    usePianoSynth.ts   # Tone.js piano used by the Trainer
    useNoteTrainer.ts  # Trainer state: target, score, feedback
  lib/
    notes.ts           # note model + midiToFreq (A4 = 440, equal temperament)
  App.tsx              # mode shell (Lab | Trainer)
  main.tsx
```

## Roadmap

Built so far: the Lab's core loop (playable synth + oscilloscope + spectrum), waveform selection, the realistic-piano engine, and the Trainer mode. Planned next:

- Per-key frequency labels and the equal-temperament relationship, `f = 440 × 2^(n/12)`
- An additive-synthesis panel — stack harmonics and watch a sine build toward a square/saw (Fourier, made visible)
- An ADSR envelope visualizer
- Two-note **beat frequency** / interference and interval ratios (octave 2:1, fifth 3:2)
- A low-pass / high-pass `BiquadFilterNode` — the bridge from physics to EQ
- Web MIDI input

## License

MIT
