import { useEffect, useRef, useState } from 'react'
import { PlayShell } from '../PlayShell'
import { useBrainSession } from '../useBrainSession'
import { brainGameById } from '../catalog'
import {
  gradeTwist,
  makeTwistTrial,
  type TwistAnswer,
  type TwistTrial,
} from '../engines/shapeTwist'
import { TwistBoard } from '../glyphs'
import { mulberry32 } from '../rng'
import type { SparkProps } from './spark'

export function ShapeTwistPlay({ spark = false, onSparkComplete }: SparkProps) {
  const game = brainGameById('twist')!
  const { state, note, feedback, setFeedback, fx } = useBrainSession('twist')
  const rng = useRef(mulberry32((Date.now() % 1_000_000) + 71))
  const [trial, setTrial] = useState<TwistTrial>(() =>
    makeTwistTrial(state.level, rng.current),
  )
  const [phase, setPhase] = useState<'play' | 'result'>('play')
  const [sessionPoints, setSessionPoints] = useState(0)
  const [rounds, setRounds] = useState(0)
  const done = useRef(false)

  function nextTrial() {
    setTrial(makeTwistTrial(state.level, rng.current))
    setPhase('play')
    setFeedback(null)
  }
  const nextTrialRef = useRef(nextTrial)
  nextTrialRef.current = nextTrial

  useEffect(() => {
    if (phase !== 'result') return
    if (spark && rounds >= game.sparkTrials) {
      if (!done.current) {
        done.current = true
        const t = window.setTimeout(() => onSparkComplete?.(sessionPoints), 600)
        return () => window.clearTimeout(t)
      }
      return
    }
    const t = window.setTimeout(() => nextTrialRef.current(), 800)
    return () => window.clearTimeout(t)
  }, [phase, spark, rounds, game.sparkTrials, sessionPoints, onSparkComplete])

  function choose(answer: TwistAnswer) {
    if (phase !== 'play') return
    const correct = gradeTwist(trial, answer)
    const result = note(correct)
    setPhase('result')
    setRounds((n) => n + 1)
    if (correct) setSessionPoints((p) => p + result.pointsEarned)
  }

  return (
    <PlayShell gameId="twist" embed={spark}>
      <div className="brain-play-card">
        {fx}
        <p className="brain-stats-row">
          <span>Level {state.level}</span>
          <span>Score {state.score}</span>
        </p>
        <p className="brain-prompt">
          {phase === 'play'
            ? 'Same piece turned, or a mirror flip?'
            : feedback === 'ok'
              ? 'You rotated it in your head'
              : trial.answer === 'flip'
                ? 'That one was flipped'
                : 'That one was only rotated'}
        </p>
        <div className="brain-twist-pair">
          <TwistBoard cells={trial.reference} label="Start" />
          <TwistBoard cells={trial.candidate} label="Now" />
        </div>
        <div className="brain-binary-row">
          <button
            type="button"
            className="brain-binary"
            disabled={phase !== 'play'}
            onClick={() => choose('same')}
          >
            Same
          </button>
          <button
            type="button"
            className="brain-binary"
            disabled={phase !== 'play'}
            onClick={() => choose('flip')}
          >
            Flipped
          </button>
        </div>
      </div>
    </PlayShell>
  )
}
