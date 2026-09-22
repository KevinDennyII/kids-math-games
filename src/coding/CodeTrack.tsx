import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useGameMusic } from '../shared/audio/useGameMusic'
import { BurstParticles } from '../shared/motion/BurstParticles'
import { ArenaGrid } from './ArenaGrid'
import { CodingHeader } from './CodingHeader'
import {
  PYTHON_MISSIONS,
  firstOpenMissionIndex,
  isMissionUnlocked,
  type Mission,
} from './curriculum'
import { LevelBadge } from './LevelBadge'
import { MemorySquares } from './MemorySquares'
import { gradePython, PYTHON_CHALLENGES } from './python/challenges'
import {
  ensurePython,
  getPythonStatus,
  runPython,
  subscribePythonStatus,
  type PythonStatus,
} from './python/runner'
import {
  createBot,
  expandCommands,
  parseArena,
  runCommands,
  stepBot,
  type BotCommand,
  type BotState,
} from './robotSim'
import { useCodingStore } from './store'
import './coding.css'

const BOT_ARMOR = 'walls' as const

export function PythonLab() {
  const completed = useCodingStore((s) => s.completed)
  const completeMission = useCodingStore((s) => s.completeMission)
  const reset = useCodingStore((s) => s.reset)
  const { muted, setMuted, playSfx } = useGameMusic('coding')
  const [missionId, setMissionId] = useState(
    () => PYTHON_MISSIONS[firstOpenMissionIndex(completed)]?.id ?? 'hello',
  )
  const [engine, setEngine] = useState<PythonStatus>(getPythonStatus)
  const [burstKey, setBurstKey] = useState(0)

  const mission = PYTHON_MISSIONS.find((m) => m.id === missionId) ?? PYTHON_MISSIONS[0]!

  useEffect(() => {
    document.title = 'Python Lab'
    const unsub = subscribePythonStatus(setEngine)
    void ensurePython().catch(() => {})
    return unsub
  }, [])

  useEffect(() => {
    if (isMissionUnlocked(missionId, completed)) return
    const next = PYTHON_MISSIONS[firstOpenMissionIndex(completed)]
    if (next) setMissionId(next.id)
  }, [completed, missionId])

  const goNext = () => {
    const index = PYTHON_MISSIONS.findIndex((m) => m.id === mission.id)
    const next = PYTHON_MISSIONS[index + 1]
    if (next && isMissionUnlocked(next.id, completed)) setMissionId(next.id)
  }

  return (
    <main className="coding-shell">
      <CodingHeader
        title="Python Lab"
        status={
          engine === 'ready'
            ? 'Python is ready in this browser.'
            : engine === 'loading'
              ? 'Loading Python — first time can take a few seconds.'
              : engine === 'error'
                ? 'Could not load Python. Check the network, then refresh.'
                : 'Python is waking up…'
        }
        statusKind={engine}
        muted={muted}
        onToggleMute={() => setMuted(!muted)}
        onReset={reset}
        cheer={burstKey}
      />
      <BurstParticles trigger={burstKey} palette="race" />

      <div className="coding-workspace">
        <LessonPane
          mission={mission}
          completed={completed}
          onPick={setMissionId}
        />
        <PythonEditor
          key={mission.id}
          mission={mission}
          engine={engine}
          onSolved={() => {
            completeMission(mission.id)
            playSfx('correct')
            setBurstKey((k) => k + 1)
          }}
          onWrong={() => playSfx('wrong')}
          onNext={goNext}
          hasNext={Boolean(
            PYTHON_MISSIONS[PYTHON_MISSIONS.findIndex((m) => m.id === mission.id) + 1],
          )}
        />
      </div>
    </main>
  )
}

