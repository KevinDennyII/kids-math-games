import './musicToggle.css'

type Props = {
  muted: boolean
  onToggle: () => void
  className?: string
}

export function MusicToggle({ muted, onToggle, className = '' }: Props) {
  return (
    <button
      type="button"
      className={`music-toggle ${className}`}
      onClick={onToggle}
      aria-pressed={!muted}
      aria-label={muted ? 'Unmute music' : 'Mute music'}
      title={muted ? 'Unmute music' : 'Mute music'}
    >
      {muted ? 'Music off' : 'Music on'}
    </button>
  )
}
