import './characterSprite.css'

type Size = 'sm' | 'md' | 'lg' | 'xl'

type Props = {
  src: string
  alt: string
  size?: Size
  /** Idle motion style */
  motion?: 'bob' | 'drive' | 'sway' | 'hop' | 'none'
  /** Trigger one-shot celebrate bounce */
  celebrate?: boolean
  className?: string
}

const SIZE_PX: Record<Size, number> = {
  sm: 48,
  md: 72,
  lg: 112,
  xl: 148,
}

export function CharacterSprite({
  src,
  alt,
  size = 'md',
  motion = 'bob',
  celebrate = false,
  className = '',
}: Props) {
  const px = SIZE_PX[size]
  const classes = [
    'char-sprite',
    motion !== 'none' ? `char-motion-${motion}` : '',
    celebrate ? 'is-celebrate' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <img
      className={classes}
      src={src}
      alt={alt}
      width={px}
      height={px}
      draggable={false}
      decoding="async"
    />
  )
}
