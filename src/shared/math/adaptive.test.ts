import { describe, expect, it } from 'vitest'
import { applyAnswer, MATH_ADAPTIVE } from './adaptive'
import { createAdaptiveState } from './types'
import { generateAcademyOpProblem, generateMathProblem, generateRaceOpProblem } from './generateProblem'
import type { MathOpLevels } from './types'

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

  it('math categories level up at 80% accuracy after 5 attempts', () => {
    let state = createAdaptiveState()

    for (let i = 0; i < 3; i++) {
      state = applyAnswer(state, true, MATH_ADAPTIVE).state
    }
    state = applyAnswer(state, false, MATH_ADAPTIVE).state
    expect(state.level).toBe(1)
    expect(state.levelAttempts).toBe(4)
    expect(state.levelCorrect).toBe(3)

    // 4/5 = 80% → level up
    const leveled = applyAnswer(state, true, MATH_ADAPTIVE)
    expect(leveled.leveledUp).toBe(true)
    expect(leveled.state.level).toBe(2)
    expect(leveled.state.levelAttempts).toBe(0)
    expect(leveled.state.levelCorrect).toBe(0)
  })

  it('math categories stay put when accuracy is under 80%', () => {
    let state = createAdaptiveState()

    for (let i = 0; i < 3; i++) {
      state = applyAnswer(state, true, MATH_ADAPTIVE).state
    }
    state = applyAnswer(state, false, MATH_ADAPTIVE).state
    const result = applyAnswer(state, false, MATH_ADAPTIVE)

    expect(result.leveledUp).toBe(false)
    expect(result.state.level).toBe(1)
    expect(result.state.levelAttempts).toBe(5)
    expect(result.state.levelCorrect).toBe(3)
  })

  it('math categories keep accumulating until 80% is reached', () => {
    let state = createAdaptiveState()

    for (let i = 0; i < 3; i++) {
      state = applyAnswer(state, true, MATH_ADAPTIVE).state
    }
    state = applyAnswer(state, false, MATH_ADAPTIVE).state
    // Isolate the second miss so wrong-streak level-down does not fire at L1
    state = applyAnswer(
      { ...state, wrongStreak: 0 },
      false,
      MATH_ADAPTIVE,
    ).state
    expect(state.level).toBe(1)
    expect(state.levelCorrect / state.levelAttempts).toBe(0.6)

    for (let i = 0; i < 3; i++) {
      state = applyAnswer(state, true, MATH_ADAPTIVE).state
    }
    expect(state.level).toBe(1)
    expect(state.levelCorrect).toBe(6)
    expect(state.levelAttempts).toBe(8)

    state = applyAnswer(state, true, MATH_ADAPTIVE).state
    const leveled = applyAnswer(state, true, MATH_ADAPTIVE)
    expect(leveled.leveledUp).toBe(true)
    expect(leveled.state.level).toBe(2)
  })

  it('math categories reset accuracy counters when leveling down', () => {
    let state = {
      ...createAdaptiveState(),
      level: 2,
      levelAttempts: 4,
      levelCorrect: 2,
    }
    state = applyAnswer(state, false, MATH_ADAPTIVE).state
    const dropped = applyAnswer(state, false, MATH_ADAPTIVE)
    expect(dropped.leveledDown).toBe(true)
    expect(dropped.state.level).toBe(1)
    expect(dropped.state.levelAttempts).toBe(0)
    expect(dropped.state.levelCorrect).toBe(0)
  })
})

