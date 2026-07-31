import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { MusicToggle } from '../../shared/audio/MusicToggle'
import { useGameMusic } from '../../shared/audio/useGameMusic'
import { BurstParticles } from '../../shared/motion/BurstParticles'
import { ScorePop } from '../../shared/motion/ScorePop'
import {
  applyAnswer,
  progressTowardNextLevel,
  type AdaptiveOptions,
} from '../../shared/math/adaptive'
import type { AdaptiveState } from '../../shared/math/types'
import { useProgressStore } from '../../shared/store/progressStore'
import { AstroFox } from './AstroFox'
import { RocketWord } from './RocketWord'
import { TypingKeyboard } from './TypingKeyboard'
import {
  TYPING_CORRECT_PER_LEVEL,
  TYPING_LEVEL_UP_BONUS,
  TYPING_MAX_LEVEL,
  TYPING_WRONG_TO_DROP,
  pickWord,
  typingConfigForLevel,
} from './wordBank'
import './typingTheme.css'

type FallingWord = {
  id: string
  text: string
  x: number
  y: number
}

type LevelReward = {
  level: number
  bonus: number
  label: string
}

const MAX_LIVES = 3

const TYPING_ADAPTIVE: AdaptiveOptions = {
  correctPerLevel: TYPING_CORRECT_PER_LEVEL,
  maxLevel: TYPING_MAX_LEVEL,
  wrongToDrop: TYPING_WRONG_TO_DROP,
  resetStreakOnWrong: false,
  levelUpBonus: TYPING_LEVEL_UP_BONUS,
}

const ORBIT_REWARDS = [
  'Moon Badge',
  'Comet Badge',
  'Nebula Badge',
  'Galaxy Badge',
  'Star Captain',
] as const

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function rewardName(level: number) {
  return ORBIT_REWARDS[Math.min(ORBIT_REWARDS.length, Math.max(1, level)) - 1]!
}

