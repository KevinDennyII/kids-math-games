import { MusicToggle } from '../shared/audio/MusicToggle'
import './coding.css'

type Props = {
  title: string
  muted: boolean
  onToggleMute: () => void
  onReset?: () => void
}

export function CodingHeader({ title, muted, onToggleMute, onReset }: Props) {
  return (
    <header className="coding-top game-header">
      <h1 className="coding-title game-header-title">{title}</h1>
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
