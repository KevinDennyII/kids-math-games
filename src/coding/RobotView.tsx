import type { ArmorStyle, Dir } from './robotSim'

type Props = {
  armor: ArmorStyle
  dir?: Dir
  size?: number
}

const NOSE: Record<Dir, string> = {
  0: '12,4 20,14 4,14',
  1: '20,12 10,4 10,20',
  2: '12,20 20,10 4,10',
  3: '4,12 14,4 14,20',
}

export function RobotView({ armor, dir = 1, size = 88 }: Props) {
  const wall = armor === 'walls'
  return (
    <svg
      className="coding-bot"
      viewBox="0 0 80 80"
      width={size}
      height={size}
      role="img"
      aria-label={wall ? 'Walled robot' : 'Spike robot'}
    >
      <rect x="18" y="22" width="44" height="36" rx="6" fill="#1d4a5c" stroke="#7dd3fc" strokeWidth="2.5" />
      {wall ? (
        <>
          <rect x="14" y="18" width="8" height="44" rx="2" fill="#64748b" />
          <rect x="58" y="18" width="8" height="44" rx="2" fill="#64748b" />
          <rect x="16" y="16" width="48" height="8" rx="2" fill="#94a3b8" />
        </>
      ) : (
        <>
          <polygon points="12,28 4,40 12,52" fill="#fb7185" />
          <polygon points="68,28 76,40 68,52" fill="#fb7185" />
          <polygon points="28,16 40,6 52,16" fill="#fb7185" />
        </>
      )}
      <circle cx="24" cy="64" r="8" fill="#0f172a" stroke="#fbbf24" strokeWidth="3" />
      <circle cx="56" cy="64" r="8" fill="#0f172a" stroke="#fbbf24" strokeWidth="3" />
      <rect x="32" y="30" width="16" height="10" rx="2" fill="#22d3ee" />
      <polygon points={NOSE[dir]} fill="#fbbf24" transform="translate(28 22) scale(1.05)" />
    </svg>
  )
}
