import { pick, randInt, type Rng } from '../rng'

export type TwistCell = readonly [number, number]
export type TwistAnswer = 'same' | 'flip'

const PIECES: TwistCell[][] = [
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [2, 1],
  ],
  [
    [0, 0],
    [1, 0],
    [1, 1],
    [2, 1],
  ],
  [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, 2],
  ],
  [
    [0, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ],
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [1, 1],
  ],
]

export function rotate90(cells: readonly TwistCell[]): TwistCell[] {
  return cells.map(([x, y]) => [y, -x] as const)
}

export function mirrorX(cells: readonly TwistCell[]): TwistCell[] {
  return cells.map(([x, y]) => [-x, y] as const)
}

export function normalizeCells(cells: readonly TwistCell[]): TwistCell[] {
  const minX = Math.min(...cells.map((cell) => cell[0]))
  const minY = Math.min(...cells.map((cell) => cell[1]))
  return cells
    .map(([x, y]) => [x - minX, y - minY] as const)
    .sort((a, b) => a[0] - b[0] || a[1] - b[1])
}

export function cellsKey(cells: readonly TwistCell[]): string {
  return normalizeCells(cells)
    .map((cell) => cell.join(','))
    .join(';')
}

export function isRotationOf(
  candidate: readonly TwistCell[],
  reference: readonly TwistCell[],
): boolean {
  let current: TwistCell[] = [...reference]
  for (let i = 0; i < 4; i += 1) {
    if (cellsKey(current) === cellsKey(candidate)) return true
    current = rotate90(current)
  }
  return false
}

function rotateN(cells: readonly TwistCell[], turns: number): TwistCell[] {
  let current: TwistCell[] = [...cells]
  for (let i = 0; i < turns; i += 1) {
    current = rotate90(current)
  }
  return current
}

export type TwistTrial = {
  reference: TwistCell[]
  candidate: TwistCell[]
  answer: TwistAnswer
}

export function makeTwistTrial(level: number, rng: Rng): TwistTrial {
  const piece = pick(rng, PIECES)
  const turns = 1 + randInt(rng, 0, 3)
  let wantFlip = rng() < (Math.max(1, level) >= 3 ? 0.5 : 0.35)
  const mirrored = mirrorX(piece)

  if (wantFlip && isRotationOf(mirrored, piece)) {
    wantFlip = false
  }

  const candidate = wantFlip
    ? rotateN(mirrored, turns)
    : rotateN(piece, turns)

  const answer: TwistAnswer = isRotationOf(candidate, piece) ? 'same' : 'flip'

  return {
    reference: normalizeCells(piece),
    candidate: normalizeCells(candidate),
    answer,
  }
}

export function gradeTwist(trial: TwistTrial, choice: TwistAnswer): boolean {
  return choice === trial.answer
}
