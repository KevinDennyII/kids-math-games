export type Rng = () => number

/** Deterministic 0–1 generator for trials and tests. */
export function mulberry32(seed: number): Rng {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

export function randInt(rng: Rng, minInclusive: number, maxExclusive: number): number {
  return minInclusive + Math.floor(rng() * (maxExclusive - minInclusive))
}

export function pick<T>(rng: Rng, items: readonly T[]): T {
  const item = items[randInt(rng, 0, items.length)]
  if (item === undefined) {
    throw new Error('pick() needs a non-empty list')
  }
  return item
}

export function shuffle<T>(rng: Rng, items: readonly T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = randInt(rng, 0, i + 1)
    const a = next[i]!
    next[i] = next[j]!
    next[j] = a
  }
  return next
}
