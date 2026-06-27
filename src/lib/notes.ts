/**
 * Note model.
 *
 * Designed to be extended later (full piano range, sharps/flats, bass clef),
 * so today's 5-note subset is just a filtered selection — not the model itself.
 */

export type PitchClass = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
export type Accidental = '' | '#' | 'b';
export type Clef = 'treble' | 'bass';

export interface Note {
  /** Pitch class (letter name). */
  pitch: PitchClass;
  /** Accidental — '' (natural), '#' (sharp), 'b' (flat). */
  accidental: Accidental;
  /** Scientific-pitch octave number. Middle C = C4. */
  octave: number;
  /** MIDI number (Middle C = 60). */
  midi: number;
  /** Tone.js / Web-audio note identifier, e.g. "C4", "F#4", "Bb3". */
  toneId: string;
  /** VexFlow key string, e.g. "c/4", "f#/4", "bb/3". */
  vexKey: string;
}

const PITCH_TO_SEMITONE: Record<PitchClass, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

function accidentalOffset(a: Accidental): number {
  if (a === '#') return 1;
  if (a === 'b') return -1;
  return 0;
}

export function buildNote(
  pitch: PitchClass,
  octave: number,
  accidental: Accidental = '',
): Note {
  const midi =
    12 * (octave + 1) + PITCH_TO_SEMITONE[pitch] + accidentalOffset(accidental);
  const toneId = `${pitch}${accidental}${octave}`;
  const vexKey = `${pitch.toLowerCase()}${accidental}/${octave}`;
  return { pitch, accidental, octave, midi, toneId, vexKey };
}

/** Build a continuous range of MIDI notes (inclusive). */
export function noteRange(fromMidi: number, toMidi: number): Note[] {
  const notes: Note[] = [];
  // C-major rooted ordering — we walk MIDI numbers and resolve each one
  // into a natural or sharp note. We choose sharp spelling by default;
  // this can be revisited when flats are introduced.
  const SHARP_SPELLING: Array<{ pitch: PitchClass; accidental: Accidental }> = [
    { pitch: 'C', accidental: '' },
    { pitch: 'C', accidental: '#' },
    { pitch: 'D', accidental: '' },
    { pitch: 'D', accidental: '#' },
    { pitch: 'E', accidental: '' },
    { pitch: 'F', accidental: '' },
    { pitch: 'F', accidental: '#' },
    { pitch: 'G', accidental: '' },
    { pitch: 'G', accidental: '#' },
    { pitch: 'A', accidental: '' },
    { pitch: 'A', accidental: '#' },
    { pitch: 'B', accidental: '' },
  ];

  for (let m = fromMidi; m <= toMidi; m++) {
    const octave = Math.floor(m / 12) - 1;
    const spelling = SHARP_SPELLING[m % 12];
    notes.push(buildNote(spelling.pitch, octave, spelling.accidental));
  }
  return notes;
}

export const MIDDLE_C_MIDI = 60;

/** Keyboard range for this MVP: C3 to C5 (two octaves + 1). */
export const KEYBOARD_RANGE: Note[] = noteRange(48, 72);

/** The 5-note target pool for the current trainer mode. */
export const TREBLE_TARGETS: Note[] = [
  buildNote('C', 4),
  buildNote('D', 4),
  buildNote('E', 4),
  buildNote('F', 4),
  buildNote('G', 4),
];

export function isNaturalWhiteKey(note: Note): boolean {
  return note.accidental === '';
}

/**
 * MIDI number -> frequency in Hz, equal temperament with A4 (MIDI 69) = 440 Hz.
 * This is the f = 440 × 2^((m-69)/12) relationship the Lab teaches.
 */
export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}
