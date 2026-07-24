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

export function pickWord(level: number, avoid: string[] = []): string {
  const pool =
    level <= 1 ? EASY : level === 2 ? MEDIUM : [...MEDIUM, ...HARDER]
  const filtered = pool.filter((w) => !avoid.includes(w))
  const source = filtered.length > 0 ? filtered : pool
  return source[Math.floor(Math.random() * source.length)]!
}

export type TypingLevelConfig = {
  fallSpeed: number
  maxWords: number
  spawnMs: number
}

/** Fall speed = % of arena height per second */
export function typingConfigForLevel(level: number): TypingLevelConfig {
  const clamped = Math.min(3, Math.max(1, level))
  if (clamped === 1) return { fallSpeed: 7.5, maxWords: 1, spawnMs: 2600 }
  if (clamped === 2) return { fallSpeed: 11, maxWords: 2, spawnMs: 2000 }
  return { fallSpeed: 15.5, maxWords: 3, spawnMs: 1500 }
}
