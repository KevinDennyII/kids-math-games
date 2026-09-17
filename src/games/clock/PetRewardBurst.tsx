import { useEffect, useState, type CSSProperties } from 'react'
import { CharacterSprite } from '../../shared/characters/CharacterSprite'
import { ACADEMY_PETS } from '../../shared/characters/sprites'
import { usePrefersReducedMotion } from '../../shared/motion/usePrefersReducedMotion'
import './petRewardBurst.css'

type Props = {
  trigger: number
  petIndex: number
}

type Star = {
  id: number
  angle: number
  distance: number
  size: number
  delay: number
}

export function PetRewardBurst({ trigger, petIndex }: Props) {
  const prefersReduced = usePrefersReducedMotion()
  const [visible, setVisible] = useState(false)
  const [stars, setStars] = useState<Star[]>([])

  const pet = ACADEMY_PETS[((petIndex % ACADEMY_PETS.length) + ACADEMY_PETS.length) % ACADEMY_PETS.length]!

  useEffect(() => {
    if (trigger === 0) return
    setVisible(true)
    if (!prefersReduced) {
      setStars(
        Array.from({ length: 10 }, (_, i) => ({
          id: trigger * 100 + i,
          angle: (i / 10) * 360 + Math.random() * 24,
          distance: 56 + Math.random() * 70,
          size: 10 + Math.random() * 14,
          delay: Math.random() * 80,
        })),
      )
    }
    const t = window.setTimeout(() => {
      setVisible(false)
      setStars([])
    }, 1100)
    return () => window.clearTimeout(t)
  }, [trigger, prefersReduced])

  if (!visible) return null

  return (
    <div className="pet-reward" aria-hidden="true">
      <div className={`pet-reward-pop ${prefersReduced ? 'is-static' : ''}`}>
        <CharacterSprite src={pet.src} alt="" size="lg" motion="none" celebrate />
        <span className="pet-reward-label">{pet.label}!</span>
      </div>
      {stars.map((star) => (
        <span
          key={star.id}
          className="pet-reward-star"
          style={
            {
              '--angle': `${star.angle}deg`,
              '--distance': `${star.distance}px`,
              '--size': `${star.size}px`,
              animationDelay: `${star.delay}ms`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
