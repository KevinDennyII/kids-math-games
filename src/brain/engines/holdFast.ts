import { type Rng } from '../rng'

export type GoKind = 'go' | 'nogo'

export type GoEvent = {
  kind: GoKind
  windowMs: number
}

export function goWindowMs(level: number): number {
  return Math.max(480, 1150 - (Math.max(1, level) - 1) * 70)
}

export function goRoundLength(level: number): number {
  return Math.min(20, 8 + Math.max(1, level))
}

export function makeGoRound(level: number, rng: Rng): GoEvent[] {
  const count = goRoundLength(level)
  const nogoRatio = Math.min(0.42, 0.18 + (Math.max(1, level) - 1) * 0.03)
  const windowMs = goWindowMs(level)
  const events: GoEvent[] = Array.from({ length: count }, () => ({
    kind: rng() < nogoRatio ? 'nogo' : 'go',
    windowMs,
  }))

  const nogoCount = events.filter((event) => event.kind === 'nogo').length
  if (nogoCount === 0) {
    events[Math.min(3, events.length - 1)] = { kind: 'nogo', windowMs }
  }
  if (nogoCount === count) {
    events[0] = { kind: 'go', windowMs }
    events[1] = { kind: 'go', windowMs }
  }
  return events
}

export type GoAction = 'tap' | 'timeout'

export function gradeGo(event: GoEvent, action: GoAction): boolean {
  if (event.kind === 'go') return action === 'tap'
  return action === 'timeout'
}
