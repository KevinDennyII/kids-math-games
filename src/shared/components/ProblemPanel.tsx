import { useEffect, useRef } from 'react'
import { SPRITES } from '../characters/sprites'
import type { Problem, ProblemIcon } from '../math/types'
import './problemPanel.css'

type Props = {
  problem: Problem
  value: string
  onChange: (next: string) => void
  onSubmit: () => void
  feedback: 'idle' | 'correct' | 'wrong'
  hint?: string | null
  disabled?: boolean
}

const ICON_SRC: Record<ProblemIcon, string> = {
  dog: SPRITES.dog,
  cat: SPRITES.cat,
  unicorn: SPRITES.unicorn,
  fox: SPRITES.fox,
}

function IconGroup({
  count,
  icon,
  label,
}: {
  count: number
  icon: ProblemIcon
  label: string
}) {
  const src = ICON_SRC[icon]
  return (
    <span className="prompt-icons" aria-label={`${count} ${label}`}>
      {Array.from({ length: count }, (_, i) => (
        <img
          key={i}
          className="prompt-icon"
          src={src}
          alt=""
          width={28}
          height={28}
          draggable={false}
          decoding="async"
        />
      ))}
    </span>
  )
}

function VerticalMultiply({ problem }: { problem: Problem }) {
  const [top = 0, bottom = 0] = problem.operands ?? []
  return (
    <div className="problem-prompt problem-prompt-vertical" aria-label={problem.prompt}>
      <span className="vert-row vert-top">{top}</span>
      <span className="vert-row vert-times">
        <span className="vert-op" aria-hidden="true">
          ×
        </span>
        <span>{bottom}</span>
      </span>
      <span className="vert-rule" aria-hidden="true" />
    </div>
  )
}

function VisualPrompt({ problem }: { problem: Problem }) {
  if (
    problem.layout === 'vertical' &&
    problem.type === 'multiplication' &&
    problem.operands?.length === 2
  ) {
    return <VerticalMultiply problem={problem} />
  }

  const icon = problem.visualIcon
  const [left = 0, right = 0] = problem.operands ?? []
  if (!icon || problem.type !== 'word-addition') {
    return <p className="problem-prompt">{problem.prompt}</p>
  }

  const label =
    icon === 'dog'
      ? 'puppies'
      : icon === 'cat'
        ? 'kitties'
        : icon === 'unicorn'
          ? 'unicorns'
          : 'fox friends'

  return (
    <div className="problem-prompt problem-prompt-visual" aria-label={problem.prompt}>
      <IconGroup count={left} icon={icon} label={label} />
      <span className="prompt-op" aria-hidden="true">
        +
      </span>
      <IconGroup count={right} icon={icon} label={label} />
    </div>
  )
}

export function ProblemPanel({
  problem,
  value,
  onChange,
  onSubmit,
  feedback,
  hint,
  disabled,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus()
    }
  }, [problem.id, disabled])

  return (
    <div className={`problem-panel feedback-${feedback}`}>
      <VisualPrompt problem={problem} />
      <label className="problem-answer-label" htmlFor="answer-input">
        Your answer
      </label>
      <input
        ref={inputRef}
        id="answer-input"
        className="problem-answer"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        enterKeyHint="done"
        value={value}
        disabled={disabled}
        onChange={(event) => {
          const next = event.target.value.replace(/\D/g, '').slice(0, 4)
          onChange(next)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            onSubmit()
          }
        }}
        placeholder="—"
        aria-label="Your answer"
      />
      {hint ? <p className="problem-hint">{hint}</p> : null}
    </div>
  )
}
