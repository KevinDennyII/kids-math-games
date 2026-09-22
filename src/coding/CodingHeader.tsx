import { MusicToggle } from '../shared/audio/MusicToggle'
import { LabMascots } from './LabMascots'
import './coding.css'

type Props = {
  title: string
  status?: string
  statusKind?: 'ready' | 'loading' | 'error' | 'cold'
  muted: boolean
  onToggleMute: () => void
  onReset?: () => void
  /** Bumps when a lesson is solved — mascots re-enter with a spring. */
  cheer?: number
}

export function CodingHeader({
  title,
  status,
  statusKind = 'cold',
  muted,
  onToggleMute,
  onReset,
  cheer = 0,
}: Props) {
  return (
    <header className="coding-top game-header">
      <div className="coding-brand">
        <h1 className="coding-title game-header-title">{title}</h1>
        {status ? (
          <p className="coding-engine" data-status={statusKind}>
            {status}
          </p>
        ) : null}
      </div>
      <LabMascots key={cheer} />
      <div className="coding-actions game-header-actions">
        <MusicToggle muted={muted} onToggle={onToggleMute} />
        {onReset ? (
          <button type="button" className="coding-reset game-header-reset" onClick={onReset}>
            Reset
          </button>
        ) : null}
      </div>
    </header>
  )
}
