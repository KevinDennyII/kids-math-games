import { useMemo, useState } from 'react'
import { musicEngine } from '../../shared/audio/musicEngine'
import { AnalogClock } from './AnalogClock'
import { formatDigital, isSetCorrect } from './generateTimeProblem'
import './clockTutorial.css'

type StepId =
  | 'welcome'
  | 'hour-hand'
  | 'oclock-try'
  | 'minute-hand'
  | 'half-try'
  | 'count-fives'
  | 'ready'

type Step = {
  id: StepId
  title: string
  body: string
  tip?: string
  hours: number
  minutes: number
  showMinuteHand: boolean
  showMinuteLabels: boolean
  emphasizeHour?: boolean
  emphasizeMinute?: boolean
  interactive?: boolean
  dragMode?: 'both' | 'hour' | 'minute'
  /** Practice: set hands to this time */
  trySet?: { hours: number; minutes: number; label: string }
  /** Practice: pick the matching digital time */
  tryRead?: { answer: string; choices: string[] }
}

const STEPS: Step[] = [
  {
    id: 'welcome',
    title: 'Meet the clock',
    body: 'A clock is a circle number line. The short pink hand tells the hour. The long orange hand tells the minutes.',
    tip: 'We’ll learn one hand at a time — that’s the secret.',
    hours: 3,
    minutes: 0,
    showMinuteHand: true,
    showMinuteLabels: false,
    emphasizeHour: true,
    emphasizeMinute: true,
  },
  {
    id: 'hour-hand',
    title: 'The hour hand',
    body: 'The short hand points to the hour. When it points right at 4, it is 4 o’clock — if the long hand is on 12.',
    tip: 'Try it: drag near the center and point the short hand at 4.',
    hours: 12,
    minutes: 0,
    showMinuteHand: false,
    showMinuteLabels: false,
    emphasizeHour: true,
    interactive: true,
    dragMode: 'hour',
    trySet: { hours: 4, minutes: 0, label: '4 o’clock' },
  },
  {
    id: 'oclock-try',
    title: 'O’clock check',
    body: 'When the long hand points straight up at 12, we say “o’clock.” The short hand tells which hour.',
    tip: 'What time is showing?',
    hours: 7,
    minutes: 0,
    showMinuteHand: true,
    showMinuteLabels: false,
    emphasizeHour: true,
    tryRead: {
      answer: '7:00',
      choices: ['7:00', '12:00', '7:30', '5:00'],
    },
  },
  {
    id: 'minute-hand',
    title: 'The minute hand',
    body: 'The long hand counts minutes. Straight down at 6 means 30 minutes — half past the hour. The short hand sits halfway between hours.',
    tip: 'Watch how the short hand has crept past 2 toward 3.',
    hours: 2,
    minutes: 30,
    showMinuteHand: true,
    showMinuteLabels: false,
    emphasizeMinute: true,
    emphasizeHour: true,
  },
  {
    id: 'half-try',
    title: 'Try half past',
    body: 'Drag the long hand to 6 (outer ring) and the short hand near 5 for half past 5.',
    tip: 'Center = hour, outer ring = minutes.',
    hours: 12,
    minutes: 0,
    showMinuteHand: true,
    showMinuteLabels: false,
    emphasizeMinute: true,
    interactive: true,
    dragMode: 'both',
    trySet: { hours: 5, minutes: 30, label: 'half past 5' },
  },
  {
    id: 'count-fives',
    title: 'Count by 5s',
    body: 'Each big number is also a minute mark: 1→05, 2→10, 3→15… Count by fives around the clock with the long hand.',
    tip: 'What time is the long hand showing with the short hand near 8?',
    hours: 8,
    minutes: 20,
    showMinuteHand: true,
    showMinuteLabels: true,
    emphasizeMinute: true,
    tryRead: {
      answer: '8:20',
      choices: ['8:20', '4:40', '8:00', '2:40'],
    },
  },
  {
    id: 'ready',
    title: 'You’re ready!',
    body: 'You’ll read clocks and set the hands. Pets pop out with stars when you get it right. Start easy with o’clock — then level up.',
    tip: 'Short = hours. Long = minutes. You’ve got this!',
    hours: 10,
    minutes: 15,
    showMinuteHand: true,
    showMinuteLabels: true,
  },
]

type Props = {
  onFinished: () => void
  onSkip: () => void
}

function shuffleChoices(choices: string[]) {
  const next = [...choices]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j]!, next[i]!]
  }
  return next
}

