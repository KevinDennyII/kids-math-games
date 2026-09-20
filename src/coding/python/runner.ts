import type { BotCommand } from '../robotSim'

export type PythonRunResult = {
  stdout: string
  commands: BotCommand[]
  error?: string
}

type Pyodide = {
  runPythonAsync: (code: string) => Promise<unknown>
  setStdout: (opts: { batched?: (text: string) => void }) => void
  setStderr: (opts: { batched?: (text: string) => void }) => void
  registerJsModule: (name: string, mod: object) => void
}

declare global {
  interface Window {
    loadPyodide?: (config?: { indexURL?: string }) => Promise<Pyodide>
  }
}

const PYODIDE_INDEX = 'https://cdn.jsdelivr.net/pyodide/v0.27.5/full/'
const RUN_MS = 8000

let pyodidePromise: Promise<Pyodide> | null = null
const botBuffer: { commands: BotCommand[] } = { commands: [] }
let moduleReady = false

export type PythonStatus = 'cold' | 'loading' | 'ready' | 'error'

let status: PythonStatus = 'cold'
const listeners = new Set<(s: PythonStatus) => void>()

function setStatus(next: PythonStatus) {
  status = next
  listeners.forEach((fn) => fn(next))
}

export function getPythonStatus(): PythonStatus {
  return status
}

export function subscribePythonStatus(fn: (s: PythonStatus) => void): () => void {
  listeners.add(fn)
  fn(status)
  return () => {
    listeners.delete(fn)
  }
}

function loadScript(): Promise<void> {
  if (window.loadPyodide) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-pyodide]')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Python engine failed to load')))
      return
    }
    const script = document.createElement('script')
    script.src = `${PYODIDE_INDEX}pyodide.js`
    script.async = true
    script.dataset.pyodide = '1'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Python engine failed to load'))
    document.head.appendChild(script)
  })
}

export function ensurePython(): Promise<Pyodide> {
  if (!pyodidePromise) {
    setStatus('loading')
    pyodidePromise = (async () => {
      await loadScript()
      const load = window.loadPyodide
      if (!load) throw new Error('Python engine missing')
      const py = await load({ indexURL: PYODIDE_INDEX })
      if (!moduleReady) {
        py.registerJsModule('botlab', {
          forward: (n?: unknown) => {
            botBuffer.commands.push({ type: 'forward', n: toCommandN(n) })
          },
          left: () => {
            botBuffer.commands.push({ type: 'left' })
          },
          right: () => {
            botBuffer.commands.push({ type: 'right' })
          },
          back: () => {
            botBuffer.commands.push({ type: 'back' })
          },
        })
        moduleReady = true
      }
      setStatus('ready')
      return py
    })().catch((err) => {
      pyodidePromise = null
      setStatus('error')
      throw err
    })
  }
  return pyodidePromise
}

function toCommandN(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n) || n < 1) return 1
  return Math.min(8, Math.floor(n))
}

export async function runPython(code: string): Promise<PythonRunResult> {
  botBuffer.commands = []
  let stdout = ''
  let stderr = ''

  try {
    const py = await ensurePython()
    py.setStdout({
      batched: (text) => {
        stdout += text.endsWith('\n') ? text : `${text}\n`
      },
    })
    py.setStderr({
      batched: (text) => {
        stderr += text
      },
    })

    const prelude = `
from botlab import forward, left, right, back
`
    const run = py.runPythonAsync(`${prelude}\n${code}`)
    let timer = 0
    const timeout = new Promise<never>((_, reject) => {
      timer = window.setTimeout(
        () => reject(new Error('That took too long. Check for a loop that never ends.')),
        RUN_MS,
      )
    })
    try {
      await Promise.race([run, timeout])
    } finally {
      window.clearTimeout(timer)
    }
    return {
      stdout: stdout.trimEnd(),
      commands: [...botBuffer.commands],
      error: stderr.trim() ? stderr.trim() : undefined,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Python hit a problem.'
    return { stdout: stdout.trimEnd(), commands: [...botBuffer.commands], error: message }
  }
}
