import { pick, randInt, type Rng } from '../rng'

export const FLASH_SHAPES = ['circle', 'square', 'diamond', 'star'] as const
export const FLASH_HUES = ['coral', 'gold', 'sky', 'mint', 'violet'] as const

export type FlashShape = (typeof FLASH_SHAPES)[number]
export type FlashHue = (typeof FLASH_HUES)[number]

export type FlashCell = {
  shape: FlashShape
  hue: FlashHue
}

export type FlashTrial = {
  size: number
  cells: FlashCell[]
  targetIndex: number
  flashMs: number
}

export function flashGridSize(level: number): number {
  return Math.min(6, 3 + Math.floor((Math.max(1, level) - 1) / 2))
}

export function flashDurationMs(level: number): number {
  return Math.max(200, 920 - (Math.max(1, level) - 1) * 85)
}

export function makeFlashTrial(level: number, rng: Rng): FlashTrial {
  const size = flashGridSize(level)
  const count = size * size
  const commonShape = pick(rng, FLASH_SHAPES)
  const commonHue = pick(rng, FLASH_HUES)
  const varyShape = rng() < 0.5
  const otherShape = pick(
    rng,
    FLASH_SHAPES.filter((shape) => shape !== commonShape),
  )
  const otherHue = pick(
    rng,
    FLASH_HUES.filter((hue) => hue !== commonHue),
  )
  const targetIndex = randInt(rng, 0, count)
  const cells = Array.from({ length: count }, (_, i) => {
    if (i !== targetIndex) {
      return { shape: commonShape, hue: commonHue }
    }
    return varyShape
      ? { shape: otherShape, hue: commonHue }
      : { shape: commonShape, hue: otherHue }
  })
  return { size, cells, targetIndex, flashMs: flashDurationMs(level) }
}

export function gradeFlash(trial: FlashTrial, tapIndex: number): boolean {
  return tapIndex === trial.targetIndex
}