export function ClockTutorial({ onFinished, onSkip }: Props) {
  const [stepIndex, setStepIndex] = useState(0)
  const [hours, setHours] = useState(STEPS[0]!.hours)
  const [minutes, setMinutes] = useState(STEPS[0]!.minutes)
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [hint, setHint] = useState<string | null>(null)

  const step = STEPS[stepIndex]!
  const progressPct = ((stepIndex + 1) / STEPS.length) * 100

  const readChoices = useMemo(() => {
    if (!step.tryRead) return []
    return shuffleChoices(step.tryRead.choices)
    // Re-shuffle when the step changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id])

  const goToStep = (index: number) => {
    const next = STEPS[index]!
    setStepIndex(index)
    setHours(next.hours)
    setMinutes(next.minutes)
    setFeedback('idle')
    setHint(null)
  }

  const needsPractice = Boolean(step.trySet || step.tryRead)
  const practiceDone = feedback === 'correct' || !needsPractice

  const checkSet = () => {
    if (!step.trySet) return
    const ok = isSetCorrect(
      step.trySet.hours,
      step.trySet.minutes,
      hours,
      minutes,
      2,
    )
    if (ok) {
      void musicEngine.playSfx('ding')
      setFeedback('correct')
      setHint(null)
    } else {
      void musicEngine.playSfx('wrong')
      setFeedback('wrong')
      setHint(
        `Aim for ${step.trySet.label}. Short hand near ${step.trySet.hours}, long hand for ${String(step.trySet.minutes).padStart(2, '0')} minutes.`,
      )
    }
  }

  const checkRead = (choice: string) => {
    if (!step.tryRead) return
    if (choice === step.tryRead.answer) {
      void musicEngine.playSfx('ding')
      setFeedback('correct')
      setHint(null)
    } else {
      void musicEngine.playSfx('wrong')
      setFeedback('wrong')
      setHint(`Not quite — look again at both hands. Hint: ${step.tip ?? ''}`)
    }
  }

  const next = () => {
    if (stepIndex >= STEPS.length - 1) {
      onFinished()
      return
    }
    if (needsPractice && feedback !== 'correct') return
    goToStep(stepIndex + 1)
  }

  const back = () => {
    if (stepIndex === 0) return
    goToStep(stepIndex - 1)
  }

  return (
    <section className="clock-tutorial" aria-label="Tell time tutorial">
      <div className="clock-tutorial-progress" aria-hidden="true">
        <div
          className="clock-tutorial-progress-fill"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <p className="clock-tutorial-stepcount">
        Lesson {stepIndex + 1} of {STEPS.length}
      </p>

      <h2 className="clock-tutorial-title">{step.title}</h2>
      <p className="clock-tutorial-body">{step.body}</p>
      {step.tip ? <p className="clock-tutorial-tip">{step.tip}</p> : null}

      <div
        className={`clock-tutorial-face ${feedback === 'correct' ? 'is-correct' : ''} ${feedback === 'wrong' ? 'is-wrong' : ''}`}
      >
        <AnalogClock
          hours={hours}
          minutes={minutes}
          showMinuteHand={step.showMinuteHand}
          showMinuteLabels={step.showMinuteLabels}
          showMinuteTicks={step.id === 'count-fives'}
          emphasizeHour={step.emphasizeHour}
          emphasizeMinute={step.emphasizeMinute}
          interactive={Boolean(step.interactive) && feedback !== 'correct'}
          dragMode={step.dragMode ?? 'both'}
          onChange={(h, m) => {
            setHours(h)
            setMinutes(m)
            if (feedback === 'wrong') {
              setFeedback('idle')
              setHint(null)
            }
          }}
          level={2}
        />
      </div>

      {step.interactive && step.trySet ? (
        <div className="clock-tutorial-practice">
          <p className="clock-tutorial-readout" aria-live="polite">
            Your time: <strong>{formatDigital(hours, minutes)}</strong>
            {' · '}Goal: <strong>{step.trySet.label}</strong>
          </p>
          <button
            type="button"
            className="clock-tutorial-check"
            disabled={feedback === 'correct'}
            onClick={checkSet}
          >
            Check my clock
          </button>
        </div>
      ) : null}

      {step.tryRead ? (
        <div className="clock-tutorial-choices" role="group" aria-label="Answers">
          {readChoices.map((choice) => (
            <button
              key={choice}
              type="button"
              className="clock-tutorial-choice"
              disabled={feedback === 'correct'}
              onClick={() => checkRead(choice)}
            >
              {choice}
            </button>
          ))}
        </div>
      ) : null}

      {feedback === 'correct' ? (
        <p className="clock-tutorial-banner" role="status">
          Nice! You’ve got it.
        </p>
      ) : null}
      {hint ? (
        <p className="clock-tutorial-hint" role="status">
          {hint}
        </p>
      ) : null}

      <div className="clock-tutorial-nav">
        <button
          type="button"
          className="clock-tutorial-secondary"
          onClick={back}
          disabled={stepIndex === 0}
        >
          Back
        </button>
        <button type="button" className="clock-tutorial-skip" onClick={onSkip}>
          Skip tutorial
        </button>
        {step.id === 'ready' ? (
          <button type="button" className="clock-tutorial-primary" onClick={onFinished}>
            Start telling time
          </button>
        ) : (
          <button
            type="button"
            className="clock-tutorial-primary"
            onClick={next}
            disabled={!practiceDone}
          >
            {needsPractice && feedback !== 'correct' ? 'Try it first' : 'Next'}
          </button>
        )}
      </div>
    </section>
  )
}
