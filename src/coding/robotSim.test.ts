import { describe, expect, it } from 'vitest'
import {
  canAssemble,
  createBot,
  parseArena,
  printFits,
  runCommands,
  stepBot,
} from './robotSim'

describe('robot sim', () => {
  it('requires Basicbot build order', () => {
    expect(canAssemble('frame', [])).toBe(true)
    expect(canAssemble('wheels', [])).toBe(false)
    expect(canAssemble('motors', ['frame'])).toBe(true)
    expect(canAssemble('battery', ['frame', 'motors', 'wheels'])).toBe(true)
  })

  it('accepts 3D-print scale near the mounting holes', () => {
    expect(printFits(100)).toBe(true)
    expect(printFits(90)).toBe(true)
    expect(printFits(111)).toBe(false)
    expect(printFits(80)).toBe(false)
  })

  it('reaches the goal on a planned path and dies on hazards without walls', () => {
    const reached = runCommands(
      [
        { type: 'forward', n: 7 },
        { type: 'right' },
        { type: 'forward', n: 3 },
      ],
      'walls',
    )
    expect(reached.state.goal).toBe(true)

    const { grid } = parseArena()
    let bot = createBot('spikes')
    bot = stepBot(bot, grid, { type: 'right' }, 'spikes').state
    bot = stepBot(bot, grid, { type: 'forward', n: 1 }, 'spikes').state
    bot = stepBot(bot, grid, { type: 'left' }, 'spikes').state
    const intoHazard = stepBot(bot, grid, { type: 'forward', n: 3 }, 'spikes')
    expect(intoHazard.event).toBe('hazard')
    expect(intoHazard.state.hp).toBeLessThan(bot.hp)
  })
})
