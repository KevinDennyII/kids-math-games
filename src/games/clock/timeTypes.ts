/** Clock-reading skills ordered by research-backed scaffolding. */
export const CLOCK_SKILLS = [
  'oclock',
  'half',
  'quarter',
  'five',
  'mixed',
] as const

export type ClockSkill = (typeof CLOCK_SKILLS)[number]
export type ClockMode = 'read' | 'set'

export const CLOCK_MAX_LEVEL = 5

export type ClockProblem = {
  id: string
  mode: ClockMode
  skill: ClockSkill
  /** 1–12 */
  hours: number
  /** 0–59 */
  minutes: number
  prompt: string
  hint: string
  /** Canonical digital label, e.g. "3:30" */
  answerDigital: string
  /** Spoken / word form, e.g. "half past 3" */
  answerWords: string
  /** Multiple-choice options for read mode (includes correct). */
  choices: string[]
}

export function skillForLevel(level: number): ClockSkill {
  const idx = Math.min(CLOCK_SKILLS.length, Math.max(1, level)) - 1
  return CLOCK_SKILLS[idx]!
}

export function skillLabel(skill: ClockSkill): string {
  switch (skill) {
    case 'oclock':
      return 'O’clock'
    case 'half':
      return 'Half past'
    case 'quarter':
      return 'Quarters'
    case 'five':
      return 'Count by 5s'
    case 'mixed':
      return 'Pro mix'
  }
}
