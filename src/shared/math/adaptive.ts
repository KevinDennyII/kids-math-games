import type { AdaptiveState } from './types'
import { MAX_LEVEL, MIN_LEVEL } from './types'

export type AnswerResult = {
  correct: boolean
  state: AdaptiveState
  leveledUp: boolean
  leveledDown: boolean
  pointsEarned: number
}

export type AdaptiveOptions = {
  /** Correct answers needed to gain a level. Default 3. */
  correctPerLevel?: number
  /** Cap for this game. Default MAX_LEVEL (3). */
  maxLevel?: number
  /** Wrong answers in a row before dropping a level. Default 2. */
  wrongToDrop?: number
  /**
   * When true (default), a wrong answer clears the correct streak.
   * Typing sets this false so kids keep orbit progress after a miss.
   */
  resetStreakOnWrong?: boolean
  /** Extra score awarded when leveling up. Default 0. */
  levelUpBonus?: number
}

/** After N correct → +1 level; after M wrong in a row → −1 level. */
export function applyAnswer(
  prev: AdaptiveState,
  correct: boolean,
  options: AdaptiveOptions = {},
): AnswerResult {
  const correctPerLevel = options.correctPerLevel ?? 3
  const maxLevel = options.maxLevel ?? MAX_LEVEL
  const wrongToDrop = options.wrongToDrop ?? 2
  const resetStreakOnWrong = options.resetStreakOnWrong ?? true
  const levelUpBonus = options.levelUpBonus ?? 0

  const next: AdaptiveState = { ...prev }
  let leveledUp = false
  let leveledDown = false
  let pointsEarned = 0

  if (correct) {
    next.correctStreak += 1
    next.wrongStreak = 0
    next.solved += 1
    pointsEarned = 10 + Math.min(next.correctStreak, 20) * 2
    next.score += pointsEarned
    next.bestStreak = Math.max(next.bestStreak, next.correctStreak)

    if (next.correctStreak > 0 && next.correctStreak % correctPerLevel === 0) {
      if (next.level < maxLevel) {
        next.level += 1
        leveledUp = true
        if (levelUpBonus > 0) {
          next.score += levelUpBonus
          pointsEarned += levelUpBonus
        }
      }
    }
  } else {
    next.wrongStreak += 1
    if (resetStreakOnWrong) {
      next.correctStreak = 0
    }

    if (next.wrongStreak >= wrongToDrop) {
      if (next.level > MIN_LEVEL) {
        next.level -= 1
        leveledDown = true
      }
      next.wrongStreak = 0
    }
  }

  return { correct, state: next, leveledUp, leveledDown, pointsEarned }
}

/** Words cleared toward the next orbit (0 … correctPerLevel-1). */
export function progressTowardNextLevel(
  streak: number,
  correctPerLevel: number,
): number {
  if (correctPerLevel <= 0) return 0
  return streak % correctPerLevel
}
