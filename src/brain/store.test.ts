import { describe, expect, it } from 'vitest'
import { localDateKey } from './store'

describe('brain store helpers', () => {
  it('formats a local YYYY-MM-DD key', () => {
    expect(localDateKey(new Date(2026, 8, 20))).toBe('2026-09-20')
  })
})
