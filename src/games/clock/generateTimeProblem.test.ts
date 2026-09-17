import { describe, expect, it } from 'vitest'
import {
  anglesFromTime,
  formatDigital,
  formatWords,
  generateTimeProblem,
  isSetCorrect,
  snapMinutes,
} from './generateTimeProblem'
import { skillForLevel } from './timeTypes'

describe('clock time engine', () => {
  it('scaffolds skills by level', () => {
    expect(skillForLevel(1)).toBe('oclock')
    expect(skillForLevel(2)).toBe('half')
    expect(skillForLevel(3)).toBe('quarter')
    expect(skillForLevel(4)).toBe('five')
    expect(skillForLevel(5)).toBe('mixed')
  })

  it('formats digital and spoken times', () => {
    expect(formatDigital(3, 0)).toBe('3:00')
    expect(formatDigital(10, 5)).toBe('10:05')
    expect(formatWords(3, 0)).toBe('3 o’clock')
    expect(formatWords(4, 30)).toBe('half past 4')
    expect(formatWords(2, 15)).toBe('quarter past 2')
    expect(formatWords(2, 45)).toBe('quarter to 3')
    expect(formatWords(11, 45)).toBe('quarter to 12')
  })

  it('places continuous hour and minute hands', () => {
    expect(anglesFromTime(3, 0)).toEqual({ hourAngle: 90, minuteAngle: 0 })
    expect(anglesFromTime(3, 30)).toEqual({ hourAngle: 105, minuteAngle: 180 })
    expect(anglesFromTime(12, 0)).toEqual({ hourAngle: 0, minuteAngle: 0 })
  })

  it('snaps minutes to five-minute marks before level 5', () => {
    expect(snapMinutes(7, 3)).toBe(5)
    expect(snapMinutes(8, 3)).toBe(10)
    expect(snapMinutes(7, 5)).toBe(7)
  })

  it('checks set-the-hands answers with kid-friendly slack', () => {
    expect(isSetCorrect(4, 30, 4, 30, 2)).toBe(true)
    expect(isSetCorrect(4, 30, 4, 25, 2)).toBe(false)
    expect(isSetCorrect(4, 30, 4, 31, 5)).toBe(true)
    expect(isSetCorrect(4, 30, 5, 30, 2)).toBe(false)
  })

  it('generates level-appropriate problems with valid choices', () => {
    for (let level = 1; level <= 5; level += 1) {
      const problem = generateTimeProblem(level)
      expect(problem.hours).toBeGreaterThanOrEqual(1)
      expect(problem.hours).toBeLessThanOrEqual(12)
      expect(problem.minutes).toBeGreaterThanOrEqual(0)
      expect(problem.minutes).toBeLessThanOrEqual(55)
      expect(problem.answerDigital).toBe(
        formatDigital(problem.hours, problem.minutes),
      )
      expect(problem.choices).toContain(problem.answerDigital)
      expect(problem.choices).toHaveLength(4)
      if (level === 1) expect(problem.minutes).toBe(0)
      if (level === 2) expect(problem.minutes).toBe(30)
      if (level === 3) expect([15, 45]).toContain(problem.minutes)
    }
  })
})
