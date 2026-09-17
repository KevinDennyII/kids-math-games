import { useCallback, useEffect, useRef, useState } from 'react'
import { useGameMusic } from '../../shared/audio/useGameMusic'
import { useProgressStore } from '../../shared/store/progressStore'
import { generateTimeProblem, isSetCorrect } from './generateTimeProblem'
import type { ClockProblem } from './timeTypes'

const CORRECT_DELAY_MS = 1000
const WRONG_DELAY_MS = 1500

const BANNERS = {
  correct: 'Yes! Star burst!',
  leveledUp: 'Level up — you’re getting faster at time!',
  wrong: 'Almost! Check the hint and try again.',
  leveledDown: 'Easy practice — try this skill again.',
} as const

function randomStartAwayFrom(hours: number, minutes: number) {
  let h = ((hours + 3 - 1) % 12) + 1
  let m = (minutes + 25) % 60
  if (h === hours && m === minutes) {
    h = hours === 12 ? 1 : hours + 1
  }
  return { hours: h, minutes: m }
}

export function useClockGame() {
  const state = useProgressStore((s) => s.clock)
  const recordClockAnswer = useProgressStore((s) => s.recordClockAnswer)
  const resetGame = useProgressStore((s) => s.resetGame)
  const { muted, setMuted, playSfx } = useGameMusic('clock')

  const makeProblem = useCallback(() => {
    const level = useProgressStore.getState().clock.level
    return generateTimeProblem(level)
  }, [])

  const [problem, setProblem] = useState<ClockProblem>(() => makeProblem())
  const [setHours, setSetHours] = useState(12)
  const [setMinutes, setSetMinutes] = useState(0)
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [hint, setHint] = useState<string | null>(null)
  const [burstKey, setBurstKey] = useState(0)
  const [popPoints, setPopPoints] = useState<number | null>(null)
  const [popKey, setPopKey] = useState(0)
  const [locked, setLocked] = useState(false)
  const [banner, setBanner] = useState<string | null>(null)
  const [rewardPetIndex, setRewardPetIndex] = useState(0)
  const rewardCountRef = useRef(0)

  const timersRef = useRef<number[]>([])
  const problemRef = useRef(problem)
  problemRef.current = problem

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) window.clearTimeout(id)
    timersRef.current = []
  }, [])

  useEffect(() => () => clearTimers(), [clearTimers])

  const armProblem = useCallback((next: ClockProblem) => {
    setProblem(next)
    setFeedback('idle')
    setHint(null)
    setLocked(false)
    setBanner(null)
    if (next.mode === 'set') {
      const start = randomStartAwayFrom(next.hours, next.minutes)
      setSetHours(start.hours)
      setSetMinutes(start.minutes)
    }
  }, [])

  const nextProblem = useCallback(() => {
    clearTimers()
    armProblem(makeProblem())
  }, [armProblem, clearTimers, makeProblem])

  const finish = useCallback(
    (correct: boolean) => {
      setLocked(true)
      const result = recordClockAnswer(correct)
      const current = problemRef.current

      if (correct) {
        const petIndex = rewardCountRef.current % 3
        rewardCountRef.current += 1
        setRewardPetIndex(petIndex)
        playSfx('ding')
        setFeedback('correct')
        setBurstKey((k) => k + 1)
        setPopPoints(result.pointsEarned)
        setPopKey((k) => k + 1)
        setBanner(result.leveledUp ? BANNERS.leveledUp : BANNERS.correct)
        const id = window.setTimeout(nextProblem, CORRECT_DELAY_MS)
        timersRef.current.push(id)
      } else {
        playSfx('wrong')
        setFeedback('wrong')
        setHint(current.hint)
        setBanner(result.leveledDown ? BANNERS.leveledDown : BANNERS.wrong)
        const id = window.setTimeout(() => {
          setLocked(false)
          setFeedback('idle')
        }, WRONG_DELAY_MS)
        timersRef.current.push(id)
      }
    },
    [nextProblem, playSfx, recordClockAnswer],
  )

  const submitRead = useCallback(
    (choice: string) => {
      if (locked || problem.mode !== 'read') return
      finish(choice === problem.answerDigital)
    },
    [finish, locked, problem],
  )

  const submitSet = useCallback(() => {
    if (locked || problem.mode !== 'set') return
    const level = useProgressStore.getState().clock.level
    finish(
      isSetCorrect(
        problem.hours,
        problem.minutes,
        setHours,
        setMinutes,
        level,
      ),
    )
  }, [finish, locked, problem, setHours, setMinutes])

  const setTime = useCallback(
    (h: number, m: number) => {
      if (locked || problem.mode !== 'set') return
      setSetHours(h)
      setSetMinutes(m)
    },
    [locked, problem.mode],
  )

  const reset = useCallback(() => {
    clearTimers()
    rewardCountRef.current = 0
    resetGame('clock')
    armProblem(generateTimeProblem(1))
  }, [armProblem, clearTimers, resetGame])

  return {
    state,
    problem,
    setHours,
    setMinutes,
    setTime,
    feedback,
    hint,
    burstKey,
    rewardPetIndex,
    popPoints,
    popKey,
    locked,
    banner,
    celebrating: feedback === 'correct',
    muted,
    setMuted,
    submitRead,
    submitSet,
    reset,
  }
}
