import { useCallback, useEffect, useRef, useState } from 'react'
import type { MusicTheme } from '../audio/musicEngine'
import { useGameMusic } from '../audio/useGameMusic'
import { pickMixedOp } from '../math/generateProblem'
import type { MathGameId, MathOp, Problem } from '../math/types'
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
  gameId: MathGameId
  musicTheme: MusicTheme
  generateOpProblem: (op: MathOp, level: number) => Problem
  banners: ProblemBanners
}

/**
 * Shared parent loop for both math games: each operation has its own
 * adaptive level, and mixed uses that operation’s current level.
 */
export function useAdaptiveProblemGame({
  gameId,
  musicTheme,
  generateOpProblem,
  banners,
}: Options) {
  const opMode = useProgressStore((s) => s.math[gameId].opMode)
  const ops = useProgressStore((s) => s.math[gameId].ops)
  const state = useProgressStore((s) => {
    const progress = s.math[gameId]
    return progress.opMode === 'mixed'
      ? progress.mixed
      : progress.ops[progress.opMode]
  })
  const recordAnswer = useProgressStore((s) => s.recordAnswer)
  const resetGame = useProgressStore((s) => s.resetGame)
  const { muted, setMuted, playSfx } = useGameMusic(musicTheme)

  const makeProblem = useCallback(() => {
    const progress = useProgressStore.getState().math[gameId]
    const op = progress.opMode === 'mixed' ? pickMixedOp() : progress.opMode
    return generateOpProblem(op, progress.ops[op].level)
  }, [gameId, generateOpProblem])

  const [problem, setProblem] = useState<Problem>(() => makeProblem())
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

  const nextProblem = useCallback(() => {
    clearTimers()
    setProblem(makeProblem())
    setValue('')
    setFeedback('idle')
    setHint(null)
    setLocked(false)
  }, [clearTimers, makeProblem])

  const nextProblemRef = useRef(nextProblem)
  nextProblemRef.current = nextProblem

  const skipOpModeEffect = useRef(true)
  useEffect(() => {
    if (skipOpModeEffect.current) {
      skipOpModeEffect.current = false
      return
    }
    nextProblemRef.current()
  }, [opMode])

  const scheduleNext = useCallback(
    (delayMs: number) => {
      const id = window.setTimeout(() => nextProblem(), delayMs)
      timersRef.current.push(id)
    },
    [nextProblem],
  )

  const submit = useCallback(() => {
    if (locked || value === '') return
    const guess = Number(value)
    if (Number.isNaN(guess)) return

    setLocked(true)
    const result = recordAnswer(gameId, guess === problem.answer, problem.type)

    if (result.correct) {
      playSfx('correct')
      setFeedback('correct')
      setBurstKey((k) => k + 1)
      setPopPoints(result.pointsEarned)
      setPopKey((k) => k + 1)
      setBanner(result.leveledUp ? banners.leveledUp : banners.correct)
      scheduleNext(CORRECT_DELAY_MS)
    } else {
      playSfx('wrong')
      setFeedback('wrong')
      setHint(problem.hint)
      setBanner(result.leveledDown ? banners.leveledDown : banners.wrong)
      scheduleNext(WRONG_DELAY_MS)
    }
  }, [
    banners,
    gameId,
    locked,
    playSfx,
    problem.answer,
    problem.hint,
    problem.type,
    recordAnswer,
    scheduleNext,
    value,
  ])

  const reset = useCallback(() => {
    clearTimers()
    resetGame(gameId)
    nextProblem()
    setBanner(null)
    setPopPoints(null)
  }, [clearTimers, gameId, nextProblem, resetGame])

  return {
    state,
    opMode,
    ops,
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
