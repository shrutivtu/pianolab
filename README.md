# PianoLab

A focused one-screen web app for learning to read piano notes. A note appears on a music staff, you tap the matching key on the on-screen piano, you hear it. Wrong tap? The correct key flashes amber as a hint. That's it.

This is a weekend-MVP build of the **Note Trainer** — purposefully one feature, done well.

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173/`).

## Build

```bash
npm run build       # production build to dist/
npm run preview     # preview the production build locally
```

## Deploy to Vercel (one-click-ish)

1. Push this folder to a GitHub repo.
2. In Vercel: **Add New → Project → Import** the repo.
3. Vercel auto-detects Vite. Defaults are fine:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Click **Deploy**.

No environment variables required.

## Install as a PWA

- **iOS**: open in Safari → Share → Add to Home Screen.
- **Android / Desktop Chrome**: address-bar install icon, or three-dot menu → Install.

The app shell, fonts, and Salamander piano samples are cached for offline use after the first run.

## What's in it

- **Treble clef, 5 notes** (C4 D4 E4 F4 G4) shown as whole notes, one at a time.
- **Two-octave keyboard** (C3–C5), responsive, ≥44px touch targets on phones.
- **Tone.js Sampler** with the Salamander Grand Piano samples (hosted by Tone.js, no setup).
- **Tiny PolySynth fallback** plays instantly while samples load in the background.
- **Dark mode by default**, light/dark toggle in the header, preference persisted.
- **"Show note names" toggle** overlays C/D/E/F/G letters on the relevant white keys.
- **PWA-ready** out of the box: manifest, service worker, icons, `theme-color`, `apple-touch-icon`.

## Tech

- Vite + React 19 + TypeScript
- Tailwind CSS (dark mode via `class` strategy)
- Tone.js (Sampler + PolySynth fallback)
- VexFlow 5 (SVG renderer)
- `vite-plugin-pwa` (Workbox under the hood)

## Project layout

```
src/
  components/
    Staff.tsx          # renders current target note via VexFlow
    Keyboard.tsx       # two-octave on-screen piano
    Header.tsx         # title, score, reset, light/dark toggle
    ScoreDisplay.tsx
  hooks/
    usePianoSynth.ts   # Tone.js: sampler + instant-play fallback synth
    useNoteTrainer.ts  # game state: target, score, feedback, attempt()
  lib/
    notes.ts           # general note model — pitch, accidental, octave, MIDI, VexFlow key
  App.tsx
  main.tsx
```

## Design decisions (calls made on ambiguous points)

- **Audio unlock on first tap.** Browsers won't start audio without a user gesture. The first key press calls `Tone.start()`, and a "Tap any key to start" hint shows until then.
- **Instant audio via fallback synth.** The Salamander samples are several MB. A lightweight `Tone.PolySynth` is always ready and plays the first taps. When samples finish loading, the sampler takes over silently. The status line shows "Loading piano…" while this happens.
- **Wrong tap → amber, not red, on the correct key.** The wrong key flashes red as expected, but the *correct* key pulses **amber** (warm yellow) instead of red. Red-on-red felt punishing; amber reads more clearly as "here's the hint."
- **No immediate repeats.** Pure random would pick the same note 3× in a row sometimes; the trainer avoids picking the same note as the previous target.
- **Reset button in header.** The spec didn't mention how to reset score; a small "Reset" link lives in the header next to the dark-mode toggle.
- **Dark mode default.** Spec said default dark; system-preference is used the very first time, then the user's choice is persisted in `localStorage`.
- **Salamander samples are cached.** The service worker caches them on first load with a `CacheFirst` strategy so subsequent loads (including offline) are instant.

## Future-proofing (intentionally NOT built)

The note model in `src/lib/notes.ts` is general — pitch class, accidental, octave, MIDI, plus VexFlow and Tone.js identifiers. Adding bass clef, sharps, flats, or the full piano range is data-only — no model changes.

The keyboard renders from a `KEYBOARD_RANGE` array, and the trainer takes its target pool as a parameter (`useNoteTrainer(TREBLE_TARGETS)`). To add a "bass clef" mode, you'd pass a different pool and tell the Staff to draw a bass clef.

Input is loosely coupled: any input source (on-screen tap today, Web MIDI tomorrow) just needs to call `trainer.attempt(note)` and `synth.play(note.toneId)`. The MIDI hook will plug into the same handler.

The `App` shell is a single mode today; a mode-switcher would sit in the header without restructuring anything below.
