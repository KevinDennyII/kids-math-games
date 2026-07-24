import { useCallback, useEffect, useRef, useState } from 'react'
import type { MusicTheme } from '../audio/musicEngine'
import { useGameMusic } from '../audio/useGameMusic'
import type { GameId, Problem } from '../math/types'
import { useProgressStore } from '../store/progressStore'

const CORRECT_DELAY_MS = 900
const WRONG_DELAY_MS = 1400

export type ProblemBanners = {
  correct: string
  leveledUp: string
  wrong: string
  leveledDown: string
}

type Options = {
  gameId: Extract<GameId, 'race' | 'academy'>
  musicTheme: MusicTheme
  generateProblem: (level: number) => Problem
  banners: ProblemBanners
}

/**
 * Shared adaptive Q&A loop for math games (Joy of React: single source of truth + hooks).
 */
export function useAdaptiveProblemGame({
  gameId,
  musicTheme,
  generateProblem,
  banners,
}: Options) {
  const state = useProgressStore((s) => s[gameId])
  const recordAnswer = useProgressStore((s) => s.recordAnswer)
  const resetGame = useProgressStore((s) => s.resetGame)
  const { muted, setMuted, playSfx } = useGameMusic(musicTheme)

  const [problem, setProblem] = useState<Problem>(() =>
    generateProblem(useProgressStore.getState()[gameId].level),
  )
  const [value, setValue] = useState('')
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [hint, setHint] = useState<string | null>(null)
  const [burstKey, setBurstKey] = useState(0)
  const [popPoints, setPopPoints] = useState<number | null>(null)
  const [popKey, setPopKey] = useState(0)
  const [locked, setLocked] = useState(false)
  const [banner, setBanner] = useState<string | null>(null)

  const timersRef = useRef<number[]>([])

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) window.clearTimeout(id)
    timersRef.current = []
  }, [])

  useEffect(() => () => clearTimers(), [clearTimers])

  const nextProblem = useCallback(
    (level: number) => {
      setProblem(generateProblem(level))
      setValue('')
      setFeedback('idle')
      setHint(null)
      setLocked(false)
    },
    [generateProblem],
  )

  const scheduleNext = useCallback(
    (level: number, delayMs: number) => {
      const id = window.setTimeout(() => nextProblem(level), delayMs)
      timersRef.current.push(id)
    },
    [nextProblem],
  )

  const submit = useCallback(() => {
    if (locked || value === '') return
    const guess = Number(value)
    if (Number.isNaN(guess)) return

    setLocked(true)
    const result = recordAnswer(gameId, guess === problem.answer)

    if (result.correct) {
      playSfx('correct')
      setFeedback('correct')
      setBurstKey((k) => k + 1)
      setPopPoints(result.pointsEarned)
      setPopKey((k) => k + 1)
      setBanner(result.leveledUp ? banners.leveledUp : banners.correct)
      scheduleNext(result.state.level, CORRECT_DELAY_MS)
    } else {
      playSfx('wrong')
      setFeedback('wrong')
      setHint(problem.hint)
      setBanner(result.leveledDown ? banners.leveledDown : banners.wrong)
      scheduleNext(result.state.level, WRONG_DELAY_MS)
    }
  }, [
    banners,
    gameId,
    locked,
    playSfx,
    problem.answer,
    problem.hint,
    recordAnswer,
    scheduleNext,
    value,
  ])

  const reset = useCallback(() => {
    clearTimers()
    resetGame(gameId)
    nextProblem(1)
    setBanner(null)
    setPopPoints(null)
  }, [clearTimers, gameId, nextProblem, resetGame])

  return {
    state,
    muted,
    setMuted,
    problem,
    value,
    setValue,
    feedback,
    hint,
    burstKey,
    popPoints,
    popKey,
    locked,
    banner,
    submit,
    reset,
    celebrating: feedback === 'correct',
  }
}
