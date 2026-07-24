import type { AdaptiveState } from '../math/types'
import './streakBar.css'

type Props = {
  state: AdaptiveState
  softTimerSeconds: number
}

export function StreakBar({ state, softTimerSeconds }: Props) {
  return (
    <div className="streak-bar">
      <div className="streak-stat">
        <span className="streak-label">Score</span>
        <strong>{state.score}</strong>
      </div>
      <div className="streak-stat">
        <span className="streak-label">Streak</span>
        <strong>{state.correctStreak}</strong>
      </div>
      <div className="streak-stat">
        <span className="streak-label">Level</span>
        <strong>{state.level}</strong>
      </div>
      <div className="streak-stat streak-hint" title="Gentle pace guide">
        <span className="streak-label">Pace</span>
        <strong>~{softTimerSeconds}s</strong>
      </div>
    </div>
  )
}
