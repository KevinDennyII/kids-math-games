import { useEffect, useRef, useState } from 'react'
import { PlayShell } from '../PlayShell'
import { useBrainSession } from '../useBrainSession'
import { brainGameById } from '../catalog'
import {
  STROOP_INK,
  STROOP_LABELS,
  gradeStroop,
  makeStroopTrial,
  type StroopInk,
  type StroopTrial,
} from '../engines/colorCatch'
import { inkStyle } from '../hues'
import { mulberry32 } from '../rng'
import type { SparkProps } from './spark'

export function ColorCatchPlay({ spark = false, onSparkComplete }: SparkProps) {
  const game = brainGameById('color')!
  const { state, note, feedback, setFeedback, fx } = useBrainSession('color')
  const rng = useRef(mulberry32((Date.now() % 1_000_000) + 31))
  const [trial, setTrial] = useState<StroopTrial>(() =>
    makeStroopTrial(state.level, rng.current),
  )
  const [phase, setPhase] = useState<'play' | 'result'>('play')
  const [sessionPoints, setSessionPoints] = useState(0)
  const [rounds, setRounds] = useState(0)
  const done = useRef(false)
  const chooseRef = useRef<(choice: StroopInk | null) => void>(() => {})

  function nextTrial() {
    setTrial(makeStroopTrial(state.level, rng.current))
    setPhase('play')
    setFeedback(null)
  }
  const nextTrialRef = useRef(nextTrial)
  nextTrialRef.current = nextTrial

  useEffect(() => {
    if (phase !== 'play') return
    const t = window.setTimeout(() => chooseRef.current(null), trial.deadlineMs)
    return () => window.clearTimeout(t)
  }, [phase, trial])

  useEffect(() => {
    if (phase !== 'result') return
    if (spark && rounds >= game.sparkTrials) {
      if (!done.current) {
        done.current = true
        const t = window.setTimeout(() => onSparkComplete?.(sessionPoints), 550)
        return () => window.clearTimeout(t)
      }
      return
    }
    const t = window.setTimeout(() => nextTrialRef.current(), 700)
    return () => window.clearTimeout(t)
  }, [phase, spark, rounds, game.sparkTrials, sessionPoints, onSparkComplete])

  function choose(choice: StroopInk | null) {
    if (phase !== 'play') return
    const correct = choice != null && gradeStroop(trial, choice)
    const result = note(correct)
    setPhase('result')
    setRounds((n) => n + 1)
    if (correct) setSessionPoints((p) => p + result.pointsEarned)
  }
  chooseRef.current = choose

  return (
    <PlayShell gameId="color" embed={spark}>
      <div className="brain-play-card">
        {fx}
        <p className="brain-stats-row">
          <span>Level {state.level}</span>
          <span>Score {state.score}</span>
          <span>Tap the ink color</span>
        </p>
        <p className="brain-prompt">
          {phase === 'play'
            ? 'What color is the ink?'
            : feedback === 'ok'
              ? 'Yes — the paint, not the word'
              : 'The letters try to trick you'}
        </p>
        {phase === 'play' ? (
          <div className="brain-timer" aria-hidden="true">
            <span style={{ animationDuration: `${trial.deadlineMs}ms` }} />
          </div>
        ) : null}
        <p className="brain-stroop-word" style={inkStyle(trial.ink)}>
          {STROOP_LABELS[trial.word]}
        </p>
        <div className="brain-ink-row">
          {STROOP_INK.map((ink) => (
            <button
              key={ink}
              type="button"
              className="brain-ink-btn"
              data-ink={ink}
              disabled={phase !== 'play'}
              onClick={() => choose(ink)}
            >
              {STROOP_LABELS[ink]}
            </button>
          ))}
        </div>
      </div>
    </PlayShell>
  )
}
