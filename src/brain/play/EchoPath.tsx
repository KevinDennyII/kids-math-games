import { useEffect, useRef, useState } from 'react'
import { PlayShell } from '../PlayShell'
import { useBrainSession } from '../useBrainSession'
import { brainGameById } from '../catalog'
import { echoStep, makeEchoTrial, type EchoTrial } from '../engines/echoPath'
import { mulberry32 } from '../rng'
import type { SparkProps } from './spark'

export function EchoPathPlay({ spark = false, onSparkComplete }: SparkProps) {
  const game = brainGameById('echo')!
  const { state, note, feedback, setFeedback, fx } = useBrainSession('echo')
  const rng = useRef(mulberry32((Date.now() % 1_000_000) + 17))
  const [trial, setTrial] = useState<EchoTrial>(() => makeEchoTrial(state.level, rng.current))
  const [phase, setPhase] = useState<'watch' | 'play' | 'result'>('watch')
  const [lit, setLit] = useState<number | null>(null)
  const [taps, setTaps] = useState<number[]>([])
  const [sessionPoints, setSessionPoints] = useState(0)
  const [rounds, setRounds] = useState(0)
  const done = useRef(false)

  function nextTrial() {
    setTrial(makeEchoTrial(state.level, rng.current))
    setPhase('watch')
    setTaps([])
    setLit(null)
    setFeedback(null)
  }
  const nextTrialRef = useRef(nextTrial)
  nextTrialRef.current = nextTrial

  useEffect(() => {
    if (phase !== 'watch') return
    let cancelled = false
    const timeouts: number[] = []
    setLit(null)
    trial.sequence.forEach((tile, i) => {
      timeouts.push(
        window.setTimeout(() => {
          if (!cancelled) setLit(tile)
        }, 450 + i * 640),
      )
      timeouts.push(
        window.setTimeout(() => {
          if (!cancelled) setLit(null)
        }, 450 + i * 640 + 430),
      )
    })
    timeouts.push(
      window.setTimeout(() => {
        if (!cancelled) setPhase('play')
      }, 450 + trial.sequence.length * 640),
    )
    return () => {
      cancelled = true
      for (const id of timeouts) window.clearTimeout(id)
    }
  }, [phase, trial])

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
    const t = window.setTimeout(() => nextTrialRef.current(), 900)
    return () => window.clearTimeout(t)
  }, [phase, spark, rounds, game.sparkTrials, sessionPoints, onSparkComplete])

  function tap(index: number) {
    if (phase !== 'play') return
    const nextTaps = [...taps, index]
    setTaps(nextTaps)
    const step = echoStep(trial.sequence, nextTaps)
    if (step === 'ok') return
    const correct = step === 'done'
    const result = note(correct)
    setPhase('result')
    setRounds((n) => n + 1)
    if (correct) setSessionPoints((p) => p + result.pointsEarned)
  }

  const prompt =
    phase === 'watch'
      ? 'Remember the path…'
      : phase === 'play'
        ? 'Tap the same path'
        : feedback === 'ok'
          ? 'Nice memory!'
          : 'Watch once more — one tile at a time'

  return (
    <PlayShell gameId="echo" embed={spark}>
      <div className="brain-play-card">
        {fx}
        <p className="brain-stats-row">
          <span>Level {state.level}</span>
          <span>Score {state.score}</span>
          <span>Path {trial.sequence.length}</span>
        </p>
        <p className="brain-prompt">{prompt}</p>
        <div
          className="brain-grid"
          style={{ gridTemplateColumns: `repeat(${trial.size}, 1fr)` }}
        >
          {Array.from({ length: trial.size * trial.size }, (_, i) => (
            <button
              key={i}
              type="button"
              className={`brain-cell ${lit === i ? 'is-lit' : ''}`}
              onClick={() => tap(i)}
              disabled={phase !== 'play'}
              aria-label={`Tile ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </PlayShell>
  )
}
