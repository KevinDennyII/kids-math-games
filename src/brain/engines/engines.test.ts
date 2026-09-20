import { describe, expect, it } from 'vitest'
import { mulberry32 } from '../rng'
import { gradeFlash, makeFlashTrial } from './flashFind'
import { echoStep, makeEchoTrial } from './echoPath'
import { gradeStroop, makeStroopTrial } from './colorCatch'
import { gradeGo, makeGoRound } from './holdFast'
import { gradeTwist, isRotationOf, makeTwistTrial, mirrorX } from './shapeTwist'
import { gradePeek, makePeekTrial } from './patternPeek'

describe('brain engines', () => {
  it('builds Flash Find trials with one odd cell', () => {
    const trial = makeFlashTrial(3, mulberry32(7))
    expect(trial.cells).toHaveLength(trial.size * trial.size)
    const target = trial.cells[trial.targetIndex]!
    const others = trial.cells.filter((_, i) => i !== trial.targetIndex)
    expect(others.every((cell) => cell.shape !== target.shape || cell.hue !== target.hue)).toBe(
      true,
    )
    expect(gradeFlash(trial, trial.targetIndex)).toBe(true)
    expect(gradeFlash(trial, (trial.targetIndex + 1) % trial.cells.length)).toBe(false)
  })

  it('scores Echo Path prefixes like Corsi', () => {
    const trial = makeEchoTrial(2, mulberry32(11))
    expect(trial.sequence.length).toBeGreaterThanOrEqual(3)
    expect(echoStep(trial.sequence, [trial.sequence[0]!])).toBe('ok')
    expect(echoStep(trial.sequence, [trial.sequence[0]!, 99])).toBe('miss')
    expect(echoStep(trial.sequence, [...trial.sequence])).toBe('done')
  })

  it('grades Color Catch on ink, not the written word', () => {
    const trial = makeStroopTrial(5, mulberry32(3))
    expect(gradeStroop(trial, trial.ink)).toBe(true)
    if (!trial.congruent) {
      expect(gradeStroop(trial, trial.word)).toBe(false)
    }
  })

  it('builds Go/No-Go rounds with both taps and waits', () => {
    const round = makeGoRound(4, mulberry32(19))
    expect(round.some((event) => event.kind === 'go')).toBe(true)
    expect(round.some((event) => event.kind === 'nogo')).toBe(true)
    const go = round.find((event) => event.kind === 'go')!
    const nogo = round.find((event) => event.kind === 'nogo')!
    expect(gradeGo(go, 'tap')).toBe(true)
    expect(gradeGo(go, 'timeout')).toBe(false)
    expect(gradeGo(nogo, 'timeout')).toBe(true)
    expect(gradeGo(nogo, 'tap')).toBe(false)
  })

  it('keeps Shape Twist flips from being a rotation of the reference', () => {
    for (let seed = 1; seed < 40; seed += 1) {
      const trial = makeTwistTrial(5, mulberry32(seed))
      if (trial.answer === 'same') {
        expect(isRotationOf(trial.candidate, trial.reference)).toBe(true)
      } else {
        expect(isRotationOf(trial.candidate, trial.reference)).toBe(false)
        expect(isRotationOf(trial.candidate, mirrorX(trial.reference))).toBe(true)
      }
      expect(gradeTwist(trial, trial.answer)).toBe(true)
      expect(gradeTwist(trial, trial.answer === 'same' ? 'flip' : 'same')).toBe(false)
    }
  })

  it('puts the rule-true tile in Pattern Peek choices', () => {
    const trial = makePeekTrial(8, mulberry32(21))
    expect(trial.grid).toHaveLength(9)
    expect(trial.grid[8]).toBeNull()
    expect(trial.choices).toHaveLength(4)
    expect(trial.correctIndex).toBeGreaterThanOrEqual(0)
    expect(gradePeek(trial, trial.correctIndex)).toBe(true)
    expect(gradePeek(trial, (trial.correctIndex + 1) % 4)).toBe(false)
  })
})
