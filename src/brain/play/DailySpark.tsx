import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BrainHeader } from '../BrainHeader'
import { PlayShell } from '../PlayShell'
import { useBrainAudio } from '../audio'
import { DAILY_SPARK_ORDER, brainGameById } from '../catalog'
import { brainPath } from '../host'
import { localDateKey, useBrainStore } from '../store'
import { ColorCatchPlay } from './ColorCatch'
import { EchoPathPlay } from './EchoPath'
import { FlashFindPlay } from './FlashFind'
import { HoldFastPlay } from './HoldFast'
import { PatternPeekPlay } from './PatternPeek'
import { ShapeTwistPlay } from './ShapeTwist'

const PLAY = {
  flash: FlashFindPlay,
  echo: EchoPathPlay,
  color: ColorCatchPlay,
  hold: HoldFastPlay,
  twist: ShapeTwistPlay,
  pattern: PatternPeekPlay,
} as const

export function DailySpark() {
  const { muted, setMuted } = useBrainAudio()
  const completeDaily = useBrainStore((s) => s.completeDaily)
  const [step, setStep] = useState(0)
  const [scores, setScores] = useState<number[]>([])
  const [saved, setSaved] = useState(false)

  const done = step >= DAILY_SPARK_ORDER.length
  const gameId = DAILY_SPARK_ORDER[step]
  const Game = gameId ? PLAY[gameId] : null
  const info = gameId ? brainGameById(gameId) : undefined
  const total = scores.reduce((sum, n) => sum + n, 0)

  useEffect(() => {
    if (!done || saved) return
    completeDaily(total, localDateKey())
    setSaved(true)
  }, [done, saved, total, completeDaily])

  if (done) {
    return (
      <PlayShell title="Daily Spark">
        <div className="brain-play-card">
          <p className="brain-prompt">Spark complete</p>
          <p className="brain-tagline">
            You visited all six gyms. Today’s spark score: {total}.
          </p>
          <ul className="brain-stats-row">
            {DAILY_SPARK_ORDER.map((id, i) => (
              <li key={id}>
                {brainGameById(id)?.title}: {scores[i] ?? 0}
              </li>
            ))}
          </ul>
          <Link className="brain-next" to={brainPath()}>
            Back to games
          </Link>
        </div>
      </PlayShell>
    )
  }

  return (
    <section className="brain-play">
      <BrainHeader
        title="Daily Spark"
        muted={muted}
        onToggleMute={() => setMuted(!muted)}
        backTo={brainPath()}
      />
      <p className="brain-skill">
        {step + 1} of {DAILY_SPARK_ORDER.length} · {info?.title}
      </p>
      <p className="brain-why">{info?.skill}</p>
      {Game ? (
        <Game
          spark
          onSparkComplete={(points) => {
            setScores((list) => [...list, points])
            setStep((n) => n + 1)
          }}
        />
      ) : null}
    </section>
  )
}
