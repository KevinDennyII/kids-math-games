import { useCallback, useEffect, useRef, useState } from 'react'
import { MusicToggle } from '../../../shared/audio/MusicToggle'
import type { SfxKind } from '../../../shared/audio/musicEngine'
import { BurstParticles } from '../../../shared/motion/BurstParticles'
import { useProgressStore } from '../../../shared/store/progressStore'
import { AstroFox } from '../AstroFox'
import { FoundationCoach } from './FoundationCoach'
import {
  FOUNDATION_LESSONS,
  advanceFoundationProgress,
  isLessonUnlocked,
  pickPrompt,
  type FoundationLesson,
} from './lessonBank'
import './foundation.css'

type View = 'menu' | 'intro' | 'place' | 'drill' | 'lessonDone' | 'allDone'

type Props = {
  muted: boolean
  onToggleMute: () => void
  onBack: () => void
  onPlayRockets: () => void
  onReset: () => void
  playSfx: (kind: SfxKind) => void
}

export function TypingFoundation({
  muted,
  onToggleMute,
  onBack,
  onPlayRockets,
  onReset,
  playSfx,
}: Props) {
  const saved = useProgressStore((s) => s.typingFoundation)
  const setTypingFoundation = useProgressStore((s) => s.setTypingFoundation)

  const [view, setView] = useState<View>('menu')
  const [lessonIndex, setLessonIndex] = useState(saved.lessonIndex)
  const [hits, setHits] = useState(0)
  const [prompt, setPrompt] = useState('')
  const [typedCount, setTypedCount] = useState(0)
  const [banner, setBanner] = useState<string | null>(null)
  const [burstKey, setBurstKey] = useState(0)
  const [celebrating, setCelebrating] = useState(false)
  const [shakeWrong, setShakeWrong] = useState(false)

  const hitsRef = useRef(hits)
  const promptRef = useRef(prompt)
  const typedRef = useRef(typedCount)
  const viewRef = useRef(view)
  const lessonRef = useRef(lessonIndex)

  useEffect(() => {
    hitsRef.current = hits
  }, [hits])
  useEffect(() => {
    promptRef.current = prompt
  }, [prompt])
  useEffect(() => {
    typedRef.current = typedCount
  }, [typedCount])
  useEffect(() => {
    viewRef.current = view
  }, [view])
  useEffect(() => {
    lessonRef.current = lessonIndex
  }, [lessonIndex])

  const lesson: FoundationLesson | undefined = FOUNDATION_LESSONS[lessonIndex]

  const beginDrill = useCallback((index: number) => {
    const nextLesson = FOUNDATION_LESSONS[index]
    if (!nextLesson) return
    setLessonIndex(index)
    setHits(0)
    setTypedCount(0)
    setPrompt(pickPrompt(nextLesson))
    setBanner(null)
    setView('intro')
  }, [])

  const startDrill = useCallback(() => {
    setView('place')
    setBanner('Park your fingers on the glowing home keys first!')
  }, [])

  const confirmHandsReady = useCallback(() => {
    setView('drill')
    setBanner('Type the glowing key — then return home!')
  }, [])

  const finishLesson = useCallback(() => {
    const index = lessonRef.current
    const prev = useProgressStore.getState().typingFoundation
    const next = advanceFoundationProgress(prev, index)
    setTypingFoundation(next)
    setCelebrating(true)
    window.setTimeout(() => setCelebrating(false), 700)

    if (index >= FOUNDATION_LESSONS.length - 1) {
      setView('allDone')
      setBanner('You built a strong typing foundation!')
    } else {
      setView('lessonDone')
      setBanner('Lesson complete — nice work!')
    }
  }, [setTypingFoundation])

  const nextPrompt = useCallback((currentLesson: FoundationLesson, avoid: string) => {
    const next = pickPrompt(currentLesson, avoid)
    setPrompt(next)
    setTypedCount(0)
  }, [])

  const pressChar = useCallback(
    (raw: string) => {
      if (viewRef.current !== 'drill') return
      const currentLesson = FOUNDATION_LESSONS[lessonRef.current]
      if (!currentLesson) return

      const key = raw.toLowerCase()
      if (!/^[a-z]$/.test(key)) return

      const target = promptRef.current
      if (!target) return

      if (currentLesson.kind === 'key') {
        if (key !== target) {
          playSfx('wrong')
          setShakeWrong(true)
          window.setTimeout(() => setShakeWrong(false), 280)
          setBanner('Try again — match the glowing key and finger color!')
          return
        }
        playSfx('correct')
        setBurstKey((k) => k + 1)
        const newHits = hitsRef.current + 1
        setHits(newHits)
        if (newHits >= currentLesson.targetHits) {
          finishLesson()
          return
        }
        setBanner(`Great! ${newHits}/${currentLesson.targetHits}`)
        nextPrompt(currentLesson, target)
        return
      }

      // word drill
      const expected = target[typedRef.current]
      if (key !== expected) {
        playSfx('wrong')
        setShakeWrong(true)
        window.setTimeout(() => setShakeWrong(false), 280)
        setBanner('Oops — keep going, one letter at a time!')
        return
      }

      const typed = typedRef.current + 1
      setTypedCount(typed)

      if (typed >= target.length) {
        playSfx('correct')
        setBurstKey((k) => k + 1)
        const newHits = hitsRef.current + 1
        setHits(newHits)
        if (newHits >= currentLesson.targetHits) {
          finishLesson()
          return
        }
        setBanner(`Word cleared! ${newHits}/${currentLesson.targetHits}`)
        nextPrompt(currentLesson, target)
      }
    },
    [finishLesson, nextPrompt, playSfx],
  )

  useEffect(() => {
    if (view !== 'drill') return

    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const key = event.key.length === 1 ? event.key.toLowerCase() : ''
      if (!/^[a-z]$/.test(key)) return
      event.preventDefault()
      pressChar(key)
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [view, pressChar])

  const highlightKeys = (() => {
    if (view !== 'drill' || !lesson || !prompt) return [] as string[]
    if (lesson.kind === 'key') return [prompt]
    const next = prompt[typedCount]
    return next ? [next] : []
  })()

  const allComplete = saved.completedLessons >= FOUNDATION_LESSONS.length

  return (
    <>
      <header className="typing-top foundation-top">
        <button type="button" className="typing-back foundation-back" onClick={onBack}>
          ← Menu
        </button>
        <div className="typing-brand">
          <h1 className="typing-title">Finger Practice</h1>
          {view === 'drill' && lesson ? (
            <div className="typing-hud" aria-label="Lesson progress">
              <div className="typing-stat">
                <span>Lesson</span>
                <strong>
                  {lessonIndex + 1}/{FOUNDATION_LESSONS.length}
                </strong>
              </div>
              <div className="typing-stat">
                <span>{lesson.title}</span>
                <strong>
                  {hits}/{lesson.targetHits}
                </strong>
              </div>
            </div>
          ) : view === 'place' ? (
            <p className="foundation-tagline">Step 1 · Home row placement</p>
          ) : (
            <p className="foundation-tagline">Hand placement · calm drills</p>
          )}
          {view === 'drill' && lesson ? (
            <div
              className="typing-orbit-progress foundation-progress"
              aria-label={`${hits} of ${lesson.targetHits} done`}
            >
              <div className="typing-orbit-track">
                <div
                  className="typing-orbit-fill"
                  style={{
                    width: `${(hits / lesson.targetHits) * 100}%`,
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>
        <div className="typing-actions">
          <MusicToggle muted={muted} onToggle={onToggleMute} />
          <button type="button" className="typing-reset" onClick={onReset}>
            Reset
          </button>
        </div>
      </header>

      <section
        className={`typing-arena foundation-arena ${shakeWrong ? 'is-wrong' : ''} ${view === 'drill' || view === 'place' ? 'is-drill' : ''}`}
        aria-label="Finger practice"
      >
        <BurstParticles trigger={burstKey} palette="race" />

        <div className="typing-buddy" aria-hidden="true">
          <AstroFox
            size="sm"
            motion={view === 'drill' || view === 'place' ? 'hop' : 'sway'}
            celebrate={celebrating || view === 'allDone' || view === 'lessonDone'}
          />
        </div>

        {view === 'menu' ? (
          <div className="foundation-menu">
            <h2>Build your typing foundation</h2>
            <p>
              Learn where each finger rests, then practice one key at a time.
              Rockets stay ready whenever you want to play.
            </p>
            <ul className="foundation-lesson-list">
              {FOUNDATION_LESSONS.map((item, index) => {
                const unlocked = isLessonUnlocked(index, saved.completedLessons)
                const done = index < saved.completedLessons
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={[
                        'foundation-lesson-btn',
                        done ? 'is-done' : '',
                        index === saved.lessonIndex && !allComplete
                          ? 'is-next'
                          : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      disabled={!unlocked}
                      onClick={() => beginDrill(index)}
                    >
                      <span className="foundation-lesson-num">{index + 1}</span>
                      <span className="foundation-lesson-copy">
                        <strong>{item.title}</strong>
                        <span>{item.subtitle}</span>
                      </span>
                      {done ? (
                        <span className="foundation-lesson-badge" aria-label="Done">
                          ✓
                        </span>
                      ) : null}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}

        {view === 'intro' && lesson ? (
          <div className="foundation-panel">
            <h2>{lesson.title}</h2>
            <p>{lesson.intro}</p>
            <button type="button" className="typing-start-btn" onClick={startDrill}>
              Place my hands
            </button>
            <button
              type="button"
              className="foundation-secondary-btn"
              onClick={() => setView('menu')}
            >
              Lesson list
            </button>
          </div>
        ) : null}

        {view === 'place' && lesson ? (
          <>
            <FoundationCoach
              highlightKeys={[]}
              prompt=""
              promptKind={lesson.kind}
              typedCount={0}
              onKeyPress={() => {}}
              placementMode
            />
            <div className="foundation-place-actions">
              <button
                type="button"
                className="typing-start-btn"
                onClick={confirmHandsReady}
              >
                Hands are ready — start drill
              </button>
            </div>
          </>
        ) : null}

        {view === 'drill' && lesson ? (
          <FoundationCoach
            highlightKeys={highlightKeys}
            prompt={prompt}
            promptKind={lesson.kind}
            typedCount={typedCount}
            onKeyPress={pressChar}
          />
        ) : null}

        {view === 'lessonDone' && lesson ? (
          <div className="foundation-panel" role="status">
            <h2>{lesson.title} complete!</h2>
            <p>Ready for the next lesson, or head back to rockets anytime.</p>
            <button
              type="button"
              className="typing-start-btn"
              onClick={() => beginDrill(lessonIndex + 1)}
            >
              Next: {FOUNDATION_LESSONS[lessonIndex + 1]?.title}
            </button>
            <button
              type="button"
              className="foundation-secondary-btn"
              onClick={() => setView('menu')}
            >
              Lesson list
            </button>
          </div>
        ) : null}

        {view === 'allDone' ? (
          <div className="foundation-panel foundation-ready" role="status">
            <h2>Ready for rockets!</h2>
            <p>
              You know home base and which finger hits each key. Launch Fox
              Rockets when you are ready.
            </p>
            <AstroFox size="md" motion="hop" celebrate />
            <button type="button" className="typing-start-btn" onClick={onPlayRockets}>
              Start Fox Rockets
            </button>
            <button
              type="button"
              className="foundation-secondary-btn"
              onClick={() => setView('menu')}
            >
              Practice again
            </button>
          </div>
        ) : null}

        {banner && (view === 'drill' || view === 'place') ? (
          <p className="typing-banner">{banner}</p>
        ) : null}
      </section>
    </>
  )
}
