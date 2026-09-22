import { describe, expect, it } from 'vitest'
import { firstOpenMissionIndex, isMissionUnlocked, PYTHON_MISSIONS } from './curriculum'

describe('python curriculum', () => {
  it('has eight sequential levels with badges', () => {
    expect(PYTHON_MISSIONS).toHaveLength(8)
    expect(PYTHON_MISSIONS.map((m) => m.level)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    expect(PYTHON_MISSIONS.map((m) => m.badge)).toEqual([
      'dirt',
      'wood',
      'cobble',
      'iron',
      'emerald',
      'gold',
      'redstone',
      'diamond',
    ])
  })

  it('unlocks levels in order and opens Memory Squares after level 4', () => {
    expect(isMissionUnlocked('hello', [])).toBe(true)
    expect(isMissionUnlocked('variables', [])).toBe(false)
    expect(isMissionUnlocked('memory', ['hello', 'variables', 'branch'])).toBe(false)
    expect(isMissionUnlocked('memory', ['hello', 'variables', 'branch', 'loops'])).toBe(true)
    expect(isMissionUnlocked('craft', [])).toBe(false)
  })

  it('opens the first unfinished lesson', () => {
    expect(firstOpenMissionIndex([])).toBe(0)
    expect(firstOpenMissionIndex(['hello'])).toBe(1)
  })

  it('marks level 5 as the first-app project', () => {
    expect(PYTHON_MISSIONS[4]?.id).toBe('memory')
    expect(PYTHON_MISSIONS[4]?.kind).toBe('project')
  })
})
