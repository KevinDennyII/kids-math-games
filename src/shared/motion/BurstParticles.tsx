import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'
import './burstParticles.css'

type Particle = {
  id: number
  angle: number
  distance: number
  size: number
  hue: number
  duration: number
}

type Props = {
  trigger: number
  palette?: 'race' | 'academy'
}

function random(min: number, max: number) {
  return Math.random() * (max - min) + min
}

export function BurstParticles({ trigger, palette = 'academy' }: Props) {
  const prefersReduced = usePrefersReducedMotion()
  const [particles, setParticles] = useState<Particle[]>([])

  const baseHue = palette === 'race' ? 30 : 320

  useEffect(() => {
    if (trigger === 0 || prefersReduced) return

    const next: Particle[] = Array.from({ length: 12 }, (_, i) => ({
      id: trigger * 100 + i,
      angle: random(200, 340),
      distance: random(40, 110),
      size: random(8, 16),
      hue: baseHue + random(-30, 40),
      duration: random(700, 1100),
    }))
    setParticles(next)

    const t = window.setTimeout(() => setParticles([]), 1200)
    return () => window.clearTimeout(t)
  }, [trigger, prefersReduced, baseHue])

  const nodes = useMemo(
    () =>
      particles.map((p) => (
        <span
          key={p.id}
          className="burst-particle"
          style={
            {
              '--angle': `${p.angle}deg`,
              '--distance': `${p.distance}px`,
              '--size': `${p.size}px`,
              '--hue': String(p.hue),
              animationDuration: `${p.duration}ms`,
            } as CSSProperties
          }
        />
      )),
    [particles],
  )

  if (prefersReduced || particles.length === 0) return null

  return <div className="burst-layer" aria-hidden="true">{nodes}</div>
}
