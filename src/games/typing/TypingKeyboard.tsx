import {
  FINGER_COLORS,
  FINGER_LABELS,
  HOME_KEYS,
  KEYBOARD_ROWS,
  colorForLetter,
  displayKeyLabel,
  fingerForLetter,
  type FingerId,
  type KeyDef,
} from './fingerMap'
import './typingKeyboard.css'

type Props = {
  /** Next letter(s) the player should type — highlighted on the board. */
  highlightKeys?: string[]
  /** Levels 1–3: show hand-placement coach under the keys. */
  showGuide?: boolean
  /**
   * Emphasize home-row resting keys (A S D F · J K L ;) and F/J bumps
   * so beginners know where to park their hands first.
   */
  showHomePlacement?: boolean
  /** Print short finger names on home keys (foundation coaching). */
  showFingerLabels?: boolean
  /** Optional tap handler for tablet / mouse play. */
  onKeyPress?: (letter: string) => void
  disabled?: boolean
}

const LEFT_FINGERS: FingerId[] = ['lp', 'lr', 'lm', 'li']
const RIGHT_FINGERS: FingerId[] = ['ri', 'rm', 'rr', 'rp']

const FINGER_SHORT: Record<FingerId, string> = {
  lp: 'pinky',
  lr: 'ring',
  lm: 'middle',
  li: 'index',
  ri: 'index',
  rm: 'middle',
  rr: 'ring',
  rp: 'pinky',
  th: 'thumbs',
}

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

/** Color-scheme L/R finger coach — can sit inside or outside the keyboard chrome. */
export function FingerPlacementGuide({
  highlightKeys = [],
  className = '',
}: {
  highlightKeys?: string[]
  className?: string
}) {
  const primary = highlightKeys[0]?.toLowerCase() ?? null
  const activeFinger = primary ? fingerForLetter(primary) : null
  const tipFinger = activeFinger && activeFinger !== 'th' ? activeFinger : null

  return (
    <div className={`tk-guide ${className}`.trim()} aria-live="polite">
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
                  {displayKeyLabel(primary)}
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
  )
}

function BoardKey({
  keyDef,
  highlight,
  labelHome,
  showFingerLabels,
  onKeyPress,
  disabled,
}: {
  keyDef: KeyDef
  highlight: Set<string>
  labelHome: boolean
  showFingerLabels: boolean
  onKeyPress?: (letter: string) => void
  disabled: boolean
}) {
  const { id, label, wide, decorative } = keyDef
  const isHome = HOME_KEYS.has(id)
  const isHot = highlight.has(id)
  const isBump = id === 'f' || id === 'j'
  const color = colorForLetter(id)
  const finger = fingerForLetter(id)
  const fingerName = finger ? FINGER_LABELS[finger] : label
  const canType = Boolean(onKeyPress) && !decorative && !disabled

  return (
    <button
      type="button"
      className={[
        'tk-key',
        wide ? `is-wide-${wide}` : '',
        decorative ? 'is-decorative' : '',
        isHome ? 'is-home' : '',
        labelHome && isHome ? 'is-home-rest' : '',
        isHot ? 'is-hot' : '',
        isBump ? 'has-bump' : '',
        labelHome && isBump ? 'is-bump-guide' : '',
        isHot && finger ? 'is-finger-target' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      data-key={id}
      style={{ ['--tk-color' as string]: color }}
      aria-label={`${label}, ${fingerName}${
        labelHome && isHome ? ', home row resting key' : ''
      }${decorative ? ', guide only' : ''}`}
      disabled={!canType}
      tabIndex={canType ? 0 : -1}
      onPointerDown={(e) => {
        if (!canType || !onKeyPress) return
        e.preventDefault()
        onKeyPress(id)
      }}
    >
      <span className="tk-label">{label}</span>
      {isBump && <span className="tk-bump" aria-hidden="true" />}
      {showFingerLabels && isHome && finger ? (
        <span className="tk-finger-label">{FINGER_SHORT[finger]}</span>
      ) : null}
      {labelHome && isBump ? (
        <span className="tk-bump-tag" aria-hidden="true">
          bump
        </span>
      ) : null}
    </button>
  )
}

export function TypingKeyboard({
  highlightKeys = [],
  showGuide = false,
  showHomePlacement = false,
  showFingerLabels = false,
  onKeyPress,
  disabled = false,
}: Props) {
  const highlight = new Set(highlightKeys.map((k) => k.toLowerCase()))
  const labelHome = showHomePlacement || showFingerLabels

  return (
    <div
      className={`typing-keyboard ${labelHome ? 'show-home-placement' : ''} ${showFingerLabels ? 'show-finger-labels' : ''}`}
      role="group"
      aria-label="Finger guide keyboard"
    >
      <div className="tk-board">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className={`tk-row tk-row-${rowIndex}`}>
            {row.map((keyDef) => (
              <BoardKey
                key={keyDef.id}
                keyDef={keyDef}
                highlight={highlight}
                labelHome={labelHome}
                showFingerLabels={showFingerLabels}
                onKeyPress={onKeyPress}
                disabled={disabled}
              />
            ))}
          </div>
        ))}

        <div className="tk-row tk-row-space">
          <button
            type="button"
            className={[
              'tk-key',
              'tk-space',
              labelHome ? 'is-home-rest' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            data-key="space"
            style={{ ['--tk-color' as string]: FINGER_COLORS.th }}
            aria-label="Space, thumbs"
            disabled
            tabIndex={-1}
          >
            <span className="tk-label">space</span>
            {showFingerLabels ? (
              <span className="tk-finger-label tk-finger-label-space">thumbs</span>
            ) : null}
          </button>
        </div>
      </div>

      {showGuide ? <FingerPlacementGuide highlightKeys={highlightKeys} /> : null}
    </div>
  )
}
