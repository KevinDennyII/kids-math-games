import { randInt, type Rng } from '../rng'

export function echoGridSize(level: number): number {
  return Math.max(1, level) >= 6 ? 4 : 3
}

export function echoLength(level: number): number {
  const size = echoGridSize(level)
  return Math.min(2 + Math.max(1, level), size * size)
}

export type EchoTrial = {
  size: number
  sequence: number[]
}

export function makeEchoTrial(level: number, rng: Rng): EchoTrial {
  const size = echoGridSize(level)
  const length = echoLength(level)
  const cells = size * size
  const sequence: number[] = []
  while (sequence.length < length) {
    const next = randInt(rng, 0, cells)
    if (sequence[sequence.length - 1] === next) continue
    sequence.push(next)
  }
  return { size, sequence }
}

export function echoStep(
  sequence: number[],
  taps: number[],
): 'ok' | 'done' | 'miss' {
  const i = taps.length - 1
  if (i < 0 || taps[i] !== sequence[i]) return 'miss'
  if (taps.length === sequence.length) return 'done'
  return 'ok'
}
