import {
  FINGER_COLORS,
  FINGER_LABELS,
  HOME_KEYS,
  KEYBOARD_ROWS,
  colorForLetter,
  fingerForLetter,
  type FingerId,
} from './fingerMap'
import './typingKeyboard.css'

type Props = {
  /** Next letter(s) the player should type — highlighted on the board. */
  highlightKeys?: string[]
  /** Levels 1–3: show hand-placement coach under the keys. */
  showGuide?: boolean
  /** Optional tap handler for tablet / mouse play. */
  onKeyPress?: (letter: string) => void
  disabled?: boolean
}

const LEFT_FINGERS: FingerId[] = ['lp', 'lr', 'lm', 'li']
const RIGHT_FINGERS: FingerId[] = ['ri', 'rm', 'rr', 'rp']

function HandGuide({
  side,
  activeFinger,
}: {
  side: 'left' | 'right'
  activeFinger: FingerId | null
}) {
  const fingers = side === 'left' ? LEFT_FINGERS : RIGHT_FINGERS
  const order = side === 'left' ? fingers : [...fingers].reverse()

  return (
    <div className={`tk-hand tk-hand-${side}`} aria-hidden="true">
      <div className="tk-fingers">
        {order.map((id) => (
          <span
            key={id}
            className={`tk-finger ${activeFinger === id ? 'is-active' : ''}`}
            style={{ background: FINGER_COLORS[id] }}
            title={FINGER_LABELS[id]}
          />
        ))}
      </div>
      <span
        className={`tk-thumb ${activeFinger === 'th' ? 'is-active' : ''}`}
        style={{ background: FINGER_COLORS.th }}
      />
      <span className="tk-hand-label">{side === 'left' ? 'L' : 'R'}</span>
    </div>
  )
}

export function TypingKeyboard({
  highlightKeys = [],
  showGuide = false,
  onKeyPress,
  disabled = false,
}: Props) {
  const highlight = new Set(highlightKeys.map((k) => k.toLowerCase()))
  const primary = highlightKeys[0]?.toLowerCase() ?? null
  const activeFinger = primary ? fingerForLetter(primary) : null
  const tipFinger = activeFinger && activeFinger !== 'th' ? activeFinger : null

  return (
    <div className="typing-keyboard" role="group" aria-label="Finger guide keyboard">
      <div className="tk-board">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={`tk-row tk-row-${rowIndex}`}
            style={{ ['--tk-offset' as string]: `${rowIndex * 1.1}rem` }}
          >
            {row.map((letter) => {
              const isHome = HOME_KEYS.has(letter)
              const isHot = highlight.has(letter)
              const color = colorForLetter(letter)
              const finger = fingerForLetter(letter)
              const label = finger ? FINGER_LABELS[finger] : letter

              return (
                <button
                  key={letter}
                  type="button"
                  className={[
                    'tk-key',
                    isHome ? 'is-home' : '',
                    isHot ? 'is-hot' : '',
                    letter === 'f' || letter === 'j' ? 'has-bump' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={{ ['--tk-color' as string]: color }}
                  aria-label={`${letter.toUpperCase()}, ${label}`}
                  disabled={disabled || !onKeyPress}
                  tabIndex={onKeyPress ? 0 : -1}
                  onPointerDown={(e) => {
                    if (!onKeyPress || disabled) return
                    e.preventDefault()
                    onKeyPress(letter)
                  }}
                >
                  <span className="tk-label">{letter.toUpperCase()}</span>
                  {(letter === 'f' || letter === 'j') && (
                    <span className="tk-bump" aria-hidden="true" />
                  )}
                </button>
              )
            })}
          </div>
        ))}

        <div className="tk-row tk-row-space">
          <button
            type="button"
            className="tk-key tk-space"
            style={{ ['--tk-color' as string]: FINGER_COLORS.th }}
            aria-label="Space, thumbs"
            disabled
            tabIndex={-1}
          >
            <span className="tk-label">space</span>
          </button>
        </div>
      </div>

      {showGuide ? (
        <div className="tk-guide">
          <HandGuide side="left" activeFinger={activeFinger} />
          <p className="tk-coach">
            {tipFinger ? (
              <>
                Use your <strong>{FINGER_LABELS[tipFinger].toLowerCase()}</strong>
                {primary ? (
                  <>
                    {' '}
                    for{' '}
                    <span
                      className="tk-coach-key"
                      style={{ background: colorForLetter(primary) }}
                    >
                      {primary.toUpperCase()}
                    </span>
                  </>
                ) : null}
              </>
            ) : (
              <>
                Rest fingers on the <strong>home row</strong> — bumps on{' '}
                <span className="tk-coach-key" style={{ background: FINGER_COLORS.li }}>
                  F
                </span>{' '}
                and{' '}
                <span className="tk-coach-key" style={{ background: FINGER_COLORS.ri }}>
                  J
                </span>
              </>
            )}
          </p>
          <HandGuide side="right" activeFinger={activeFinger} />
        </div>
      ) : null}
    </div>
  )
}