describe('problem generators', () => {
  it('race addition uses two-digit+ addends and matching sums', () => {
    for (let level = 1; level <= 3; level++) {
      for (let i = 0; i < 20; i++) {
        const p = generateRaceOpProblem('addition', level)
        const [a, b] = p.operands!
        expect(p.type).toBe('addition')
        expect(a).toBeGreaterThanOrEqual(10)
        expect(b).toBeGreaterThanOrEqual(10)
        expect(p.answer).toBe(a! + b!)
      }
    }
  })

  it('race L1 addition stays in the teens', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateRaceOpProblem('addition', 1)
      expect(p.operands![0]).toBeLessThanOrEqual(19)
      expect(p.operands![1]).toBeLessThanOrEqual(19)
    }
  })

  it('race subtraction never goes negative', () => {
    for (let level = 1; level <= 3; level++) {
      for (let i = 0; i < 20; i++) {
        const p = generateRaceOpProblem('subtraction', level)
        const [a, b] = p.operands!
        expect(p.type).toBe('subtraction')
        expect(a).toBeGreaterThan(b!)
        expect(p.answer).toBe(a! - b!)
        expect(p.answer).toBeGreaterThan(0)
      }
    }
  })

  it('race L1 subtraction is two-digit minus one-digit', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateRaceOpProblem('subtraction', 1)
      const [a, b] = p.operands!
      expect(a).toBeGreaterThanOrEqual(11)
      expect(a).toBeLessThanOrEqual(20)
      expect(b).toBeGreaterThanOrEqual(1)
      expect(b).toBeLessThanOrEqual(9)
    }
  })

  it('race multiplication answers match the product', () => {
    for (let level = 1; level <= 3; level++) {
      for (let i = 0; i < 20; i++) {
        const p = generateRaceOpProblem('multiplication', level)
        const [a, b] = p.operands!
        expect(p.type).toBe('multiplication')
        expect(p.answer).toBe(a! * b!)
      }
    }
  })

  it('race L1 multiplication stays in easy facts', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateRaceOpProblem('multiplication', 1)
      const [a, b] = p.operands!
      expect(a).toBeGreaterThanOrEqual(2)
      expect(a).toBeLessThanOrEqual(5)
      expect(b).toBeGreaterThanOrEqual(2)
      expect(b).toBeLessThanOrEqual(9)
    }
  })

  it('race division has no remainder and stays under 100', () => {
    for (let level = 1; level <= 3; level++) {
      for (let i = 0; i < 20; i++) {
        const p = generateRaceOpProblem('division', level)
        const [dividend, divisor] = p.operands!
        expect(p.type).toBe('division')
        expect(dividend).toBeLessThan(100)
        expect(dividend! % divisor!).toBe(0)
        expect(p.answer).toBe(dividend! / divisor!)
      }
    }
  })

  it('race L1 division stays small (no 3-digit numbers)', () => {
    for (let i = 0; i < 30; i++) {
      const p = generateRaceOpProblem('division', 1)
      const [dividend, divisor] = p.operands!
      expect(dividend).toBeLessThanOrEqual(25)
      expect(divisor).toBeLessThanOrEqual(5)
      expect(p.answer).toBeLessThanOrEqual(5)
    }
  })

  it('race mixed uses each operation’s own level', () => {
    const types = new Set<string>()
    const opLevels: MathOpLevels = {
      addition: 1,
      subtraction: 1,
      multiplication: 3,
      division: 1,
    }
    for (let i = 0; i < 100; i++) {
      const p = generateMathProblem(generateRaceOpProblem, 'mixed', opLevels)
      types.add(p.type)
      expect(['addition', 'subtraction', 'multiplication', 'division']).toContain(
        p.type,
      )
      if (p.type === 'division') {
        expect(p.operands![0]).toBeLessThanOrEqual(25)
      }
    }
    expect(types.has('addition')).toBe(true)
    expect(types.has('subtraction')).toBe(true)
    expect(types.has('multiplication')).toBe(true)
    expect(types.has('division')).toBe(true)
  })

  it('race dedicated mode ignores other operations’ levels', () => {
    const p = generateMathProblem(generateRaceOpProblem, 'division', {
      addition: 3,
      subtraction: 3,
      multiplication: 3,
      division: 1,
    })
    expect(p.type).toBe('division')
    expect(p.operands![0]).toBeLessThanOrEqual(25)
  })

  it('academy L1 sums stay within 10', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateAcademyOpProblem('addition', 1)
      expect(p.answer).toBeLessThanOrEqual(10)
      expect(p.answer).toBe(p.operands![0]! + p.operands![1]!)
    }
  })

  it('academy L1 subtraction stays within 10', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateAcademyOpProblem('subtraction', 1)
      const [a, b] = p.operands!
      expect(a).toBeLessThanOrEqual(9)
      expect(b).toBeLessThan(a!)
      expect(p.answer).toBe(a! - b!)
    }
  })

  it('academy L1 multiplication uses 2s facts', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateAcademyOpProblem('multiplication', 1)
      expect(p.operands![0]).toBe(2)
      expect(p.operands![1]).toBeGreaterThanOrEqual(2)
      expect(p.operands![1]).toBeLessThanOrEqual(5)
      expect(p.answer).toBe(p.operands![0]! * p.operands![1]!)
    }
  })

  it('academy L1 division is even 2s facts', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateAcademyOpProblem('division', 1)
      const [dividend, divisor] = p.operands!
      expect(divisor).toBe(2)
      expect(dividend).toBeLessThanOrEqual(10)
      expect(dividend! % 2).toBe(0)
      expect(p.answer).toBe(dividend! / 2)
    }
  })
})
