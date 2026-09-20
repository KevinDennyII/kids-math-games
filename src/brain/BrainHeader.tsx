import { Link } from 'react-router-dom'
import { MusicToggle } from '../shared/audio/MusicToggle'
import './brain.css'

type Props = {
  title: string
  muted: boolean
  onToggleMute: () => void
  backTo?: string
  onReset?: () => void
}

export function BrainHeader({
  title,
  muted,
  onToggleMute,
  backTo,
  onReset,
}: Props) {
  return (
    <header className="brain-top game-header">
        {backTo ? (
        <Link className="brain-back game-header-back" to={backTo}>
          ← Games
        </Link>
      ) : (
        <span className="brain-back is-ghost" aria-hidden>
          ← Games
        </span>
      )}
      <h1 className="brain-title game-header-title">{title}</h1>
      <div className="brain-actions-header game-header-actions">
        <MusicToggle muted={muted} onToggle={onToggleMute} />
        {onReset ? (
          <button type="button" className="brain-reset game-header-reset" onClick={onReset}>
            Reset
          </button>
        ) : null}
      </div>
    </header>
  )
}