function LessonPane({
  mission,
  completed,
  onPick,
}: {
  mission: Mission
  completed: readonly string[]
  onPick: (id: string) => void
}) {
  return (
    <aside className="coding-lesson" aria-label="Lesson">
      <ol className="coding-toc">
        {PYTHON_MISSIONS.map((item) => {
          const unlocked = isMissionUnlocked(item.id, completed)
          const done = completed.includes(item.id)
          const current = item.id === mission.id
          const badgeState = done ? 'earned' : current ? 'current' : 'locked'
          return (
            <li key={item.id}>
              <button
                type="button"
                className={`coding-toc-item${current ? ' is-now' : ''}${done ? ' is-done' : ''}${item.kind === 'project' ? ' is-project' : ''}`}
                disabled={!unlocked}
                aria-current={current ? 'step' : undefined}
                onClick={() => onPick(item.id)}
              >
                <LevelBadge
                  badge={item.badge}
                  state={badgeState}
                  size={26}
                  title={item.badgeLabel}
                />
                <span className="coding-toc-copy">
                  <span className="coding-toc-level">Level {item.level}</span>
                  <span className="coding-toc-label">{item.title}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>

      <p className="coding-kicker">
        Level {mission.level} · {mission.skill}
        {mission.kind === 'project' ? ' · project' : ''}
      </p>
      <h2 className="coding-lesson-title">{mission.title}</h2>
      {mission.steps.map((step) => (
        <p key={step} className="coding-sub">
          {step}
        </p>
      ))}
      <div className="coding-task">
        <p className="coding-kicker">Your task</p>
        <p>{mission.task}</p>
      </div>
      {completed.includes(mission.id) ? (
        <p className="coding-badge-earned">
          <LevelBadge badge={mission.badge} state="earned" size={22} title={mission.badgeLabel} />
          Earned: {mission.badgeLabel}
        </p>
      ) : null}
    </aside>
  )
}

function PythonEditor({
  mission,
  engine,
  onSolved,
  onWrong,
  onNext,
  hasNext,
}: {
  mission: Mission
  engine: PythonStatus
  onSolved: () => void
  onWrong: () => void
  onNext: () => void
  hasNext: boolean
}) {
  const challenge = PYTHON_CHALLENGES[mission.id]
  const isProject = mission.kind === 'project'
  const isPlayground = mission.kind === 'playground'
  const [code, setCode] = useState(challenge?.starter ?? 'print("hello")\n')
  const [stdout, setStdout] = useState('')
  const [pyError, setPyError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [ok, setOk] = useState(false)
  const [busy, setBusy] = useState(false)
  const [bot, setBot] = useState<BotState>(() => createBot(BOT_ARMOR))
  const [hintOn, setHintOn] = useState(false)
  const [solved, setSolved] = useState(false)
  const [codeReady, setCodeReady] = useState(false)
  const [ran, setRan] = useState(false)
  const animRef = useRef(0)
  const { grid } = parseArena()
  const showArena = mission.id === 'drive' || resultHasDrive(code)

  useEffect(() => {
    setCode(challenge?.starter ?? 'print("hello")\n')
    setStdout('')
    setPyError(null)
    setFeedback(null)
    setOk(false)
    setSolved(false)
    setCodeReady(false)
    setHintOn(false)
    setRan(false)
    setBot(createBot(BOT_ARMOR))
    return () => window.clearTimeout(animRef.current)
  }, [mission.id, challenge?.starter])

  const animate = (commands: BotCommand[]) => {
    window.clearTimeout(animRef.current)
    const steps = expandCommands(commands)
    let state = createBot(BOT_ARMOR)
    setBot(state)
    let i = 0
    const tick = () => {
      const command = steps[i]
      if (!command) return
      const result = stepBot(state, grid, command, BOT_ARMOR)
      state = result.state
      setBot(state)
      i += 1
      if (i < steps.length && state.hp > 0 && !state.goal) {
        animRef.current = window.setTimeout(tick, 280)
      }
    }
    if (steps.length) tick()
  }

  const markSolved = (message: string) => {
    if (!solved) onSolved()
    setSolved(true)
    setOk(true)
    setFeedback(message)
  }

  const run = async () => {
    if (busy || engine !== 'ready') return
    setBusy(true)
    setPyError(null)
    setFeedback(null)
    setOk(false)
    const result = await runPython(code)
    setRan(true)
    setStdout(result.stdout)
    setBusy(false)

    if (result.error) {
      setPyError(result.error)
      onWrong()
      return
    }

    animate(result.commands)
    const sim = runCommands(result.commands, BOT_ARMOR)

    if (isPlayground || !challenge) {
      markSolved('Nice. Read the Output panel — that is your program talking.')
      return
    }

    const grade = gradePython(challenge, result.stdout, sim.state.goal)
    if (!grade.ok) {
      setCodeReady(false)
      setFeedback(grade.message)
      onWrong()
      return
    }

    if (isProject) {
      setCodeReady(true)
      setOk(true)
      setFeedback('List looks good — now play Memory Squares and match both pairs.')
      return
    }

    markSolved(grade.message)
  }

  const onEditorKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault()
      void run()
      return
    }
    if (event.key !== 'Tab') return
    event.preventDefault()
    const el = event.currentTarget
    const start = el.selectionStart
    const end = el.selectionEnd
    const next = `${code.slice(0, start)}    ${code.slice(end)}`
    setCode(next)
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = start + 4
    })
  }

  const consoleText = pyError
    ? [stdout, stdout ? '' : null, pyError].filter((part) => part != null).join('\n')
    : stdout
  const consoleEmpty = !consoleText && !busy && !ran

  return (
    <section className="coding-lab" aria-label="Code editor">
      <div className="coding-editor-chrome">
        <span className="coding-kicker">script.py</span>
        <span className="coding-editor-hint">Tab indents · ⌘/Ctrl+Enter runs</span>
      </div>
      <textarea
        className={`coding-editor${isProject ? ' is-compact' : ''}`}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={onEditorKeyDown}
        aria-label="Python code"
      />
      <div className="coding-row">
        <button
          type="button"
          className="coding-btn coding-btn-play"
          onClick={() => void run()}
          disabled={busy || engine !== 'ready'}
        >
          {busy ? 'Running…' : engine === 'ready' ? 'Run' : 'Wait for Python…'}
        </button>
        <button type="button" className="coding-text-btn" onClick={() => setHintOn((v) => !v)}>
          {hintOn ? 'Hide hint' : 'Hint'}
        </button>
        {solved && hasNext ? (
          <button type="button" className="coding-btn" onClick={onNext}>
            Next lesson
          </button>
        ) : null}
      </div>
      {hintOn && challenge ? <p className="coding-sub">{challenge.hint}</p> : null}

      <div className="coding-console">
        <div className="coding-console-bar">Output</div>
        <pre
          className={`coding-out${pyError ? ' is-error' : ''}${consoleEmpty ? ' is-empty' : ''}${isProject ? ' is-compact' : ''}`}
          aria-live="polite"
        >
          {busy && !consoleText
            ? 'Running…'
            : consoleEmpty
              ? 'Click Run. Results show here.'
              : consoleText || '(no output)'}
        </pre>
      </div>

      {feedback ? (
        <p className={ok ? 'coding-ok' : 'coding-warn'} role="status">
          {feedback}
        </p>
      ) : null}

      {isProject ? (
        <MemorySquares
          enabled={codeReady}
          onWin={() => {
            markSolved('You matched both pairs — Emerald badge unlocked!')
          }}
        />
      ) : null}

      {showArena ? <ArenaGrid bot={bot} armor={BOT_ARMOR} grid={grid} /> : null}
    </section>
  )
}

function resultHasDrive(code: string): boolean {
  const uncommented = code.replace(/#.*$/gm, '')
  return /\b(forward|left|right|back)\s*\(/.test(uncommented)
}
