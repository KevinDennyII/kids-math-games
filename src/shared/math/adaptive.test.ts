import { describe, expect, it } from 'vitest'
import { applyAnswer } from './adaptive'
import { createAdaptiveState } from './types'
import { generateAcademyProblem, generateRaceProblem } from './generateProblem'

describe('adaptive difficulty', () => {
  it('levels up after 3 correct answers', () => {
    let state = createAdaptiveState()
    for (let i = 0; i < 3; i++) {
      const result = applyAnswer(state, true)
      state = result.state
    }
    expect(state.level).toBe(2)
    expect(state.correctStreak).toBe(3)
  })

  it('levels down after 2 wrong in a row', () => {
    let state = { ...createAdaptiveState(), level: 2 }
    state = applyAnswer(state, false).state
    const second = applyAnswer(state, false)
    expect(second.state.level).toBe(1)
    expect(second.leveledDown).toBe(true)
  })

  it('supports longer typing orbits without wiping progress on a miss', () => {
    let state = createAdaptiveState()
    const typing = {
      correctPerLevel: 8,
      maxLevel: 5,
      wrongToDrop: 3,
      resetStreakOnWrong: false,
      levelUpBonus: 50,
    }

    for (let i = 0; i < 7; i++) {
      state = applyAnswer(state, true, typing).state
    }
    expect(state.level).toBe(1)
    expect(state.correctStreak).toBe(7)

    state = applyAnswer(state, false, typing).state
    expect(state.correctStreak).toBe(7)

    const leveled = applyAnswer(state, true, typing)
    expect(leveled.leveledUp).toBe(true)
    expect(leveled.state.level).toBe(2)
    expect(leveled.pointsEarned).toBeGreaterThanOrEqual(50)
  })
})

describe('problem generators', () => {
  it('race L1 answers match multiplication', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateRaceProblem(1)
      const [a, b] = p.operands!
      expect(p.answer).toBe(a! * b!)
    }
  })

  it('academy L1 sums stay within 10', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateAcademyProblem(1)
      expect(p.answer).toBeLessThanOrEqual(10)
      expect(p.answer).toBe(p.operands![0]! + p.operands![1]!)
    }
  })
})
