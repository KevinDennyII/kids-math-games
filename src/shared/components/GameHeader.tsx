import { Link } from 'react-router-dom'
import { MusicToggle } from '../audio/MusicToggle'
import './gameHeader.css'

type Props = {
  title: string
  muted: boolean
  onToggleMute: () => void
  onReset: () => void
  classPrefix: 'race' | 'academy' | 'typing'
}

/** Shared game chrome — home link, title, music, reset (composition over duplication). */
export function GameHeader({
  title,
  muted,
  onToggleMute,
  onReset,
  classPrefix,
}: Props) {
  return (
    <header className={`${classPrefix}-top game-header`}>
      <Link className={`${classPrefix}-back game-header-back`} to="/">
        ← Home
      </Link>
      <h1 className={`${classPrefix}-title game-header-title`}>{title}</h1>
      <div className={`${classPrefix}-actions game-header-actions`}>
        <MusicToggle muted={muted} onToggle={onToggleMute} />
        <button
          type="button"
          className={`${classPrefix}-reset game-header-reset`}
          onClick={onReset}
        >
          Reset
        </button>
      </div>
    </header>
  )
}
