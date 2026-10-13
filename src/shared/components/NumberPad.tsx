import { useCallback, useEffect, useRef } from 'react'
import './numberPad.css'

type Props = {
  value: string
  onChange: (next: string) => void
  onSubmit: () => void
  disabled?: boolean
  /** Allow a slash key for fraction answers (n/d). */
  allowFraction?: boolean
}

const KEYS_NUMBER = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'go'] as const
const KEYS_FRACTION = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '/', '0', 'clear', 'go'] as const
const MAX_DIGITS = 4
const MAX_FRACTION_CHARS = 7

export function NumberPad({
  value,
  onChange,
  onSubmit,
  disabled,
  allowFraction = false,
}: Props) {
  const valueRef = useRef(value)
  const disabledRef = useRef(disabled)
  const onChangeRef = useRef(onChange)
  const onSubmitRef = useRef(onSubmit)
  const allowFractionRef = useRef(allowFraction)
  valueRef.current = value
  disabledRef.current = disabled
  onChangeRef.current = onChange
  onSubmitRef.current = onSubmit
  allowFractionRef.current = allowFraction

  const keys = allowFraction ? KEYS_FRACTION : KEYS_NUMBER

  const press = useCallback((key: string) => {
    if (disabledRef.current) return
    if (key === 'clear') {
      onChangeRef.current(valueRef.current.slice(0, -1))
      return
    }
    if (key === 'go') {
      onSubmitRef.current()
      return
    }
    if (key === '/') {
      if (!allowFractionRef.current) return
      if (valueRef.current.includes('/')) return
      if (valueRef.current.length === 0) return
      onChangeRef.current(`${valueRef.current}/`)
      return
    }
    const max = allowFractionRef.current ? MAX_FRACTION_CHARS : MAX_DIGITS
    if (valueRef.current.length >= max) return
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
        press(event.key)
        return
      }

      if (event.key === '/' && allowFractionRef.current) {
        event.preventDefault()
        press('/')
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
    <div
      className={`number-pad ${allowFraction ? 'number-pad-fraction' : ''}`}
      role="group"
      aria-label="Number pad"
    >
      {keys.map((key) => (
        <button
          key={key}
          type="button"
          className={`pad-key ${key === 'go' ? 'pad-go' : ''} ${key === 'clear' ? 'pad-clear' : ''} ${key === '/' ? 'pad-slash' : ''}`}
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
