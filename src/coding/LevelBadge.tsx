import type { BadgeId } from './curriculum'

type Props = {
  badge: BadgeId
  /** Locked / earned / current for styling. */
  state?: 'locked' | 'earned' | 'current'
  size?: number
  title?: string
}

/** Minecraft-inspired item badges (original pixel art, not Mojang assets). */
export function LevelBadge({ badge, state = 'earned', size = 28, title }: Props) {
  return (
    <svg
      className={`level-badge is-${state}`}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      role="img"
      aria-label={title ?? badge}
    >
      <BadgeArt badge={badge} />
    </svg>
  )
}

function BadgeArt({ badge }: { badge: BadgeId }) {
  switch (badge) {
    case 'dirt':
      return (
        <>
          <rect width="24" height="24" rx="3" fill="#5b3a1f" />
          <rect x="2" y="2" width="20" height="10" fill="#3d7a34" />
          <rect x="2" y="12" width="20" height="10" fill="#8b5a2b" />
          <rect x="4" y="14" width="4" height="3" fill="#6b4423" />
          <rect x="14" y="16" width="5" height="3" fill="#6b4423" />
        </>
      )
    case 'wood':
      return (
        <>
          <rect width="24" height="24" rx="3" fill="#5c3d1e" />
          <rect x="3" y="3" width="18" height="18" fill="#a16207" />
          <rect x="5" y="5" width="14" height="3" fill="#854d0e" />
          <rect x="5" y="11" width="14" height="3" fill="#854d0e" />
          <rect x="5" y="17" width="14" height="2" fill="#854d0e" />
        </>
      )
    case 'cobble':
      return (
        <>
          <rect width="24" height="24" rx="3" fill="#3f3f46" />
          <rect x="2" y="2" width="9" height="9" fill="#71717a" />
          <rect x="13" y="2" width="9" height="9" fill="#52525b" />
          <rect x="2" y="13" width="9" height="9" fill="#52525b" />
          <rect x="13" y="13" width="9" height="9" fill="#a1a1aa" />
        </>
      )
    case 'iron':
      return (
        <>
          <rect width="24" height="24" rx="3" fill="#27272a" />
          <polygon points="12,3 20,8 20,16 12,21 4,16 4,8" fill="#d4d4d8" />
          <polygon points="12,6 17,9 17,15 12,18 7,15 7,9" fill="#a1a1aa" />
          <rect x="10" y="10" width="4" height="4" fill="#f4f4f5" />
        </>
      )
    case 'emerald':
      return (
        <>
          <rect width="24" height="24" rx="3" fill="#052e16" />
          <polygon points="12,2 20,8 20,16 12,22 4,16 4,8" fill="#10b981" />
          <polygon points="12,5 17,8 17,15 12,18 7,15 7,8" fill="#34d399" />
          <rect x="10" y="9" width="4" height="6" fill="#a7f3d0" />
        </>
      )
    case 'gold':
      return (
        <>
          <rect width="24" height="24" rx="3" fill="#422006" />
          <polygon points="12,3 20,8 20,16 12,21 4,16 4,8" fill="#fbbf24" />
          <polygon points="12,6 17,9 17,15 12,18 7,15 7,9" fill="#f59e0b" />
          <rect x="10" y="10" width="4" height="4" fill="#fde68a" />
        </>
      )
    case 'redstone':
      return (
        <>
          <rect width="24" height="24" rx="3" fill="#450a0a" />
          <circle cx="12" cy="12" r="8" fill="#dc2626" />
          <circle cx="12" cy="12" r="4" fill="#f87171" />
          <circle cx="12" cy="12" r="2" fill="#fecaca" />
        </>
      )
    case 'diamond':
      return (
        <>
          <rect width="24" height="24" rx="3" fill="#082f49" />
          <polygon points="12,2 21,9 17,21 7,21 3,9" fill="#22d3ee" />
          <polygon points="12,5 18,10 15,18 9,18 6,10" fill="#67e8f9" />
          <polygon points="12,7 15,10 12,16 9,10" fill="#ecfeff" />
        </>
      )
  }
}
