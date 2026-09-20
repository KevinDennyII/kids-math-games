import { pick, shuffle, type Rng } from '../rng'

export const PEEK_SHAPES = ['circle', 'square', 'triangle'] as const
export const PEEK_COLORS = ['coral', 'gold', 'sky', 'mint'] as const

export type PeekShape = (typeof PEEK_SHAPES)[number]
export type PeekColor = (typeof PEEK_COLORS)[number]
export type PeekCount = 1 | 2 | 3

export type PeekCell = {
  shape: PeekShape
  color: PeekColor
  count: PeekCount
}

export type PeekRule = 'color-row' | 'count-row' | 'shape-col' | 'pair'

export type PeekTrial = {
  grid: (PeekCell | null)[]
  choices: PeekCell[]
  correctIndex: number
  rule: PeekRule
}

function cellEqual(a: PeekCell, b: PeekCell): boolean {
  return a.shape === b.shape && a.color === b.color && a.count === b.count
}

function cellAt(
  rule: PeekRule,
  row: number,
  col: number,
  palette: {
    colors: PeekColor[]
    shapes: PeekShape[]
  },
): PeekCell {
  if (rule === 'color-row') {
    return {
      shape: palette.shapes[col]!,
      color: palette.colors[row]!,
      count: 1,
    }
  }
  if (rule === 'count-row') {
    return {
      shape: palette.shapes[col]!,
      color: palette.colors[0]!,
      count: (row + 1) as PeekCount,
    }
  }
  if (rule === 'shape-col') {
    return {
      shape: palette.shapes[col]!,
      color: palette.colors[row]!,
      count: 2,
    }
  }
  return {
    shape: palette.shapes[col]!,
    color: palette.colors[row]!,
    count: (col + 1) as PeekCount,
  }
}

function ruleForLevel(level: number, rng: Rng): PeekRule {
  if (level <= 2) return 'color-row'
  if (level <= 4) return rng() < 0.5 ? 'count-row' : 'color-row'
  if (level <= 6) return rng() < 0.5 ? 'shape-col' : 'count-row'
  return 'pair'
}

function foilFor(correct: PeekCell, rng: Rng): PeekCell {
  const kind = randKind(rng)
  if (kind === 0) {
    return {
      ...correct,
      shape: pick(
        rng,
        PEEK_SHAPES.filter((shape) => shape !== correct.shape),
      ),
    }
  }
  if (kind === 1) {
    return {
      ...correct,
      color: pick(
        rng,
        PEEK_COLORS.filter((color) => color !== correct.color),
      ),
    }
  }
  const bump = (correct.count % 3) + 1
  return { ...correct, count: bump as PeekCount }
}

function randKind(rng: Rng): 0 | 1 | 2 {
  return Math.floor(rng() * 3) as 0 | 1 | 2
}

export function makePeekTrial(level: number, rng: Rng): PeekTrial {
  const rule = ruleForLevel(level, rng)
  const colors = shuffle(rng, PEEK_COLORS).slice(0, 3) as PeekColor[]
  const shapes = shuffle(rng, PEEK_SHAPES)
  const palette = { colors, shapes }
  const grid: (PeekCell | null)[] = []
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      if (row === 2 && col === 2) {
        grid.push(null)
      } else {
        grid.push(cellAt(rule, row, col, palette))
      }
    }
  }
  const correct = cellAt(rule, 2, 2, palette)
  const foils: PeekCell[] = []
  let guard = 0
  while (foils.length < 3 && guard < 40) {
    guard += 1
    const foil = foilFor(correct, rng)
    if (cellEqual(foil, correct)) continue
    if (foils.some((item) => cellEqual(item, foil))) continue
    foils.push(foil)
  }
  while (foils.length < 3) {
    foils.push({
      shape: 'triangle',
      color: 'mint',
      count: 3,
    })
  }
  const mixed = shuffle(rng, [correct, ...foils])
  return {
    grid,
    choices: mixed,
    correctIndex: mixed.findIndex((cell) => cellEqual(cell, correct)),
    rule,
  }
}

export function gradePeek(trial: PeekTrial, choiceIndex: number): boolean {
  return choiceIndex === trial.correctIndex
}
