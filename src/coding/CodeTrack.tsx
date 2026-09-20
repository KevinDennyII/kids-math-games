import { useEffect, useRef, useState } from 'react'
import { useGameMusic } from '../shared/audio/useGameMusic'
import { BurstParticles } from '../shared/motion/BurstParticles'
import { ArenaGrid } from './ArenaGrid'
import { CodingHeader } from './CodingHeader'
import {
  PYTHON_MISSIONS,
  isMissionUnlocked,
  type Mission,
} from './curriculum'
import { MissionFlow } from './MissionFlow'
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
  const [missionId, setMissionId] = useState<string | null>(null)
  const [passed, setPassed] = useState(false)
  const [engine, setEngine] = useState<PythonStatus>(getPythonStatus)
  const [burstKey, setBurstKey] = useState(0)

  const mission = PYTHON_MISSIONS.find((m) => m.id === missionId) ?? null

  useEffect(() => {
    document.title = 'Python Lab'
    const unsub = subscribePythonStatus(setEngine)
    void ensurePython().catch(() => {})
    return unsub
  }, [])

  return (
    <main className="coding-shell">
      <CodingHeader
        title="Python Lab"
        muted={muted}
        onToggleMute={() => setMuted(!muted)}
        onReset={reset}
      />
      <p className="coding-engine" data-status={engine}>
        {engine === 'ready'
          ? 'Python brain is ready in this browser.'
          : engine === 'loading'
            ? 'Waking the Python brain — first load can take a few seconds.'
            : engine === 'error'
              ? 'Could not load Python. Check the network, then refresh.'
              : 'Python engine is cold until this page opens.'}
      </p>
      <BurstParticles trigger={burstKey} palette="race" />

      {!mission ? (
        <section className="coding-mission-list">
          <p className="coding-tagline">
            Type real Python and run it here. print, variables, if, loops — then
            drive a little bot with code.
          </p>
          {PYTHON_MISSIONS.map((item) => {
            const unlocked = isMissionUnlocked(item.id, completed)
            const done = completed.includes(item.id)
            return (
              <button
                key={item.id}
                type="button"
                className={`coding-mission ${done ? 'is-done' : ''}`}
                disabled={!unlocked}
                onClick={() => {
                  setMissionId(item.id)
                  setPassed(false)
                }}
              >
                <span className="cta-kicker">
                  {item.subtitle}
                  {done ? ' · done' : unlocked ? '' : ' · locked'}
                </span>
                <span className="cta-title">{item.title}</span>
              </button>
            )
          })}
        </section>
      ) : !passed ? (
        <>
          <button type="button" className="coding-text-btn" onClick={() => setMissionId(null)}>
            ← Missions
          </button>
          <MissionFlow mission={mission} onPassed={() => setPassed(true)} />
        </>
      ) : (
        <>
          <button type="button" className="coding-text-btn" onClick={() => setMissionId(null)}>
            ← Missions
          </button>
          <PythonEditor
            mission={mission}
            engine={engine}
            onSolved={() => {
              completeMission(mission.id)
              playSfx('correct')
              setBurstKey((k) => k + 1)
            }}
            onWrong={() => playSfx('wrong')}
          />
          <p className="coding-parent">Ask him: {mission.askAfter}</p>
        </>
      )}
    </main>
  )
}

function PythonEditor({
  mission,
  engine,
  onSolved,
  onWrong,
}: {
  mission: Mission
  engine: PythonStatus
  onSolved: () => void
  onWrong: () => void
}) {
  const challenge = PYTHON_CHALLENGES[mission.id]
  const [code, setCode] = useState(challenge?.starter ?? 'print("hello")\n')
  const [stdout, setStdout] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [bot, setBot] = useState<BotState>(() => createBot(BOT_ARMOR))
  const [hintOn, setHintOn] = useState(false)
  const [solved, setSolved] = useState(false)
  const animRef = useRef(0)
  const { grid } = parseArena()

  useEffect(() => {
    setCode(challenge?.starter ?? 'print("hello")\n')
    setStdout('')
    setError(null)
    setSolved(false)
    setHintOn(false)
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

  const run = async () => {
    if (busy || engine !== 'ready') return
    setBusy(true)
    setError(null)
    const result = await runPython(code)
    setStdout(result.stdout)
    setBusy(false)
    if (result.error) {
      setError(result.error)
      onWrong()
      return
    }
    animate(result.commands)
    const sim = runCommands(result.commands, BOT_ARMOR)
    if (!challenge || mission.id === 'sandbox') {
      if (!solved) onSolved()
      setSolved(true)
      return
    }
    const grade = gradePython(challenge, result.stdout, sim.state.goal)
    if (grade.ok) {
      if (!solved) onSolved()
      setSolved(true)
      setError(null)
    } else {
      setError(grade.message)
      onWrong()
    }
  }

  return (
    <section className="coding-panel coding-editor-wrap">
      <p className="coding-kicker">{mission.title}</p>
      <h2>Type, then Run</h2>
      <textarea
        className="coding-editor"
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        aria-label="Python code"
      />
      <div className="coding-row">
        <button type="button" className="coding-btn coding-btn-play" onClick={() => void run()} disabled={busy || engine !== 'ready'}>
          {busy ? 'Running…' : 'Run'}
        </button>
        <button type="button" className="coding-text-btn" onClick={() => setHintOn((v) => !v)}>
          {hintOn ? 'Hide hint' : 'Hint'}
        </button>
      </div>
      {hintOn && challenge ? <p className="coding-sub">{challenge.hint}</p> : null}
      {mission.id === 'drive' || resultHasDrive(code) ? (
        <ArenaGrid bot={bot} armor={BOT_ARMOR} grid={grid} />
      ) : null}
      <pre className="coding-out" aria-live="polite">
        {error ? `Error: ${error}\n` : ''}
        {stdout || (busy ? '…' : 'Output shows here.')}
      </pre>
      {solved ? <p className="coding-ok">Mission complete. Read the output out loud to a parent.</p> : null}
    </section>
  )
}

function resultHasDrive(code: string): boolean {
  return /\b(forward|left|right|back)\s*\(/.test(code)
}
