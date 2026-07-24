/** Cropped character art served from /public/characters
 *  Active set: smoothed v2 assets (Jul 2026)
 *  Previous cropped set kept in /public/characters/v1-cropped/
 */

const V = 'v2'

export const SPRITES = {
  car: `/characters/car-red.png?${V}`,
  carGreen: `/characters/car-green.png?${V}`,
  truck: `/characters/truck-blue.png?${V}`,
  badgeLightning: `/characters/badge-lightning.png?${V}`,
  badgeFlame: `/characters/badge-flame.png?${V}`,
  badgeStar: `/characters/badge-star.png?${V}`,
  fox: `/characters/fox.png?${V}`,
  dog: `/characters/dog.png?${V}`,
  cat: `/characters/cat.png?${V}`,
  unicorn: `/characters/unicorn.png?${V}`,
  turtle: `/characters/turtle.png?${V}`,
  bunny: `/characters/bunny.png?${V}`,
  penguin: `/characters/penguin.png?${V}`,
} as const

export type SpriteId = keyof typeof SPRITES

/** Daughter pets cycle by academy level */
export const ACADEMY_PETS = [
  { id: 'dog' as const, label: 'Puppy', src: SPRITES.dog },
  { id: 'cat' as const, label: 'Kitty', src: SPRITES.cat },
  { id: 'unicorn' as const, label: 'Unicorn', src: SPRITES.unicorn },
]

export function academyPetForLevel(level: number) {
  const idx = Math.min(2, Math.max(0, level - 1))
  return ACADEMY_PETS[idx]!
}
