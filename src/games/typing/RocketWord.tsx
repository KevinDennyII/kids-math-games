import { useEffect, useRef } from 'react'

const ROCKET_SKINS = ['rocket-mint', 'rocket-sky', 'rocket-ember'] as const

function rocketSkin(id: string) {
  let n = 0
  for (let i = 0; i < id.length; i++) n += id.charCodeAt(i)
  return ROCKET_SKINS[n % ROCKET_SKINS.length]!
}

type Props = {
  id: string
  x: number
  y: number
  matched: string
  rest: string
  active: boolean
  /** Register the node so the game loop can update `top` without React. */
  registerEl?: (id: string, el: HTMLDivElement | null) => void
}

/** Position (`top`) is also updated imperatively by the game loop — avoid putting
 *  fall motion through React state every frame (kills low-power devices). */
export function RocketWord({
  id,
  x,
  y,
  matched,
  rest,
  active,
  registerEl,
}: Props) {
  const nodeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!registerEl) return
    registerEl(id, nodeRef.current)
    return () => registerEl(id, null)
  }, [id, registerEl])

  return (
    <div
      ref={nodeRef}
      className={`falling-word ${rocketSkin(id)} ${active ? 'is-active' : ''}`}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <div className="rocket-flame" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="rocket-fins" aria-hidden="true">
        <span className="rocket-fin rocket-fin-l" />
        <span className="rocket-fin rocket-fin-r" />
      </div>
      <div className="rocket-cabin">
        <span className="fw-matched">{matched}</span>
        <span className="fw-rest">{rest}</span>
      </div>
      <span className="rocket-nose" aria-hidden="true" />
    </div>
  )
}
