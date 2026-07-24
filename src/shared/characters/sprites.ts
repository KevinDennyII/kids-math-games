/** Cropped character art served from /public/characters */

export const SPRITES = {
  car: '/characters/car-red.png',
  carGreen: '/characters/car-green.png',
  badgeLightning: '/characters/badge-lightning.png',
  badgeFlame: '/characters/badge-flame.png',
  fox: '/characters/fox.png',
  dog: '/characters/dog.png',
  cat: '/characters/cat.png',
  unicorn: '/characters/unicorn.png',
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
