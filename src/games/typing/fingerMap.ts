/** Chester Creek–style finger colors for touch-typing. */
export type FingerId =
  | 'lp' // left pinky
  | 'lr' // left ring
  | 'lm' // left middle
  | 'li' // left index
  | 'ri' // right index
  | 'rm' // right middle
  | 'rr' // right ring
  | 'rp' // right pinky
  | 'th' // thumbs

export const FINGER_COLORS: Record<FingerId, string> = {
  lp: '#e74c3c',
  lr: '#27ae60',
  lm: '#f1c40f',
  li: '#3498db',
  ri: '#3498db',
  rm: '#f1c40f',
  rr: '#27ae60',
  rp: '#e74c3c',
  th: '#9b59b6',
}

export const FINGER_LABELS: Record<FingerId, string> = {
  lp: 'Left pinky',
  lr: 'Left ring',
  lm: 'Left middle',
  li: 'Left index',
  ri: 'Right index',
  rm: 'Right middle',
  rr: 'Right ring',
  rp: 'Right pinky',
  th: 'Thumbs',
}

export type KeyWide = 'sm' | 'md' | 'lg'

/** One physical key on the on-screen board. */
export type KeyDef = {
  id: string
  /** Visible label on the keycap. */
  label: string
  /** Wider than a letter key (tab / caps / shift). */
  wide?: KeyWide
  /**
   * Guide-only key — colored by finger but not typed in drills
   * (helps kids see pinky parking spots like caps / shift).
   */
  decorative?: boolean
}

/** Letter / symbol → finger (standard QWERTY US touch typing). */
export const LETTER_FINGER: Record<string, FingerId> = {
  // Left pinky zone
  tab: 'lp',
  caps: 'lp',
  'shift-l': 'lp',
  '`': 'lp',
  '1': 'lp',
  q: 'lp',
  a: 'lp',
  z: 'lp',
  // Left ring
  '2': 'lr',
  w: 'lr',
  s: 'lr',
  x: 'lr',
  // Left middle
  '3': 'lm',
  e: 'lm',
  d: 'lm',
  c: 'lm',
  // Left index
  '4': 'li',
  '5': 'li',
  r: 'li',
  t: 'li',
  f: 'li',
  g: 'li',
  v: 'li',
  b: 'li',
  // Right middle
  '8': 'rm',
  i: 'rm',
  k: 'rm',
  // Right ring
  '9': 'rr',
  o: 'rr',
  l: 'rr',
  '.': 'rr',
  // Right index (incl. comma)
  '6': 'ri',
  '7': 'ri',
  y: 'ri',
  u: 'ri',
  h: 'ri',
  j: 'ri',
  n: 'ri',
  m: 'ri',
  ',': 'ri',
  // Right pinky
  '0': 'rp',
  '-': 'rp',
  '=': 'rp',
  p: 'rp',
  '[': 'rp',
  ']': 'rp',
  '\\': 'rp',
  ';': 'rp',
  "'": 'rp',
  '/': 'rp',
  'shift-r': 'rp',
}

/**
 * Full letter board with pinky guide keys + punctuation so kids can see
 * where each finger (including left pinky on tab/caps/shift/A) belongs.
 */
export const KEYBOARD_ROWS: KeyDef[][] = [
  [
    { id: 'tab', label: 'tab', wide: 'md', decorative: true },
    { id: 'q', label: 'Q' },
    { id: 'w', label: 'W' },
    { id: 'e', label: 'E' },
    { id: 'r', label: 'R' },
    { id: 't', label: 'T' },
    { id: 'y', label: 'Y' },
    { id: 'u', label: 'U' },
    { id: 'i', label: 'I' },
    { id: 'o', label: 'O' },
    { id: 'p', label: 'P' },
    { id: '[', label: '[' },
    { id: ']', label: ']' },
  ],
  [
    { id: 'caps', label: 'caps', wide: 'lg', decorative: true },
    { id: 'a', label: 'A' },
    { id: 's', label: 'S' },
    { id: 'd', label: 'D' },
    { id: 'f', label: 'F' },
    { id: 'g', label: 'G' },
    { id: 'h', label: 'H' },
    { id: 'j', label: 'J' },
    { id: 'k', label: 'K' },
    { id: 'l', label: 'L' },
    { id: ';', label: ';' },
    { id: "'", label: "'" },
  ],
  [
    { id: 'shift-l', label: 'shift', wide: 'lg', decorative: true },
    { id: 'z', label: 'Z' },
    { id: 'x', label: 'X' },
    { id: 'c', label: 'C' },
    { id: 'v', label: 'V' },
    { id: 'b', label: 'B' },
    { id: 'n', label: 'N' },
    { id: 'm', label: 'M' },
    { id: ',', label: ',' },
    { id: '.', label: '.' },
    { id: '/', label: '/' },
    { id: 'shift-r', label: 'shift', wide: 'lg', decorative: true },
  ],
]

/** Home-row resting keys (F/J bumps; ; is right-pinky home). */
export const HOME_KEYS = new Set(['a', 's', 'd', 'f', 'j', 'k', 'l', ';'])

export function fingerForLetter(letter: string): FingerId | null {
  return LETTER_FINGER[letter.toLowerCase()] ?? null
}

export function colorForLetter(letter: string): string {
  const finger = fingerForLetter(letter)
  return finger ? FINGER_COLORS[finger] : '#64748b'
}

/** Display label for coach chips (letters uppercase; symbols as-is). */
export function displayKeyLabel(key: string): string {
  if (key.length === 1 && /[a-z]/i.test(key)) return key.toUpperCase()
  if (key === 'shift-l' || key === 'shift-r') return 'shift'
  return key
}
