import type { MathGameId, MathOpMode } from '../math/types'
import { useProgressStore } from '../store/progressStore'
import './operationPicker.css'

const OP_CHOICES: { id: MathOpMode; label: string; symbol: string }[] = [
  { id: 'addition', label: 'Addition', symbol: '+' },
  { id: 'subtraction', label: 'Subtraction', symbol: '−' },
  { id: 'multiplication', label: 'Multiplication', symbol: '×' },
  { id: 'division', label: 'Division', symbol: '÷' },
  { id: 'mixed', label: 'Mixed', symbol: '★' },
]

type Props = {
  gameId: MathGameId
}

/** Shared operation picker; each button shows that track’s own level. */
export function OperationPicker({ gameId }: Props) {
  const opMode = useProgressStore((s) => s.math[gameId].opMode)
  const ops = useProgressStore((s) => s.math[gameId].ops)
  const setOpMode = useProgressStore((s) => s.setOpMode)

  return (
    <div
      className="op-picker"
      role="radiogroup"
      aria-label="Choose a math operation"
    >
      {OP_CHOICES.map((choice) => {
        const selected = choice.id === opMode
        return (
          <button
            key={choice.id}
            type="button"
            role="radio"
            aria-checked={selected}
            className={`op-picker-btn ${selected ? 'is-selected' : ''}`}
            onClick={() => setOpMode(gameId, choice.id)}
          >
            <span className="op-picker-symbol" aria-hidden="true">
              {choice.symbol}
            </span>
            <span className="op-picker-label">{choice.label}</span>
            {choice.id !== 'mixed' ? (
              <span className="op-picker-level">L{ops[choice.id].level}</span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
