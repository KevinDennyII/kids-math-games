import { useCallback, useEffect, useRef, useState } from 'react'
import { PlayShell } from '../PlayShell'
import { useBrainSession } from '../useBrainSession'
import { gradeGo, makeGoRound, type GoEvent } from '../engines/holdFast'
import { HoldStar, HoldStop } from '../glyphs'
import { mulberry32 } from '../rng'
import type { SparkProps } from './spark'

export function HoldFastPlay({ spark = false, onSparkComplete }: SparkProps) {
  const { state, note, feedback, setFeedback, fx } = useBrainSession('hold')
  const rng = useRef(mulberry32((Date.now() % 1_000_000) + 53))
  const [events, setEvents] = useState<GoEvent[]>(() =>
    makeGoRound(state.level, rng.current),
  )
  const [index, setIndex] = useState(0)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const locked = useRef(false)
  const done = useRef(false)
  const pointsRef = useRef(0)
  const event = events[index]

  const startRound = useCallback(() => {
    locked.current = false
    done.current = false
    pointsRef.current = 0
    setEvents(makeGoRound(state.level, rng.current))
    setIndex(0)
    setRunning(true)
    setFinished(false)
    setFeedback(null)
  }, [setFeedback, state.level])

  const sparkStarted = useRef(false)
  useEffect(() => {
    if (!spark) return
    const t = window.setTimeout(() => {
      if (sparkStarted.current) return
      sparkStarted.current = true
      startRound()
    }, 800)
    return () => window.clearTimeout(t)
  }, [spark, startRound])

  function finishRound() {
    setRunning(false)
    setFinished(true)
    if (spark && !done.current) {
      done.current = true
      window.setTimeout(() => onSparkComplete?.(pointsRef.current), 500)
    }
  }

  const resolveRef = useRef<(action: 'tap' | 'timeout') => void>(() => {})
  function resolve(action: 'tap' | 'timeout') {
    if (!running || !event || locked.current || finished) return
    locked.current = true
    const correct = gradeGo(event, action)
    const result = note(correct)
    if (correct) pointsRef.current += result.pointsEarned
    const next = index + 1
    window.setTimeout(() => {
      if (next >= events.length) {
        finishRound()
        return
      }
      setIndex(next)
      setFeedback(null)
      locked.current = false
    }, 280)
  }
  resolveRef.current = resolve

  useEffect(() => {
    if (!running || !event || finished) return
    const t = window.setTimeout(() => resolveRef.current('timeout'), event.windowMs)
    return () => window.clearTimeout(t)
  }, [running, event, index, finished])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' && e.key !== ' ') return
      e.preventDefault()
      if (!running) startRound()
      else resolve('tap')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const prompt = !running
    ? finished
      ? 'Round complete'
      : 'Tap the star. Freeze on stop.'
    : event?.kind === 'go'
      ? 'TAP!'
      : 'WAIT'

  return (
    <PlayShell gameId="hold" embed={spark}>
      <div className="brain-play-card">
        {fx}
        <p className="brain-stats-row">
          <span>Level {state.level}</span>
          <span>Score {state.score}</span>
          {running ? (
            <span>
              {index + 1}/{events.length}
            </span>
          ) : (
            <span>{events.length} flashes</span>
          )}
        </p>
        <p className="brain-prompt">{prompt}</p>
        <button
          type="button"
          className="brain-hold-stage"
          data-kind={running ? event?.kind : undefined}
          onClick={() => {
            if (!running) startRound()
            else resolve('tap')
          }}
          aria-label={running ? (event?.kind === 'go' ? 'Tap now' : 'Do not tap') : 'Start'}
        >
          {running && event ? (
            event.kind === 'go' ? (
              <HoldStar />
            ) : (
              <HoldStop />
            )
          ) : (
            <span>{finished ? 'Again' : 'Start'}</span>
          )}
        </button>
        <p className="brain-feedback" data-kind={feedback ?? undefined}>
          {feedback === 'ok' ? 'Yes' : feedback === 'miss' ? 'Oops' : '\u00a0'}
        </p>
        {!spark && finished ? (
          <button type="button" className="brain-next" onClick={startRound}>
            Play again
          </button>
        ) : null}
      </div>
    </PlayShell>
  )
}
