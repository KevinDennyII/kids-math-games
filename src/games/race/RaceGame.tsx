import { CharacterSprite } from '../../shared/characters/CharacterSprite'
import { SPRITES } from '../../shared/characters/sprites'
import { GameHeader } from '../../shared/components/GameHeader'
import { MathPlayPanel } from '../../shared/components/MathPlayPanel'
import { StreakBar } from '../../shared/components/StreakBar'
import { useAdaptiveProblemGame } from '../../shared/hooks/useAdaptiveProblemGame'
import { generateRaceProblem } from '../../shared/math/generateProblem'
import './raceTheme.css'

const RACE_BANNERS = {
  correct: 'Nitro boost! Great drive!',
  leveledUp: 'New track unlocked! Speed climbing!',
  wrong: 'Almost! Check the hint and try another.',
  leveledDown: 'Easy pit stop — try this level again.',
} as const

export function RaceGame() {
  const game = useAdaptiveProblemGame({
    gameId: 'race',
    musicTheme: 'race',
    generateProblem: generateRaceProblem,
    banners: RACE_BANNERS,
  })

  const progressPct = Math.min(
    100,
    (game.state.solved % 10) * 10 + game.state.correctStreak,
  )
  const showFlame = game.state.correctStreak >= 3
  const showLightning = game.state.level >= 2 || game.state.correctStreak >= 5

  return (
    <main className="race-shell">
      <div className="race-sky" aria-hidden="true" />
      <GameHeader
        classPrefix="race"
        title="Racecar Math League"
        muted={game.muted}
        onToggleMute={() => game.setMuted(!game.muted)}
        onReset={game.reset}
      />

      <StreakBar state={game.state} softTimerSeconds={15} />

      <div className="race-stage" aria-hidden="true">
        <div className="race-buddy-cheer">
          <CharacterSprite
            src={SPRITES.bunny}
            alt=""
            size="md"
            motion="hop"
            celebrate={game.celebrating}
          />
          <span className="race-buddy-label">Zap buddy</span>
        </div>

        <div className="race-track">
          <div className={`race-road ${game.celebrating ? 'is-boost' : ''}`}>
            <div className="race-dash" />
            <div className="race-car" style={{ left: `${progressPct}%` }}>
              <CharacterSprite
                src={SPRITES.car}
                alt=""
                size="lg"
                motion="drive"
                celebrate={game.celebrating}
                className="race-car-art"
              />
              {game.celebrating ? <span className="race-nitro" /> : null}
            </div>
          </div>
          <p className="race-lap">Lap progress</p>
        </div>

        <div className="race-badges">
          <img
            className={`race-badge ${showLightning ? 'is-earned' : ''}`}
            src={SPRITES.badgeLightning}
            alt=""
            width={56}
            height={56}
          />
          <img
            className={`race-badge ${showFlame ? 'is-earned' : ''}`}
            src={SPRITES.badgeFlame}
            alt=""
            width={56}
            height={56}
          />
        </div>
      </div>

      <MathPlayPanel
        className="race-play"
        bannerClassName="race-banner"
        palette="race"
        problem={game.problem}
        value={game.value}
        onChange={game.setValue}
        onSubmit={game.submit}
        feedback={game.feedback}
        hint={game.hint}
        locked={game.locked}
        banner={game.banner}
        burstKey={game.burstKey}
        popPoints={game.popPoints}
        popKey={game.popKey}
        showScratchPad={
          game.problem.layout === 'vertical' || game.problem.type === 'fraction'
        }
      />
    </main>
  )
}
