export type GameId = 'race' | 'academy' | 'typing'

export type ProblemType =
  | 'addition'
  | 'multiplication'
  | 'fraction'
  | 'word-addition'

/** Icon used for visual word-addition prompts */
export type ProblemIcon = 'dog' | 'cat' | 'unicorn' | 'fox'

export interface Problem {
  id: string
  type: ProblemType
  /** Accessible text prompt (also used when no icons) */
  prompt: string
  answer: number
  hint: string
  operands?: number[]
  /** When set, UI shows icon groups instead of crowded noun words */
  visualIcon?: ProblemIcon
}

export interface AdaptiveState {
  level: number
  correctStreak: number
  wrongStreak: number
  score: number
  bestStreak: number
  solved: number
}

export const MIN_LEVEL = 1
export const MAX_LEVEL = 3

export function createAdaptiveState(): AdaptiveState {
  return {
    level: 1,
    correctStreak: 0,
    wrongStreak: 0,
    score: 0,
    bestStreak: 0,
    solved: 0,
  }
}
