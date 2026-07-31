import { CharacterSprite } from '../../shared/characters/CharacterSprite'
import { SPRITES } from '../../shared/characters/sprites'

type Size = 'sm' | 'md'
type Motion = 'sway' | 'hop' | 'none'

type Props = {
  size?: Size
  motion?: Motion
  celebrate?: boolean
}

export function AstroFox({
  size = 'sm',
  motion = 'sway',
  celebrate = false,
}: Props) {
  const classes = [
    'typing-astro-fox',
    `typing-astro-fox-${size}`,
    motion !== 'none' ? `char-motion-${motion}` : '',
    celebrate ? 'is-celebrate' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes}>
      <CharacterSprite
        src={SPRITES.fox}
        alt=""
        size={size}
        motion="none"
      />
      <span className="typing-astro-helmet" aria-hidden="true" />
    </div>
  )
}
