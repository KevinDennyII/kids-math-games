import { useState } from 'react'
import { GameHeader } from '../../shared/components/GameHeader'
import { StreakBar } from '../../shared/components/StreakBar'
import { BurstParticles } from '../../shared/motion/BurstParticles'
import { ScorePop } from '../../shared/motion/ScorePop'
import { AnalogClock } from './AnalogClock'
import { ClockCrew } from './ClockCrew'
import { ClockTutorial } from './ClockTutorial'
import { PetRewardBurst } from './PetRewardBurst'
import { formatDigital } from './generateTimeProblem'
import { skillLabel } from './timeTypes'
import { useClockGame } from './useClockGame'
import './clockTheme.css'
import './clockTutorial.css'

type Phase = 'menu' | 'tutorial' | 'play'

export function ClockGame() {
  const [phase, setPhase] = useState<Phase>('menu')
  const game = useClockGame()
  const showTicks = game.state.level >= 3
  const emphasizeHour = game.problem.skill === 'oclock' || game.state.level === 1

  const displayHours =
    game.problem.mode === 'set' ? game.setHours : game.problem.hours
  const displayMinutes =
    game.problem.mode === 'set' ? game.setMinutes : game.problem.minutes

  const startPlay = () => setPhase('play')

  return (
    <main className="clock-shell">
      <div className="clock-sky" aria-hidden="true" />
      <div className="clock-sparkles" aria-hidden="true" />

      <GameHeader
        classPrefix="clock"
        title="It’s TIME!"
        muted={game.muted}
        onToggleMute={() => game.setMuted(!game.muted)}
        onReset={() => {
          game.reset()
          setPhase('menu')
        }}
      />

      {phase === 'menu' ? (
        <>
          <ClockCrew />
          <section className="clock-menu">
            <h2 className="clock-menu-title">Ready to tell time?</h2>
            <p className="clock-menu-body">
              Learn the clock step by step with a short hands-on lesson — or jump
              straight into the game.
            </p>
            <div className="clock-menu-actions">
              <button
                type="button"
                className="clock-menu-primary"
                onClick={() => setPhase('tutorial')}
              >
                Teach me first
              </button>
              <button
                type="button"
                className="clock-menu-secondary"
                onClick={startPlay}
              >
                Jump into telling time
              </button>
            </div>
            <p className="clock-menu-note">
              You can reopen the lesson anytime from the Lesson link in play.
            </p>
          </section>
        </>
      ) : null}

      {phase === 'tutorial' ? (
        <ClockTutorial onFinished={startPlay} onSkip={startPlay} />
      ) : null}

      {phase === 'play' ? (
        <>
          <StreakBar state={game.state} softTimerSeconds={25} />

          <div className="clock-skill-chip" aria-live="polite">
            <span className="clock-skill-label">Learning</span>
            <strong>{skillLabel(game.problem.skill)}</strong>
            <span className="clock-mode-pill">
              {game.problem.mode === 'read' ? 'Read the clock' : 'Set the hands'}
            </span>
            <button
              type="button"
              className="clock-lesson-link"
              onClick={() => setPhase('tutorial')}
            >
              Lesson
            </button>
          </div>

          <ClockCrew celebrating={game.celebrating} />

          <section
            className={`clock-play ${game.feedback === 'correct' ? 'is-correct' : ''} ${game.feedback === 'wrong' ? 'is-wrong' : ''}`}
          >
            <BurstParticles trigger={game.burstKey} palette="clock" />
            <PetRewardBurst
              trigger={game.burstKey}
              petIndex={game.rewardPetIndex}
            />
            {game.popPoints != null ? (
              <ScorePop points={game.popPoints} keyId={game.popKey} />
            ) : null}

            {game.banner ? (
              <p className="clock-banner" role="status">
                {game.banner}
              </p>
            ) : null}

            <p className="clock-prompt">{game.problem.prompt}</p>
            <p className="clock-prompt-sub">
              {game.problem.mode === 'read' ? (
                'Short hand = hours. Long hand = minutes (outer ring: 00, 05, 10…).'
              ) : (
                <>
                  Drag near the center to set the <strong>hour</strong>, outer
                  ring for <strong>minutes</strong>. Target:{' '}
                  <strong>{game.problem.answerWords}</strong>
                </>
              )}
            </p>

            <div className="clock-face-wrap">
              <AnalogClock
                hours={displayHours}
                minutes={displayMinutes}
                interactive={game.problem.mode === 'set' && !game.locked}
                onChange={game.setTime}
                celebrate={game.celebrating}
                emphasizeHour={emphasizeHour}
                showMinuteTicks={showTicks}
                level={game.state.level}
              />
            </div>

            {game.problem.mode === 'read' ? (
              <div
                className="clock-choices"
                role="group"
                aria-label="Time choices"
              >
                {game.problem.choices.map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    className="clock-choice"
                    disabled={game.locked}
                    onClick={() => game.submitRead(choice)}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            ) : (
              <div className="clock-set-actions">
                <p className="clock-set-readout" aria-live="polite">
                  Your time: <strong>{formatDigital(game.setHours, game.setMinutes)}</strong>
                </p>
                <button
                  type="button"
                  className="clock-check"
                  disabled={game.locked}
                  onClick={game.submitSet}
                >
                  Check time
                </button>
              </div>
            )}

            {game.hint ? (
              <p className="clock-hint" role="status">
                {game.hint}
              </p>
            ) : null}
          </section>
        </>
      ) : null}
    </main>
  )
}
