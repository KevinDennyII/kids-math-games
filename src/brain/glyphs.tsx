import type { FlashCell } from './engines/flashFind'
import type { PeekCell } from './engines/patternPeek'
import type { TwistCell } from './engines/shapeTwist'
import { HUE_HEX } from './hues'

function shapePath(shape: FlashCell['shape'] | PeekCell['shape'], cx: number, cy: number, r: number) {
  if (shape === 'circle') {
    return <circle cx={cx} cy={cy} r={r} />
  }
  if (shape === 'square') {
    return <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} rx={r * 0.2} />
  }
  if (shape === 'diamond') {
    return (
      <polygon
        points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`}
      />
    )
  }
  if (shape === 'triangle') {
    return (
      <polygon
        points={`${cx},${cy - r} ${cx + r},${cy + r} ${cx - r},${cy + r}`}
      />
    )
  }
  // star
  const pts: string[] = []
  for (let i = 0; i < 5; i += 1) {
    const outer = ((i * 72 - 90) * Math.PI) / 180
    const inner = (((i * 72 + 36) - 90) * Math.PI) / 180
    pts.push(`${cx + Math.cos(outer) * r},${cy + Math.sin(outer) * r}`)
    pts.push(`${cx + Math.cos(inner) * r * 0.42},${cy + Math.sin(inner) * r * 0.42}`)
  }
  return <polygon points={pts.join(' ')} />
}

export function FlashGlyph({ cell }: { cell: FlashCell }) {
  const fill = HUE_HEX[cell.hue] ?? '#fff'
  return (
    <svg viewBox="0 0 64 64" className="brain-glyph" aria-hidden="true">
      <g fill={fill}>{shapePath(cell.shape, 32, 32, 20)}</g>
    </svg>
  )
}

export function PeekGlyph({ cell }: { cell: PeekCell }) {
  const fill = HUE_HEX[cell.color] ?? '#fff'
  const positions =
    cell.count === 1
      ? [[32, 32]]
      : cell.count === 2
        ? [
            [22, 32],
            [42, 32],
          ]
        : [
            [32, 20],
            [20, 42],
            [44, 42],
          ]
  return (
    <svg viewBox="0 0 64 64" className="brain-glyph" aria-hidden="true">
      <g fill={fill}>
        {positions.map(([x, y], i) => (
          <g key={i}>{shapePath(cell.shape, x, y, cell.count === 1 ? 16 : 10)}</g>
        ))}
      </g>
    </svg>
  )
}

export function TwistBoard({
  cells,
  label,
}: {
  cells: readonly TwistCell[]
  label: string
}) {
  const maxX = Math.max(...cells.map((c) => c[0]), 0)
  const maxY = Math.max(...cells.map((c) => c[1]), 0)
  const cols = maxX + 1
  const rows = maxY + 1
  const pad = 8
  const cell = 22
  const w = cols * cell + pad * 2
  const h = rows * cell + pad * 2
  const filled = new Set(cells.map((c) => `${c[0]},${c[1]}`))

  return (
    <figure className="brain-twist-board">
      <svg viewBox={`0 0 ${w} ${h}`} width="132" height="132" role="img" aria-label={label}>
        {Array.from({ length: rows * cols }, (_, i) => {
          const x = i % cols
          const y = Math.floor(i / cols)
          const on = filled.has(`${x},${y}`)
          return (
            <rect
              key={`${x}-${y}`}
              x={pad + x * cell}
              y={pad + y * cell}
              width={cell - 3}
              height={cell - 3}
              rx="5"
              fill={on ? '#c4b5fd' : 'rgb(255 255 255 / 0.08)'}
              stroke={on ? '#ede9fe' : 'rgb(255 255 255 / 0.12)'}
            />
          )
        })}
      </svg>
      <figcaption>{label}</figcaption>
    </figure>
  )
}

export function HoldStar() {
  return (
    <svg viewBox="0 0 80 80" className="brain-hold-icon" aria-hidden="true">
      <polygon
        fill="#fbbf24"
        points="40,6 49,28 73,30 55,46 61,70 40,57 19,70 25,46 7,30 31,28"
      />
    </svg>
  )
}

export function HoldStop() {
  return (
    <svg viewBox="0 0 80 80" className="brain-hold-icon" aria-hidden="true">
      <polygon
        fill="#fb7185"
        points="28,8 52,8 72,28 72,52 52,72 28,72 8,52 8,28"
      />
      <rect x="22" y="36" width="36" height="8" rx="3" fill="#1e1b4b" />
    </svg>
  )
}
