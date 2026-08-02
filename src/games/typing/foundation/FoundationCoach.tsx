import {
  FINGER_COLORS,
  FINGER_LABELS,
  fingerForLetter,
} from '../fingerMap'
import { FingerPlacementGuide, TypingKeyboard } from '../TypingKeyboard'
import './foundationCoach.css'

type Props = {
  highlightKeys: string[]
  prompt: string
  promptKind: 'key' | 'word'
  typedCount: number
  onKeyPress: (letter: string) => void
  placementMode?: boolean
}

export function FoundationCoach({
  highlightKeys,
  prompt,
  promptKind,
  typedCount,
  onKeyPress,
  placementMode = false,
}: Props) {
  const primary = highlightKeys[0]?.toLowerCase() ?? null
  const activeFinger = primary ? fingerForLetter(primary) : null
  const tipFinger =
    activeFinger && activeFinger !== 'th' ? activeFinger : null
  const guideKeys = placementMode ? [] : highlightKeys

  return (
    <div className={`foundation-coach ${placementMode ? 'is-placement' : ''}`}>
      <div className="foundation-coach-board">
        {!placementMode ? (
          <div
            key={`${promptKind}-${prompt}-${typedCount === 0 ? 'fresh' : typedCount}`}
            className="drill-cue"
            aria-live="polite"
          >
            {promptKind === 'key' ? (
              <span
                className="drill-cue-letter"
                style={
                  tipFinger
                    ? { background: FINGER_COLORS[tipFinger] }
                    : undefined
                }
              >
                {prompt.toUpperCase()}
              </span>
            ) : (
              <span className="drill-cue-word">
                <span className="fw-matched">{prompt.slice(0, typedCount)}</span>
                <span className="fw-rest">{prompt.slice(typedCount)}</span>
              </span>
            )}
            {tipFinger && promptKind === 'key' ? (
              <span className="drill-cue-finger">
                <span
                  className="drill-cue-swatch"
                  style={{ background: FINGER_COLORS[tipFinger] }}
                  aria-hidden="true"
                />
                {FINGER_LABELS[tipFinger]}
              </span>
            ) : null}
          </div>
        ) : (
          <p className="placement-cue">
            Park each finger on its glowing home key — match the colors below
          </p>
        )}

        <div className="foundation-keyboard-stage">
          <TypingKeyboard
            highlightKeys={guideKeys}
            showGuide={false}
            showHomePlacement
            showFingerLabels={placementMode}
            onKeyPress={placementMode ? undefined : onKeyPress}
            disabled={placementMode}
          />
        </div>

        <FingerPlacementGuide
          highlightKeys={guideKeys}
          className="foundation-finger-guide"
        />
      </div>
    </div>
  )
}
