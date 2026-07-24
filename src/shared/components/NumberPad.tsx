import { useCallback, useEffect, useRef } from 'react'
import './numberPad.css'

type Props = {
  value: string
  onChange: (next: string) => void
  onSubmit: () => void
  disabled?: boolean
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'go'] as const
const MAX_DIGITS = 4

export function NumberPad({ value, onChange, onSubmit, disabled }: Props) {
  const valueRef = useRef(value)
  const disabledRef = useRef(disabled)
  const onChangeRef = useRef(onChange)
  const onSubmitRef = useRef(onSubmit)
  valueRef.current = value
  disabledRef.current = disabled
  onChangeRef.current = onChange
  onSubmitRef.current = onSubmit

  const press = useCallback((key: (typeof KEYS)[number]) => {
    if (disabledRef.current) return
    if (key === 'clear') {
      onChangeRef.current('')
      return
    }
    if (key === 'go') {
      onSubmitRef.current()
      return
    }
    if (valueRef.current.length >= MAX_DIGITS) return
    onChangeRef.current(valueRef.current + key)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (disabledRef.current) return
      if (event.metaKey || event.ctrlKey || event.altKey) return

      const target = event.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        if (event.key === 'Enter') {
          event.preventDefault()
          onSubmitRef.current()
        }
        return
      }

      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault()
        press(event.key as (typeof KEYS)[number])
        return
      }

      if (event.key === 'Backspace' || event.key === 'Delete') {
        event.preventDefault()
        press('clear')
        return
      }

      if (event.key === 'Enter') {
        event.preventDefault()
        press('go')
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [press])

  return (
    <div className="number-pad" role="group" aria-label="Number pad">
      {KEYS.map((key) => (
        <button
          key={key}
          type="button"
          className={`pad-key ${key === 'go' ? 'pad-go' : ''} ${key === 'clear' ? 'pad-clear' : ''}`}
          onPointerDown={(event) => {
            event.preventDefault()
            press(key)
          }}
          disabled={disabled}
        >
          {key === 'clear' ? '⌫' : key === 'go' ? 'Go' : key}
        </button>
      ))}
    </div>
  )
}
