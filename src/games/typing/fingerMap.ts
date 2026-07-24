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

/** Letter → finger (standard QWERTY US touch typing). */
export const LETTER_FINGER: Record<string, FingerId> = {
  q: 'lp',
  a: 'lp',
  z: 'lp',
  w: 'lr',
  s: 'lr',
  x: 'lr',
  e: 'lm',
  d: 'lm',
  c: 'lm',
  r: 'li',
  f: 'li',
  v: 'li',
  t: 'li',
  g: 'li',
  b: 'li',
  y: 'ri',
  h: 'ri',
  n: 'ri',
  u: 'ri',
  j: 'ri',
  m: 'ri',
  i: 'rm',
  k: 'rm',
  o: 'rr',
  l: 'rr',
  p: 'rp',
}

export const KEYBOARD_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
] as const

/** Home-row resting keys (F/J have bumps). */
export const HOME_KEYS = new Set(['a', 's', 'd', 'f', 'j', 'k', 'l'])

export function fingerForLetter(letter: string): FingerId | null {
  return LETTER_FINGER[letter.toLowerCase()] ?? null
}

export function colorForLetter(letter: string): string {
  const finger = fingerForLetter(letter)
  return finger ? FINGER_COLORS[finger] : '#64748b'
}
