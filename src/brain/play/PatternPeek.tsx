import { useEffect, useRef, useState } from 'react'
import { PlayShell } from '../PlayShell'
import { useBrainSession } from '../useBrainSession'
import { brainGameById } from '../catalog'
import { gradePeek, makePeekTrial, type PeekTrial } from '../engines/patternPeek'
import { PeekGlyph } from '../glyphs'
import { mulberry32 } from '../rng'
import type { SparkProps } from './spark'

export function PatternPeekPlay({ spark = false, onSparkComplete }: SparkProps) {
  const game = brainGameById('pattern')!
  const { state, note, feedback, setFeedback, fx } = useBrainSession('pattern')
  const rng = useRef(mulberry32((Date.now() % 1_000_000) + 101))
  const [trial, setTrial] = useState<PeekTrial>(() =>
    makePeekTrial(state.level, rng.current),
  )
  const [phase, setPhase] = useState<'play' | 'result'>('play')
  const [picked, setPicked] = useState<number | null>(null)
  const [sessionPoints, setSessionPoints] = useState(0)
  const [rounds, setRounds] = useState(0)
  const done = useRef(false)

  function nextTrial() {
    setTrial(makePeekTrial(state.level, rng.current))
    setPhase('play')
    setPicked(null)
    setFeedback(null)
  }
  const nextTrialRef = useRef(nextTrial)
  nextTrialRef.current = nextTrial

  useEffect(() => {
    if (phase !== 'result') return
    if (spark && rounds >= game.sparkTrials) {
      if (!done.current) {
        done.current = true
        const t = window.setTimeout(() => onSparkComplete?.(sessionPoints), 700)
        return () => window.clearTimeout(t)
      }
      return
    }
    const t = window.setTimeout(() => nextTrialRef.current(), 950)
    return () => window.clearTimeout(t)
  }, [phase, spark, rounds, game.sparkTrials, sessionPoints, onSparkComplete])

  function choose(index: number) {
    if (phase !== 'play') return
    const correct = gradePeek(trial, index)
    const result = note(correct)
    setPicked(index)
    setPhase('result')
    setRounds((n) => n + 1)
    if (correct) setSessionPoints((p) => p + result.pointsEarned)
  }

  return (
    <PlayShell gameId="pattern" embed={spark}>
      <div className="brain-play-card">
        {fx}
        <p className="brain-stats-row">
          <span>Level {state.level}</span>
          <span>Score {state.score}</span>
        </p>
        <p className="brain-prompt">
          {phase === 'play'
            ? 'Which tile finishes the pattern?'
            : feedback === 'ok'
              ? 'You found the rule'
              : 'Look across the rows and down the columns'}
        </p>
        <div className="brain-matrix">
          {trial.grid.map((cell, i) => (
            <div
              key={i}
              className={`brain-matrix-cell ${cell ? '' : 'is-missing'}`}
            >
              {cell ? <PeekGlyph cell={cell} /> : '?'}
            </div>
          ))}
        </div>
        <div className="brain-choices">
          {trial.choices.map((cell, i) => (
            <button
              key={i}
              type="button"
              className={`brain-choice ${
                phase === 'result' && i === trial.correctIndex
                  ? 'is-correct'
                  : phase === 'result' && i === picked && i !== trial.correctIndex
                    ? 'is-miss'
                    : ''
              }`}
              disabled={phase !== 'play'}
              onClick={() => choose(i)}
              aria-label={`Choice ${i + 1}`}
            >
              <PeekGlyph cell={cell} />
            </button>
          ))}
        </div>
      </div>
    </PlayShell>
  )
}