export function TypingGame() {
  const saved = useProgressStore((s) => s.typing)
  const setTyping = useProgressStore((s) => s.setTyping)
  const resetGame = useProgressStore((s) => s.resetGame)
  const { muted, setMuted, playSfx } = useGameMusic('typing')

  const [playing, setPlaying] = useState(false)
  const [words, setWords] = useState<FallingWord[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [typedCount, setTypedCount] = useState(0)
  const [lives, setLives] = useState(MAX_LIVES)
  const [banner, setBanner] = useState<string | null>(null)
  const [burstKey, setBurstKey] = useState(0)
  const [popPoints, setPopPoints] = useState<number | null>(null)
  const [popKey, setPopKey] = useState(0)
  const [recovering, setRecovering] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const [levelReward, setLevelReward] = useState<LevelReward | null>(null)

  const stateRef = useRef(saved)
  const wordsRef = useRef(words)
  const activeRef = useRef(activeId)
  const typedRef = useRef(typedCount)
  const playingRef = useRef(playing)
  const pausedRef = useRef(false)
  const lastTs = useRef<number | null>(null)
  const spawnAcc = useRef(0)

  useEffect(() => {
    stateRef.current = saved
  }, [saved])
  useEffect(() => {
    wordsRef.current = words
  }, [words])
  useEffect(() => {
    activeRef.current = activeId
  }, [activeId])
  useEffect(() => {
    typedRef.current = typedCount
  }, [typedCount])
  useEffect(() => {
    playingRef.current = playing
  }, [playing])
  useEffect(() => {
    pausedRef.current = recovering || levelReward != null
  }, [recovering, levelReward])

  const persist = useCallback(
    (next: AdaptiveState) => {
      stateRef.current = next
      setTyping(next)
    },
    [setTyping],
  )

  const spawnWord = useCallback(() => {
    const existing = wordsRef.current.map((w) => w.text)
    const text = pickWord(stateRef.current.level, existing)
    setWords((prev) => [
      ...prev,
      {
        id: uid(),
        text,
        x: 12 + Math.random() * 76,
        y: -4,
      },
    ])
  }, [])

  const handleMisses = useCallback(
    (missedIds: string[], missedActive: boolean) => {
      if (missedActive) {
        setActiveId(null)
        setTypedCount(0)
      }

      const result = applyAnswer(stateRef.current, false, TYPING_ADAPTIVE)
      persist(result.state)
      playSfx('wrong')

      setLives((L) => {
        const left = Math.max(0, L - missedIds.length)
        if (left <= 0) {
          setRecovering(true)
          setBanner(
            result.leveledDown
              ? 'Fox rescued the rockets! Slower flights — you’ve got this.'
              : 'Fox rescued the rockets! Hearts refilled — keep typing!',
          )
          window.setTimeout(() => {
            setLives(MAX_LIVES)
            setWords([])
            setActiveId(null)
            setTypedCount(0)
            setRecovering(false)
            setBanner('Ready? Rockets launching again!')
            spawnAcc.current = 0
            lastTs.current = null
          }, 1600)
          return 0
        }
        setBanner('A rocket got away — type the lowest one first!')
        return left
      })
    },
    [persist, playSfx],
  )

  useEffect(() => {
    if (!playing) return

    let raf = 0
    const tick = (ts: number) => {
      if (!playingRef.current) return

      if (pausedRef.current) {
        lastTs.current = ts
        raf = requestAnimationFrame(tick)
        return
      }

      if (lastTs.current == null) lastTs.current = ts
      const dt = Math.min(0.05, (ts - lastTs.current) / 1000)
      lastTs.current = ts

      const config = typingConfigForLevel(stateRef.current.level)
      spawnAcc.current += dt * 1000

      const moved = wordsRef.current.map((w) => ({
        ...w,
        y: w.y + config.fallSpeed * dt,
      }))
      const missed = moved.filter((w) => w.y >= 92)
      const kept = moved.filter((w) => w.y < 92)

      if (missed.length > 0) {
        const missedActive = missed.some((w) => w.id === activeRef.current)
        wordsRef.current = kept
        setWords(kept)
        handleMisses(
          missed.map((m) => m.id),
          missedActive,
        )
      } else {
        wordsRef.current = moved
        setWords(moved)
      }

      if (
        !pausedRef.current &&
        spawnAcc.current >= config.spawnMs &&
        wordsRef.current.length < config.maxWords
      ) {
        spawnAcc.current = 0
        spawnWord()
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, handleMisses, spawnWord])

  const pressChar = useCallback(
    (raw: string) => {
      if (pausedRef.current || !playingRef.current) return

      const key = raw.toLowerCase()
      if (!/^[a-z]$/.test(key)) return

      const list = wordsRef.current
      let active = activeRef.current
      let typed = typedRef.current
      let target = active ? list.find((w) => w.id === active) : undefined

      if (!target) {
        const candidates = list
          .filter((w) => w.text[0] === key)
          .sort((a, b) => b.y - a.y)
        target = candidates[0]
        if (!target) {
          playSfx('wrong')
          return
        }
        active = target.id
        typed = 1
        setActiveId(active)
        setTypedCount(typed)
      } else if (target.text[typed] === key) {
        typed += 1
        setTypedCount(typed)
      } else {
        playSfx('wrong')
        return
      }

      if (typed >= target.text.length) {
        playSfx('correct')
        setBurstKey((k) => k + 1)
        setCelebrating(true)
        window.setTimeout(() => setCelebrating(false), 500)

        const result = applyAnswer(stateRef.current, true, TYPING_ADAPTIVE)
        persist(result.state)
        setPopPoints(result.pointsEarned)
        setPopKey((k) => k + 1)

        const remaining = list.filter((w) => w.id !== target!.id)
        wordsRef.current = remaining
        setWords(remaining)
        setActiveId(null)
        setTypedCount(0)

        if (result.leveledUp) {
          const cfg = typingConfigForLevel(result.state.level)
          setLevelReward({
            level: result.state.level,
            bonus: TYPING_LEVEL_UP_BONUS,
            label: rewardName(result.state.level),
          })
          setBanner(`Orbit ${result.state.level} unlocked!`)
          window.setTimeout(() => {
            setLevelReward(null)
            setWords([])
            wordsRef.current = []
            spawnAcc.current = 0
            lastTs.current = null
            setBanner(`${cfg.label} — keep typing!`)
            window.setTimeout(() => spawnWord(), 350)
          }, 2800)
        } else {
          setBanner(`Blast off! “${target.text}” cleared!`)
        }
      }
    },
    [persist, playSfx, spawnWord],
  )

  useEffect(() => {
    if (!playing) return

    const onKey = (event: KeyboardEvent) => {
      if (pausedRef.current) return
      if (event.metaKey || event.ctrlKey || event.altKey) return

      if (event.key === 'Escape') {
        setActiveId(null)
        setTypedCount(0)
        return
      }

      const key = event.key.length === 1 ? event.key.toLowerCase() : ''
      if (!/^[a-z]$/.test(key)) return
      event.preventDefault()
      pressChar(key)
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [playing, pressChar])

  const start = () => {
    setPlaying(true)
    setWords([])
    wordsRef.current = []
    setActiveId(null)
    setTypedCount(0)
    setLives(MAX_LIVES)
    setRecovering(false)
    setLevelReward(null)
    setBanner('Type the rocket words before they land on the planet!')
    spawnAcc.current = 0
    lastTs.current = null
    window.setTimeout(() => spawnWord(), 400)
  }

  const config = typingConfigForLevel(saved.level)
  const atMaxOrbit = saved.level >= TYPING_MAX_LEVEL
  const orbitProgress = progressTowardNextLevel(
    saved.correctStreak,
    TYPING_CORRECT_PER_LEVEL,
  )
  const progressForBar = atMaxOrbit
    ? TYPING_CORRECT_PER_LEVEL
    : orbitProgress

  const highlightKeys = (() => {
    if (!playing || recovering || levelReward) return [] as string[]
    if (activeId) {
      const active = words.find((w) => w.id === activeId)
      const next = active?.text[typedCount]
      return next ? [next] : []
    }
    const starters = [...words]
      .sort((a, b) => b.y - a.y)
      .map((w) => w.text[0])
      .filter(Boolean) as string[]
    return [...new Set(starters)]
  })()

  return (
    <main className={`typing-shell ${playing ? 'is-playing' : ''}`}>
      <div className="typing-sky" aria-hidden="true" />
      <header className="typing-top">
        <Link className="typing-back" to="/">
          ← Home
        </Link>
        <div className="typing-brand">
          <h1 className="typing-title">Fox Rockets</h1>
          <div className="typing-hud" aria-label="Game stats">
            <div className="typing-stat">
              <span>Score</span>
              <strong>{saved.score}</strong>
            </div>
            <div className="typing-stat typing-orbit-stat">
              <span>Orbit</span>
              <strong>
                {saved.level}
                <span className="typing-orbit-stars" aria-hidden="true">
                  {'★'.repeat(saved.level)}
                  {'☆'.repeat(TYPING_MAX_LEVEL - saved.level)}
                </span>
              </strong>
            </div>
            <div
              className="typing-stat typing-lives"
              aria-label={`${lives} lives`}
            >
              <span>Lives</span>
              <strong>
                {'♥'.repeat(lives)}
                {'♡'.repeat(MAX_LIVES - lives)}
              </strong>
            </div>
          </div>
          {playing ? (
            <div
              className="typing-orbit-progress"
              aria-label={
                atMaxOrbit
                  ? 'Max orbit reached'
                  : `${progressForBar} of ${TYPING_CORRECT_PER_LEVEL} rockets to next orbit`
              }
            >
              <div className="typing-orbit-progress-label">
                {atMaxOrbit ? (
                  <span>Max orbit · Star Captain!</span>
                ) : (
                  <span>
                    Next orbit · {progressForBar}/{TYPING_CORRECT_PER_LEVEL}
                  </span>
                )}
              </div>
              <div className="typing-orbit-track">
                <div
                  className="typing-orbit-fill"
                  style={{
                    width: `${(progressForBar / TYPING_CORRECT_PER_LEVEL) * 100}%`,
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>
        <div className="typing-actions">
          <MusicToggle muted={muted} onToggle={() => setMuted(!muted)} />
          <button
            type="button"
            className="typing-reset"
            onClick={() => {
              resetGame('typing')
              setPlaying(false)
              setWords([])
              wordsRef.current = []
              setBanner(null)
              setLevelReward(null)
            }}
          >
            Reset
          </button>
        </div>
      </header>

      <section className="typing-arena" aria-label="Rocket words arena">
        <BurstParticles trigger={burstKey} palette="race" />
        <ScorePop points={popPoints} keyId={popKey} />

        <div className="typing-buddy" aria-hidden={!playing}>
          <AstroFox
            size="sm"
            motion={playing ? 'hop' : 'sway'}
            celebrate={celebrating || levelReward != null}
          />
          {!playing ? (
            <p className="typing-buddy-note">
              Clear {TYPING_CORRECT_PER_LEVEL} rockets to unlock each orbit
            </p>
          ) : (
            <p className="typing-buddy-note">
              Up to {config.maxWords} rocket{config.maxWords > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {!playing ? (
          <div className="typing-start">
            <h2>Launch the rockets!</h2>
            <p>
              Word rockets drift down from the stars. Type them before they land
              on the planet. Earn a space badge every orbit — take your time,
              levels stay gentle for growing typists.
            </p>
            <button type="button" className="typing-start-btn" onClick={start}>
              Start Fox Rockets
            </button>
          </div>
        ) : (
          <>
            {words.map((w) => {
              const isActive = w.id === activeId
              const matched = isActive ? w.text.slice(0, typedCount) : ''
              const rest = isActive ? w.text.slice(typedCount) : w.text
              return (
                <RocketWord
                  key={w.id}
                  id={w.id}
                  x={w.x}
                  y={w.y}
                  matched={matched}
                  rest={rest}
                  active={isActive}
                />
              )
            })}
            <div className="typing-ground" aria-hidden="true" />
          </>
        )}

        {levelReward ? (
          <div className="typing-reward" role="status" aria-live="polite">
            <div className="typing-reward-badge" aria-hidden="true">
              <span className="typing-reward-star">★</span>
            </div>
            <h2>Orbit {levelReward.level} unlocked!</h2>
            <p className="typing-reward-name">{levelReward.label}</p>
            <p className="typing-reward-bonus">+{levelReward.bonus} points</p>
            <AstroFox size="md" motion="hop" celebrate />
          </div>
        ) : null}

        {banner && !levelReward ? (
          <p className="typing-banner">{banner}</p>
        ) : null}
      </section>

      {playing ? (
        <div className="typing-controls">
          <TypingKeyboard
            highlightKeys={highlightKeys}
            showGuide={saved.level <= 3}
            onKeyPress={pressChar}
            disabled={recovering || levelReward != null}
          />
          <p className="typing-tip">
            {saved.level <= 3
              ? 'Match key colors to your fingers · type the lowest rocket first'
              : 'Tip: type the lowest rocket first · Esc cancels your current word'}
          </p>
        </div>
      ) : null}
    </main>
  )
}
