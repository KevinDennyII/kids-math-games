import { useEffect, useRef, useState } from 'react'
import type { Mission } from './curriculum'
import { checkAnswer } from './curriculum'
import { canSpeak, speakLines, stopSpeaking } from './speak'

const MIN_LISTEN_MS = 5000

type Phase = 'listen' | 'check'

type Props = {
  mission: Mission
  onPassed: () => void
}

export function MissionFlow({ mission, onPassed }: Props) {
  const [phase, setPhase] = useState<Phase>('listen')
  const [playing, setPlaying] = useState(false)
  const [heard, setHeard] = useState(false)
  const [choice, setChoice] = useState<string | null>(null)
  const [wrong, setWrong] = useState(false)
  const stopRef = useRef<(() => void) | null>(null)
  const heardTimer = useRef(0)

  useEffect(() => {
    setPhase('listen')
    setPlaying(false)
    setHeard(false)
    setChoice(null)
    setWrong(false)
    stopSpeaking()
    window.clearTimeout(heardTimer.current)
    heardTimer.current = window.setTimeout(() => setHeard(true), MIN_LISTEN_MS)
    return () => {
      stopRef.current?.()
      window.clearTimeout(heardTimer.current)
      stopSpeaking()
    }
  }, [mission.id])

  const playBriefing = () => {
    stopRef.current?.()
    setPlaying(true)
    stopRef.current = speakLines(mission.briefing, () => {
      setPlaying(false)
      setHeard(true)
    })
    if (!canSpeak()) {
      setPlaying(false)
      setHeard(true)
    }
  }

  const submitCheck = (option: string) => {
    setChoice(option)
    if (checkAnswer(mission, option)) {
      setWrong(false)
      onPassed()
      return
    }
    setWrong(true)
    setPhase('listen')
    setHeard(false)
    window.clearTimeout(heardTimer.current)
    heardTimer.current = window.setTimeout(() => setHeard(true), MIN_LISTEN_MS)
  }

  return (
    <section className={`coding-panel ${wrong ? 'is-wrong' : ''}`} aria-live="polite">
      {phase === 'listen' ? (
        <>
          <p className="coding-kicker">Listen first</p>
          <h2>{mission.title}</h2>
          <p className="coding-sub">{mission.subtitle}</p>
          <ol className="coding-briefing">
            {mission.briefing.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
          <div className="coding-row">
            <button type="button" className="coding-btn coding-btn-play" onClick={playBriefing}>
              {playing ? 'Fox is talking…' : canSpeak() ? 'Play briefing' : 'Read the briefing'}
            </button>
            <button
              type="button"
              className="coding-btn"
              disabled={!heard}
              onClick={() => {
                stopRef.current?.()
                setPlaying(false)
                setPhase('check')
                setChoice(null)
                setWrong(false)
              }}
            >
              {heard ? 'I listened' : 'Listen / read first'}
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="coding-kicker">Check</p>
          <h2>What did Fox say?</h2>
          <p className="coding-sub">{mission.check.question}</p>
          <div className="coding-choices">
            {mission.check.options.map((option) => (
              <button
                key={option}
                type="button"
                className={`coding-choice ${choice === option ? 'is-picked' : ''}`}
                onClick={() => submitCheck(option)}
              >
                {option}
              </button>
            ))}
          </div>
          {wrong ? (
            <p className="coding-warn">Not quite — listen again. Following the briefing is the skill.</p>
          ) : null}
        </>
      )}
    </section>
  )
}
