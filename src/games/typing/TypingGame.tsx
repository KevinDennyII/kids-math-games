import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { MusicToggle } from '../../shared/audio/MusicToggle'
import { useGameMusic } from '../../shared/audio/useGameMusic'
import { CharacterSprite } from '../../shared/characters/CharacterSprite'
import { SPRITES } from '../../shared/characters/sprites'
import { BurstParticles } from '../../shared/motion/BurstParticles'
import { ScorePop } from '../../shared/motion/ScorePop'
import { applyAnswer } from '../../shared/math/adaptive'
import type { AdaptiveState } from '../../shared/math/types'
import { useProgressStore } from '../../shared/store/progressStore'
import { pickWord, typingConfigForLevel } from './wordBank'
import './typingTheme.css'

type FallingWord = {
  id: string
  text: string
  x: number
  y: number
}

const MAX_LIVES = 3

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
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

  const stateRef = useRef(saved)
  const wordsRef = useRef(words)
  const activeRef = useRef(activeId)
  const typedRef = useRef(typedCount)
  const playingRef = useRef(playing)
  const recoveringRef = useRef(recovering)
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
    recoveringRef.current = recovering
  }, [recovering])

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

      const result = applyAnswer(stateRef.current, false)
      persist(result.state)
      playSfx('wrong')

      setLives((L) => {
        const left = Math.max(0, L - missedIds.length)
        if (left <= 0) {
          setRecovering(true)
          setBanner(
            result.leveledDown
              ? 'Fox scooped the words! Slower rain — you’ve got this.'
              : 'Fox scooped the words! Hearts refilled — keep typing!',
          )
          window.setTimeout(() => {
            setLives(MAX_LIVES)
            setWords([])
            setActiveId(null)
            setTypedCount(0)
            setRecovering(false)
            setBanner('Ready? Words are falling again!')
            spawnAcc.current = 0
            lastTs.current = null
          }, 1600)
          return 0
        }
        setBanner('A word got away — type the lowest one first!')
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

      if (recoveringRef.current) {
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
        !recoveringRef.current &&
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

  useEffect(() => {
    if (!playing) return

    const onKey = (event: KeyboardEvent) => {
      if (recoveringRef.current) return
      if (event.metaKey || event.ctrlKey || event.altKey) return

      if (event.key === 'Escape') {
        setActiveId(null)
        setTypedCount(0)
        return
      }

      const key = event.key.length === 1 ? event.key.toLowerCase() : ''
      if (!/^[a-z]$/.test(key)) return
      event.preventDefault()

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

        const result = applyAnswer(stateRef.current, true)
        persist(result.state)
        setPopPoints(result.pointsEarned)
        setPopKey((k) => k + 1)
        setBanner(
          result.leveledUp
            ? 'Level up! Words will fall a little faster.'
            : `Nice! “${target.text}” cleared!`,
        )

        const remaining = list.filter((w) => w.id !== target!.id)
        wordsRef.current = remaining
        setWords(remaining)
        setActiveId(null)
        setTypedCount(0)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [playing, persist, playSfx])

  const start = () => {
    setPlaying(true)
    setWords([])
    wordsRef.current = []
    setActiveId(null)
    setTypedCount(0)
    setLives(MAX_LIVES)
    setRecovering(false)
    setBanner('Type the falling words before they reach the ground!')
    spawnAcc.current = 0
    lastTs.current = null
    window.setTimeout(() => spawnWord(), 400)
  }

  const config = typingConfigForLevel(saved.level)

  return (
    <main className="typing-shell">
      <div className="typing-sky" aria-hidden="true" />
      <header className="typing-top">
        <Link className="typing-back" to="/">
          ← Home
        </Link>
        <h1 className="typing-title">Fox Word Rain</h1>
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
            }}
          >
            Reset
          </button>
        </div>
      </header>

      <div className="typing-hud">
        <div className="typing-stat">
          <span>Score</span>
          <strong>{saved.score}</strong>
        </div>
        <div className="typing-stat">
          <span>Streak</span>
          <strong>{saved.correctStreak}</strong>
        </div>
        <div className="typing-stat">
          <span>Level</span>
          <strong>{saved.level}</strong>
        </div>
        <div className="typing-stat typing-lives" aria-label={`${lives} lives`}>
          <span>Lives</span>
          <strong>
            {'♥'.repeat(lives)}
            {'♡'.repeat(MAX_LIVES - lives)}
          </strong>
        </div>
      </div>

      <div className="typing-meta">
        <CharacterSprite
          src={SPRITES.fox}
          alt=""
          size="md"
          motion={playing ? 'hop' : 'sway'}
          celebrate={celebrating}
        />
        <p>
          Shared adventure for both kids · rain speeds up as you level
          {playing
            ? ` · up to ${config.maxWords} word${config.maxWords > 1 ? 's' : ''}`
            : ''}
        </p>
      </div>

      <section className="typing-arena" aria-label="Falling words arena">
        <BurstParticles trigger={burstKey} palette="race" />
        <ScorePop points={popPoints} keyId={popKey} />

        {!playing ? (
          <div className="typing-start">
            <h2>Catch the words!</h2>
            <p>
              Words fall from the sky. Type them before they hit the ground. The
              rain adapts — great for both kids, with room for your son to push
              ahead.
            </p>
            <button type="button" className="typing-start-btn" onClick={start}>
              Start Word Rain
            </button>
          </div>
        ) : (
          <>
            {words.map((w) => {
              const isActive = w.id === activeId
              const matched = isActive ? w.text.slice(0, typedCount) : ''
              const rest = isActive ? w.text.slice(typedCount) : w.text
              return (
                <div
                  key={w.id}
                  className={`falling-word ${isActive ? 'is-active' : ''}`}
                  style={{ left: `${w.x}%`, top: `${w.y}%` }}
                >
                  <span className="fw-matched">{matched}</span>
                  <span className="fw-rest">{rest}</span>
                </div>
              )
            })}
            <div className="typing-ground" aria-hidden="true" />
          </>
        )}
      </section>

      {banner ? <p className="typing-banner">{banner}</p> : null}
      {playing ? (
        <p className="typing-tip">
          Tip: type the <em>lowest</em> word first · Esc cancels your current word
        </p>
      ) : null}
    </main>
  )
}
