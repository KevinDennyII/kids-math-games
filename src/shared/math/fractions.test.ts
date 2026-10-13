import { describe, expect, it } from 'vitest'
import {
  addFractions,
  formatFraction,
  matchesFractionAnswer,
  parseFractionInput,
  simplifyFraction,
} from './fractions'

describe('fractions helpers', () => {
  it('simplifies and formats', () => {
    expect(simplifyFraction({ numerator: 2, denominator: 4 })).toEqual({
      numerator: 1,
      denominator: 2,
    })
    expect(formatFraction({ numerator: 2, denominator: 4 })).toBe('1/2')
    expect(formatFraction({ numerator: 4, denominator: 2 })).toBe('2')
  })

  it('adds same and unlike denominators', () => {
    expect(
      addFractions(
        { numerator: 1, denominator: 4 },
        { numerator: 2, denominator: 4 },
      ),
    ).toEqual({ numerator: 3, denominator: 4 })
    expect(
      addFractions(
        { numerator: 1, denominator: 2 },
        { numerator: 1, denominator: 4 },
      ),
    ).toEqual({ numerator: 3, denominator: 4 })
    expect(
      addFractions(
        { numerator: 1, denominator: 3 },
        { numerator: 1, denominator: 4 },
      ),
    ).toEqual({ numerator: 7, denominator: 12 })
  })

  it('parses kid-friendly answers', () => {
    expect(parseFractionInput('3/4')).toEqual({
      numerator: 3,
      denominator: 4,
    })
    expect(parseFractionInput('1')).toEqual({ numerator: 1, denominator: 1 })
    expect(parseFractionInput('1 1/2')).toEqual({
      numerator: 3,
      denominator: 2,
    })
    expect(parseFractionInput('')).toBeNull()
  })

  it('accepts equivalent fraction forms', () => {
    const expected = { numerator: 1, denominator: 2 }
    expect(matchesFractionAnswer('1/2', expected)).toBe(true)
    expect(matchesFractionAnswer('2/4', expected)).toBe(true)
    expect(matchesFractionAnswer('3/4', expected)).toBe(false)
  })
})
