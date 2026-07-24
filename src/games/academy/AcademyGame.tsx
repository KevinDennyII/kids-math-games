import { CharacterSprite } from '../../shared/characters/CharacterSprite'
import {
  ACADEMY_PETS,
  academyPetForLevel,
  SPRITES,
} from '../../shared/characters/sprites'
import { GameHeader } from '../../shared/components/GameHeader'
import { MathPlayPanel } from '../../shared/components/MathPlayPanel'
import { StreakBar } from '../../shared/components/StreakBar'
import { useAdaptiveProblemGame } from '../../shared/hooks/useAdaptiveProblemGame'
import { generateAcademyProblem } from '../../shared/math/generateProblem'
import './academyTheme.css'

const ACADEMY_BANNERS = {
  correct: 'Your pets are so happy!',
  leveledUp: 'New friendship magic unlocked!',
  wrong: 'Nice try! A little hint will help.',
  leveledDown: 'Soft landing — let’s try easier flowers.',
} as const

export function AcademyGame() {
  const game = useAdaptiveProblemGame({
    gameId: 'academy',
    musicTheme: 'academy',
    generateProblem: generateAcademyProblem,
    banners: ACADEMY_BANNERS,
  })

  const carePct = Math.min(
    100,
    20 + game.state.solved * 4 + game.state.correctStreak * 3,
  )
  const activePet = academyPetForLevel(game.state.level)

  return (
    <main className="academy-shell">
      <div className="academy-sparkles" aria-hidden="true" />
      <GameHeader
        classPrefix="academy"
        title="Magical Friendship Academy"
        muted={game.muted}
        onToggleMute={() => game.setMuted(!game.muted)}
        onReset={game.reset}
      />

      <StreakBar state={game.state} softTimerSeconds={30} />

      <div className="academy-care" aria-hidden="true">
        <div className="academy-friends">
          <div className="academy-fox-side">
            <CharacterSprite
              src={SPRITES.fox}
              alt=""
              size="md"
              motion="sway"
              celebrate={game.celebrating}
            />
            <span className="pet-chip">Fox friend</span>
          </div>

          <div className={`academy-hero-pet ${game.celebrating ? 'is-happy' : ''}`}>
            <CharacterSprite
              key={activePet.id}
              src={activePet.src}
              alt=""
              size="xl"
              motion="bob"
              celebrate={game.celebrating}
              className="academy-hero-art"
            />
            <span className="pet-chip pet-chip-hero">{activePet.label}</span>
          </div>
        </div>

        <div className="academy-pet-row">
          {ACADEMY_PETS.map((pet) => {
            const unlocked =
              game.state.level >= ACADEMY_PETS.findIndex((p) => p.id === pet.id) + 1
            const active = pet.id === activePet.id
            return (
              <div
                key={pet.id}
                className={`academy-pet-slot ${active ? 'is-active' : ''} ${unlocked ? 'is-unlocked' : ''}`}
              >
                <CharacterSprite
                  src={pet.src}
                  alt=""
                  size="sm"
                  motion={active ? 'hop' : 'none'}
                  celebrate={game.celebrating && active}
                />
                <span>{pet.label}</span>
              </div>
            )
          })}
        </div>

        <div className="care-meter">
          <div className="care-fill" style={{ width: `${carePct}%` }} />
        </div>
        <p className="care-label">Pet happiness</p>
      </div>

      <MathPlayPanel
        className="academy-play"
        bannerClassName="academy-banner"
        palette="academy"
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
      />
    </main>
  )
}
