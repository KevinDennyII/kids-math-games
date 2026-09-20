import type { ArmorStyle, BotState, Cell } from './robotSim'
import { parseArena } from './robotSim'
import { RobotView } from './RobotView'

type Props = {
  bot: BotState
  armor: ArmorStyle
  grid?: Cell[][]
}

const TILE_LABEL: Record<Cell, string> = {
  '#': 'wall',
  H: 'hazard',
  G: 'goal',
  S: 'start',
  '.': 'open',
}

export function ArenaGrid({ bot, armor, grid }: Props) {
  const arena = grid ?? parseArena().grid
  return (
    <div
      className="coding-arena"
      role="grid"
      style={{ gridTemplateColumns: `repeat(${arena[0]?.length ?? 10}, 1fr)` }}
    >
      {arena.map((row, y) =>
        row.map((cell, x) => {
          const here = bot.x === x && bot.y === y
          const show = here ? 'S' : cell === 'S' ? '.' : cell
          return (
            <div
              key={`${x}-${y}`}
              className={`coding-tile is-${TILE_LABEL[show]} ${here ? 'has-bot' : ''}`}
              role="gridcell"
            >
              {here ? <RobotView armor={armor} dir={bot.dir} size={28} /> : null}
              {!here && cell === 'G' ? <span className="coding-flag">⚑</span> : null}
            </div>
          )
        }),
      )}
    </div>
  )
}
