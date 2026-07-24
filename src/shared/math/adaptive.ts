import type { AdaptiveState } from './types'
import { MAX_LEVEL, MIN_LEVEL } from './types'

export type AnswerResult = {
  correct: boolean
  state: AdaptiveState
  leveledUp: boolean
  leveledDown: boolean
  pointsEarned: number
}

/** After 3 correct → +1 level; after 2 wrong in a row → −1 level. */
export function applyAnswer(
  prev: AdaptiveState,
  correct: boolean,
): AnswerResult {
  const next: AdaptiveState = { ...prev }
  let leveledUp = false
  let leveledDown = false
  let pointsEarned = 0

  if (correct) {
    next.correctStreak += 1
    next.wrongStreak = 0
    next.solved += 1
    pointsEarned = 10 + next.correctStreak * 2
    next.score += pointsEarned
    next.bestStreak = Math.max(next.bestStreak, next.correctStreak)

    if (next.correctStreak > 0 && next.correctStreak % 3 === 0) {
      if (next.level < MAX_LEVEL) {
        next.level += 1
        leveledUp = true
      }
    }
  } else {
    next.wrongStreak += 1
    next.correctStreak = 0

    if (next.wrongStreak >= 2) {
      if (next.level > MIN_LEVEL) {
        next.level -= 1
        leveledDown = true
      }
      next.wrongStreak = 0
    }
  }

  return { correct, state: next, leveledUp, leveledDown, pointsEarned }
}
