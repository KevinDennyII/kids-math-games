import { describe, expect, it } from 'vitest'
import {
  checkAnswer,
  isMissionUnlocked,
  PYTHON_MISSIONS,
} from './curriculum'

describe('python curriculum', () => {
  it('keeps the sandbox open and gates the other missions', () => {
    expect(isMissionUnlocked('hello', [])).toBe(true)
    expect(isMissionUnlocked('sandbox', [])).toBe(true)
    expect(isMissionUnlocked('variables', [])).toBe(false)
    expect(isMissionUnlocked('variables', ['hello'])).toBe(true)
  })

  it('accepts only the listen-check answer', () => {
    const hello = PYTHON_MISSIONS.find((m) => m.id === 'hello')!
    expect(checkAnswer(hello, 'print')).toBe(true)
    expect(checkAnswer(hello, 'wheel')).toBe(false)
  })

  it('includes a drive mission after the language basics', () => {
    expect(PYTHON_MISSIONS.map((m) => m.id)).toEqual([
      'hello',
      'variables',
      'branch',
      'loops',
      'drive',
      'sandbox',
    ])
  })
})
