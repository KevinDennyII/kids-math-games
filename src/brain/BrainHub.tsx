import { Link } from 'react-router-dom'
import { CharacterSprite } from '../shared/characters/CharacterSprite'
import { SPRITES } from '../shared/characters/sprites'
import { useBrainAudio } from './audio'
import { BrainHeader } from './BrainHeader'
import { BRAIN_GAMES } from './catalog'
import { brainPath } from './host'
import { localDateKey, useBrainStore } from './store'

export function BrainHub() {
  const { muted, setMuted } = useBrainAudio()
  const reset = useBrainStore((s) => s.reset)
  const games = useBrainStore((s) => s.games)
  const dailyDate = useBrainStore((s) => s.dailyDate)
  const dailyScore = useBrainStore((s) => s.dailyScore)
  const dailyComplete = useBrainStore((s) => s.dailyComplete)
  const today = localDateKey()
  const sparkDone = dailyComplete && dailyDate === today

  return (
    <section className="brain-hub">
      <BrainHeader
        title="Brain Games"
        muted={muted}
        onToggleMute={() => setMuted(!muted)}
        onReset={reset}
      />
      <p className="brain-tagline">
        Short puzzles for kids growing new skills and grown-ups keeping them
        sharp. Same games — they get harder as you go.
      </p>
      <div className="brain-fox">
        <CharacterSprite src={SPRITES.fox} alt="" size="md" motion="hop" />
        <span>Fox is your gym buddy</span>
      </div>

      <div className="brain-actions">
        <Link className="brain-cta is-daily" to={brainPath('daily')}>
          <span className="brain-kicker">
            {sparkDone ? `Today’s spark · ${dailyScore}` : 'Five-minute mix'}
          </span>
          <span className="brain-cta-title">Daily Spark</span>
          <span className="brain-cta-copy">
            {sparkDone
              ? 'Already sparked today — play again for fun, or pick a gym below.'
              : 'A taste of every workout: speed, memory, control, space, and patterns.'}
          </span>
        </Link>
        {BRAIN_GAMES.map((game) => {
          const progress = games[game.id]
          return (
            <Link key={game.id} className="brain-cta" to={brainPath(game.id)}>
              <span className="brain-kicker">{game.kicker}</span>
              <span className="brain-cta-title">{game.title}</span>
              <span className="brain-cta-copy">{game.blurb}</span>
              <span className="brain-cta-copy">
                Level {progress.level} · best streak {progress.bestStreak}
              </span>
            </Link>
          )
        })}
      </div>

      <p className="brain-note">
        These games exercise attention, memory, speed, and flexible thinking —
        the same families of tasks university labs use. They are not a medical
        treatment, and they do not prevent or treat dementia. Sleep, movement,
        friends, hearing, and heart health still matter most.
      </p>
    </section>
  )
}
