import { useEffect, useRef, useState } from 'react'
import { PlayShell } from '../PlayShell'
import { useBrainSession } from '../useBrainSession'
import { brainGameById } from '../catalog'
import { makeFlashTrial, gradeFlash, type FlashTrial } from '../engines/flashFind'
import { FlashGlyph } from '../glyphs'
import { mulberry32 } from '../rng'
import { usePrefersReducedMotion } from '../../shared/motion/usePrefersReducedMotion'
import type { SparkProps } from './spark'

export function FlashFindPlay({ spark = false, onSparkComplete }: SparkProps) {
  const game = brainGameById('flash')!
  const { state, note, feedback, setFeedback, fx } = useBrainSession('flash')
  const reduced = usePrefersReducedMotion()
  const rng = useRef(mulberry32(Date.now() % 1_000_000))
  const [trial, setTrial] = useState<FlashTrial>(() =>
    makeFlashTrial(state.level, rng.current),
  )
  const [phase, setPhase] = useState<'watch' | 'flash' | 'pick' | 'result'>('watch')
  const [picked, setPicked] = useState<number | null>(null)
  const [sessionPoints, setSessionPoints] = useState(0)
  const [rounds, setRounds] = useState(0)
  const done = useRef(false)

  function nextTrial() {
    setTrial(makeFlashTrial(state.level, rng.current))
    setPhase('watch')
    setPicked(null)
    setFeedback(null)
  }
  const nextTrialRef = useRef(nextTrial)
  nextTrialRef.current = nextTrial

  useEffect(() => {
    if (phase !== 'watch') return
    const t = window.setTimeout(() => setPhase('flash'), 500)
    return () => window.clearTimeout(t)
  }, [phase, trial])

  useEffect(() => {
    if (phase !== 'flash') return
    const ms = reduced ? Math.max(trial.flashMs, 1800) : trial.flashMs
    const t = window.setTimeout(() => setPhase('pick'), ms)
    return () => window.clearTimeout(t)
  }, [phase, trial, reduced])

  useEffect(() => {
    if (phase !== 'result') return
    if (spark && rounds >= game.sparkTrials) {
      if (!done.current) {
        done.current = true
        const t = window.setTimeout(() => onSparkComplete?.(sessionPoints), 650)
        return () => window.clearTimeout(t)
      }
      return
    }
    const t = window.setTimeout(() => nextTrialRef.current(), 850)
    return () => window.clearTimeout(t)
  }, [phase, spark, rounds, game.sparkTrials, sessionPoints, onSparkComplete])

  function pickCell(index: number) {
    if (phase !== 'pick') return
    const correct = gradeFlash(trial, index)
    const result = note(correct)
    setPicked(index)
    setPhase('result')
    setRounds((n) => n + 1)
    if (correct) setSessionPoints((p) => p + result.pointsEarned)
  }

  const hideShapes = phase === 'pick' && !reduced
  const prompt =
    phase === 'watch' || phase === 'flash'
      ? 'Watch for the odd one…'
      : phase === 'pick'
        ? 'Tap where it was'
        : feedback === 'ok'
          ? 'Got it!'
          : 'Next time — look for the different shape or color'

  return (
    <PlayShell gameId="flash" embed={spark}>
      <div className="brain-play-card">
        {fx}
        <p className="brain-stats-row">
          <span>Level {state.level}</span>
          <span>Score {state.score}</span>
          <span>Streak {state.correctStreak}</span>
        </p>
        <p className="brain-prompt">{prompt}</p>
        <div
          className="brain-grid"
          style={{ gridTemplateColumns: `repeat(${trial.size}, 1fr)` }}
        >
          {trial.cells.map((cell, i) => {
            const mark =
              phase === 'result' && i === trial.targetIndex
                ? 'is-correct'
                : phase === 'result' && i === picked && picked !== trial.targetIndex
                  ? 'is-miss'
                  : ''
            return (
              <button
                key={`${trial.targetIndex}-${i}`}
                type="button"
                className={`brain-cell ${hideShapes ? 'is-hidden' : ''} ${mark}`}
                onClick={() => pickCell(i)}
                disabled={phase !== 'pick'}
                aria-label={`Cell ${i + 1}`}
              >
                <FlashGlyph cell={cell} />
              </button>
            )
          })}
        </div>
      </div>
    </PlayShell>
  )
}
