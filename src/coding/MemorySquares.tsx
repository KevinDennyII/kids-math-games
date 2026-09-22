import { useEffect, useState } from 'react'

export type MemoryTile = {
  id: number
  pair: string
  label: string
}

const DEFAULT_TILES: MemoryTile[] = [
  { id: 0, pair: 'a', label: 'creeper' },
  { id: 1, pair: 'b', label: 'chicken' },
  { id: 2, pair: 'a', label: 'creeper' },
  { id: 3, pair: 'b', label: 'chicken' },
]

type Props = {
  /** When false, tiles are visible but not clickable. */
  enabled: boolean
  onWin: () => void
}

type Face = 'down' | 'up' | 'matched'

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const a = next[i]!
    next[i] = next[j]!
    next[j] = a
  }
  return next
}

export function MemorySquares({ enabled, onWin }: Props) {
  const [order, setOrder] = useState(() => shuffle(DEFAULT_TILES))
  const [faces, setFaces] = useState<Face[]>(() => DEFAULT_TILES.map(() => 'down'))
  const [picked, setPicked] = useState<number[]>([])
  const [locked, setLocked] = useState(false)
  const [won, setWon] = useState(false)

  useEffect(() => {
    if (!enabled) return
    setOrder(shuffle(DEFAULT_TILES))
    setFaces(DEFAULT_TILES.map(() => 'down'))
    setPicked([])
    setLocked(false)
    setWon(false)
  }, [enabled])

  const flip = (index: number) => {
    if (!enabled || locked || won) return
    if (faces[index] !== 'down') return
    if (picked.includes(index)) return

    const nextFaces = [...faces]
    nextFaces[index] = 'up'
    const nextPicked = [...picked, index]
    setFaces(nextFaces)
    setPicked(nextPicked)

    if (nextPicked.length < 2) return

    const [a, b] = nextPicked
    const tileA = order[a!]
    const tileB = order[b!]
    if (!tileA || !tileB) return

    setLocked(true)
    window.setTimeout(() => {
      if (tileA.pair === tileB.pair) {
        setFaces((prev) => {
          const matched = [...prev]
          matched[a!] = 'matched'
          matched[b!] = 'matched'
          return matched
        })
        const willWin =
          order.every((_, i) => i === a || i === b || faces[i] === 'matched')
        if (willWin) {
          setWon(true)
          onWin()
        }
      } else {
        setFaces((prev) => {
          const reset = [...prev]
          reset[a!] = 'down'
          reset[b!] = 'down'
          return reset
        })
      }
      setPicked([])
      setLocked(false)
    }, 520)
  }

  const restart = () => {
    setOrder(shuffle(DEFAULT_TILES))
    setFaces(DEFAULT_TILES.map(() => 'down'))
    setPicked([])
    setLocked(false)
    setWon(false)
  }

  return (
    <section className={`memory-squares${enabled ? '' : ' is-locked'}${won ? ' is-won' : ''}`}>
      <div className="memory-squares-bar">
        <span className="coding-kicker">Memory Squares</span>
        {enabled ? (
          <button type="button" className="coding-text-btn" onClick={restart}>
            Shuffle
          </button>
        ) : (
          <span className="memory-lock-note">Run your list first</span>
        )}
      </div>
      <div className="memory-grid" role="group" aria-label="Four memory tiles">
        {order.map((tile, index) => {
          const face = faces[index] ?? 'down'
          return (
            <button
              key={`${tile.id}-${index}`}
              type="button"
              className={`memory-tile is-${face}`}
              disabled={!enabled || face === 'matched' || locked}
              onClick={() => flip(index)}
              aria-label={face === 'down' ? 'Hidden tile' : tile.label}
            >
              <span className="memory-tile-inner">
                <span className="memory-tile-back">?</span>
                <span className="memory-tile-front" data-pair={tile.pair}>
                  {tile.label}
                </span>
              </span>
            </button>
          )
        })}
      </div>
      {won ? <p className="coding-ok">You matched both pairs — first app complete!</p> : null}
      {!enabled ? (
        <p className="coding-sub">
          Your Python list powers this game. Run it, then flip two tiles at a time.
        </p>
      ) : null}
    </section>
  )
}
