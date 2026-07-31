/** Kid-friendly word banks by difficulty (short → longer). */

const EASY = [
  'cat', 'dog', 'sun', 'run', 'fun', 'red', 'blue', 'fox', 'car', 'map',
  'hat', 'cup', 'bed', 'pen', 'box', 'bag', 'bee', 'jam', 'kit', 'net',
  'pig', 'zoo', 'yes', 'wow', 'hi', 'go', 'up', 'in', 'on', 'me',
]

const MEDIUM = [
  'race', 'play', 'jump', 'bird', 'fish', 'star', 'moon', 'cake', 'bike', 'tree',
  'home', 'love', 'kind', 'fast', 'slow', 'rain', 'snow', 'wind', 'leaf', 'book',
  'game', 'math', 'type', 'word', 'happy', 'smile', 'puppy', 'kitty', 'magic', 'friend',
]

const HARDER = [
  'rocket', 'planet', 'castle', 'dragon', 'forest', 'garden', 'purple', 'orange',
  'yellow', 'school', 'friend', 'family', 'typing', 'racing', 'unicorn', 'balloon',
  'sparkle', 'rainbow', 'adventure', 'keyboard', 'awesome', 'practice', 'victory',
]

export const TYPING_MAX_LEVEL = 5
/** Clears needed to advance one orbit — long enough for beginner typists. */
export const TYPING_CORRECT_PER_LEVEL = 8
export const TYPING_WRONG_TO_DROP = 3
export const TYPING_LEVEL_UP_BONUS = 50

export function pickWord(level: number, avoid: string[] = []): string {
  const clamped = Math.min(TYPING_MAX_LEVEL, Math.max(1, level))
  const pool =
    clamped <= 2
      ? EASY
      : clamped === 3
        ? MEDIUM
        : clamped === 4
          ? [...MEDIUM, ...HARDER.slice(0, 10)]
          : [...MEDIUM, ...HARDER]
  const filtered = pool.filter((w) => !avoid.includes(w))
  const source = filtered.length > 0 ? filtered : pool
  return source[Math.floor(Math.random() * source.length)]!
}

export type TypingLevelConfig = {
  fallSpeed: number
  maxWords: number
  spawnMs: number
  label: string
}

/** Fall speed = % of arena height per second — gentle ramp for young typists. */
export function typingConfigForLevel(level: number): TypingLevelConfig {
  const clamped = Math.min(TYPING_MAX_LEVEL, Math.max(1, level))
  if (clamped === 1)
    return { fallSpeed: 4.5, maxWords: 1, spawnMs: 3600, label: 'Orbit 1 · Slow float' }
  if (clamped === 2)
    return { fallSpeed: 5.5, maxWords: 1, spawnMs: 3200, label: 'Orbit 2 · Steady cruise' }
  if (clamped === 3)
    return { fallSpeed: 6.5, maxWords: 2, spawnMs: 2800, label: 'Orbit 3 · Twin rockets' }
  if (clamped === 4)
    return { fallSpeed: 8, maxWords: 2, spawnMs: 2400, label: 'Orbit 4 · Faster flight' }
  return { fallSpeed: 9.5, maxWords: 3, spawnMs: 2100, label: 'Orbit 5 · Star fleet' }
}
