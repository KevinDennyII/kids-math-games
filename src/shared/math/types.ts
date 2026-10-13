export type GameId = 'race' | 'academy' | 'typing' | 'clock'
export type MathGameId = Extract<GameId, 'race' | 'academy'>

export type ProblemType =
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'division'
  | 'word-addition'
  | 'fractions'

/** Core ops shared by both kids’ games. */
export const ACADEMY_OPS = [
  'addition',
  'subtraction',
  'multiplication',
  'division',
] as const

/** Kenneth’s race track also includes fraction addition. */
export const RACE_OPS = [...ACADEMY_OPS, 'fractions'] as const

export const MATH_OPS = RACE_OPS

/** One independent math track. */
export type MathOp = (typeof MATH_OPS)[number]
export type MathOpMode = MathOp | 'mixed'
export type MathOpLevels = Record<MathOp, number>
export type MathOpProgress = Record<MathOp, AdaptiveState>

/** Icon used for visual word-addition prompts */
export type ProblemIcon = 'dog' | 'cat' | 'unicorn' | 'fox'

export const PROBLEM_ICON_LABELS: Record<ProblemIcon, string> = {
  dog: 'puppies',
  cat: 'kitties',
  unicorn: 'unicorns',
  fox: 'fox friends',
}

export type FractionParts = {
  numerator: number
  denominator: number
}

export interface Problem {
  id: string
  type: ProblemType
  /** Accessible text prompt (also used when no icons) */
  prompt: string
  /** Integer answer for non-fraction problems. */
  answer: number
  hint: string
  operands?: number[]
  /** When set, UI shows icon groups instead of crowded noun words */
  visualIcon?: ProblemIcon
  /** Stack operands (e.g. bigger multiplications) */
  layout?: 'horizontal' | 'vertical'
  /** Fraction addition prompt parts */
  fractionOperands?: [FractionParts, FractionParts]
  /** Expected fraction (any equivalent form counts as correct) */
  fractionAnswer?: FractionParts
}

export interface AdaptiveState {
  level: number
  correctStreak: number
  wrongStreak: number
  score: number
  bestStreak: number
  solved: number
  /** Attempts at the current level (for accuracy-based math leveling). */
  levelAttempts: number
  /** Correct answers at the current level. */
  levelCorrect: number
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
    levelAttempts: 0,
    levelCorrect: 0,
  }
}

/** Fill missing fields from older persisted saves. */
export function normalizeAdaptiveState(
  partial?: Partial<AdaptiveState> | null,
): AdaptiveState {
  const base = createAdaptiveState()
  if (!partial) return base
  return {
    level: partial.level ?? base.level,
    correctStreak: partial.correctStreak ?? base.correctStreak,
    wrongStreak: partial.wrongStreak ?? base.wrongStreak,
    score: partial.score ?? base.score,
    bestStreak: partial.bestStreak ?? base.bestStreak,
    solved: partial.solved ?? base.solved,
    levelAttempts: partial.levelAttempts ?? base.levelAttempts,
    levelCorrect: partial.levelCorrect ?? base.levelCorrect,
  }
}

export function mathOpFromProblemType(type: ProblemType): MathOp {
  if (type === 'word-addition') return 'addition'
  if (
    type === 'addition' ||
    type === 'subtraction' ||
    type === 'multiplication' ||
    type === 'division' ||
    type === 'fractions'
  ) {
    return type
  }
  return 'addition'
}

export function createMathOpProgress(): MathOpProgress {
  return {
    addition: createAdaptiveState(),
    subtraction: createAdaptiveState(),
    multiplication: createAdaptiveState(),
    division: createAdaptiveState(),
    fractions: createAdaptiveState(),
  }
}

export type MathGameProgress = {
  opMode: MathOpMode
  ops: MathOpProgress
  mixed: AdaptiveState
}

export function createMathGameProgress(opMode: MathOpMode = 'mixed'): MathGameProgress {
  return {
    opMode,
    ops: createMathOpProgress(),
    mixed: createAdaptiveState(),
  }
}

export function opsForGame(game: MathGameId): readonly MathOp[] {
  return game === 'race' ? RACE_OPS : ACADEMY_OPS
}
