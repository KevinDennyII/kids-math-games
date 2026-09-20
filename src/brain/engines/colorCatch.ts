import { pick, type Rng } from '../rng'

export const STROOP_INK = ['red', 'blue', 'green', 'gold'] as const
export type StroopInk = (typeof STROOP_INK)[number]

export const STROOP_LABELS: Record<StroopInk, string> = {
  red: 'RED',
  blue: 'BLUE',
  green: 'GREEN',
  gold: 'GOLD',
}

export type StroopTrial = {
  word: StroopInk
  ink: StroopInk
  congruent: boolean
  deadlineMs: number
}

export function stroopDeadlineMs(level: number): number {
  return Math.max(1400, 4200 - (Math.max(1, level) - 1) * 280)
}

export function makeStroopTrial(level: number, rng: Rng): StroopTrial {
  const word = pick(rng, STROOP_INK)
  const incongruentChance = Math.min(0.88, 0.4 + (Math.max(1, level) - 1) * 0.06)
  const congruent = rng() > incongruentChance
  const ink = congruent
    ? word
    : pick(
        rng,
        STROOP_INK.filter((color) => color !== word),
      )
  return { word, ink, congruent, deadlineMs: stroopDeadlineMs(level) }
}

export function gradeStroop(trial: StroopTrial, choice: StroopInk): boolean {
  return choice === trial.ink
}
