import { describe, expect, it } from 'vitest'
import {
  BRAIN_GAMES,
  BRAIN_GAME_IDS,
  DAILY_SPARK_ORDER,
  brainGameById,
} from './catalog'

describe('brain catalog', () => {
  it('covers six research-backed workouts plus a daily circuit order', () => {
    expect(BRAIN_GAMES.map((g) => g.id)).toEqual([...BRAIN_GAME_IDS])
    expect(DAILY_SPARK_ORDER).toEqual([...BRAIN_GAME_IDS])
    for (const game of BRAIN_GAMES) {
      expect(game.why.length).toBeGreaterThan(40)
      expect(game.sparkTrials).toBeGreaterThan(0)
      expect(brainGameById(game.id)?.title).toBe(game.title)
    }
  })
})
