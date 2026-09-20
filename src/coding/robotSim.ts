export type ArmorStyle = 'walls' | 'spikes'

export type Cell = '.' | '#' | 'H' | 'G' | 'S'

export type Dir = 0 | 1 | 2 | 3

export type BotCommand =
  | { type: 'forward'; n: number }
  | { type: 'left' }
  | { type: 'right' }
  | { type: 'back' }

export type SimEvent = 'ok' | 'bump' | 'hazard' | 'goal' | 'done'

export type BotState = {
  x: number
  y: number
  dir: Dir
  hp: number
  goal: boolean
}

export const DIR_DELTA: Record<Dir, readonly [number, number]> = {
  0: [0, -1],
  1: [1, 0],
  2: [0, 1],
  3: [-1, 0],
}

export const ARMOR_STATS: Record<
  ArmorStyle,
  { protection: number; speed: number; attack: number; hp: number }
> = {
  walls: { protection: 3, speed: 1, attack: 1, hp: 4 },
  spikes: { protection: 1, speed: 3, attack: 3, hp: 2 },
}

/** Clearance is OK when the printed part scale is near the mounting holes. */
export function printFits(scalePct: number): boolean {
  return scalePct >= 90 && scalePct <= 110
}

export const BUILD_ORDER = ['frame', 'motors', 'wheels', 'battery'] as const
export type BuildPart = (typeof BUILD_ORDER)[number]

export function nextBuildPart(assembled: readonly BuildPart[]): BuildPart | null {
  return BUILD_ORDER.find((part) => !assembled.includes(part)) ?? null
}

export function canAssemble(
  part: BuildPart,
  assembled: readonly BuildPart[],
): boolean {
  return nextBuildPart(assembled) === part
}

export const HAZARD_ROWS: string[] = [
  '##########',
  '#S.......#',
  '#...HH...#',
  '#..####..#',
  '#.......G#',
  '##########',
]

export function parseArena(rows: readonly string[] = HAZARD_ROWS): {
  grid: Cell[][]
  start: { x: number; y: number }
  goal: { x: number; y: number }
} {
  const grid: Cell[][] = rows.map((row) => [...row] as Cell[])
  let start = { x: 1, y: 1 }
  let goal = { x: 8, y: 4 }
  for (let y = 0; y < grid.length; y += 1) {
    const row = grid[y]!
    for (let x = 0; x < row.length; x += 1) {
      if (row[x] === 'S') start = { x, y }
      if (row[x] === 'G') goal = { x, y }
    }
  }
  return { grid, start, goal }
}

export function createBot(armor: ArmorStyle = 'walls'): BotState {
  const { start } = parseArena()
  return {
    x: start.x,
    y: start.y,
    dir: 1,
    hp: ARMOR_STATS[armor].hp,
    goal: false,
  }
}

function cellAt(grid: Cell[][], x: number, y: number): Cell {
  return grid[y]?.[x] ?? '#'
}

export function turnLeft(dir: Dir): Dir {
  return ((dir + 3) % 4) as Dir
}

export function turnRight(dir: Dir): Dir {
  return ((dir + 1) % 4) as Dir
}

export function stepBot(
  state: BotState,
  grid: Cell[][],
  command: BotCommand,
  armor: ArmorStyle,
): { state: BotState; event: SimEvent } {
  if (command.type === 'left') {
    return { state: { ...state, dir: turnLeft(state.dir) }, event: 'ok' }
  }
  if (command.type === 'right') {
    return { state: { ...state, dir: turnRight(state.dir) }, event: 'ok' }
  }

  const steps = command.type === 'back' ? 1 : Math.max(1, Math.min(8, command.n))
  const sign = command.type === 'back' ? -1 : 1
  let next = { ...state }
  let event: SimEvent = 'ok'

  for (let i = 0; i < steps; i += 1) {
    const [dx, dy] = DIR_DELTA[next.dir]
    const x = next.x + dx * sign
    const y = next.y + dy * sign
    const cell = cellAt(grid, x, y)
    if (cell === '#') {
      event = 'bump'
      break
    }
    next = { ...next, x, y }
    if (cell === 'H') {
      const hit = armor === 'walls' ? 1 : 2
      next = { ...next, hp: next.hp - hit }
      event = 'hazard'
      if (next.hp <= 0) break
    }
    if (cell === 'G') {
      next = { ...next, goal: true }
      event = 'goal'
    }
  }

  return { state: next, event }
}

export function runCommands(
  commands: readonly BotCommand[],
  armor: ArmorStyle = 'walls',
  rows?: readonly string[],
): { state: BotState; events: SimEvent[] } {
  const { grid } = parseArena(rows)
  let state = createBot(armor)
  const events: SimEvent[] = []
  for (const command of commands) {
    const result = stepBot(state, grid, command, armor)
    state = result.state
    events.push(result.event)
    if (state.hp <= 0 || state.goal) break
  }
  if (!state.goal && state.hp > 0) events.push('done')
  return { state, events }
}

export function expandCommands(raw: readonly BotCommand[]): BotCommand[] {
  const out: BotCommand[] = []
  for (const command of raw) {
    if (command.type === 'forward' && command.n > 1) {
      for (let i = 0; i < command.n; i += 1) out.push({ type: 'forward', n: 1 })
    } else {
      out.push(command)
    }
  }
  return out
}
