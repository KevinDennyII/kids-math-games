import type { BotCommand } from '../robotSim'

export type PythonRunResult = {
  stdout: string
  commands: BotCommand[]
  error?: string
}

type Pyodide = {
  runPython: (code: string) => unknown
  runPythonAsync: (code: string) => Promise<unknown>
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

function readBuffer(py: Pyodide): string {
  try {
    const value = py.runPython('_kmg_buf.getvalue() if "_kmg_buf" in dir() else ""')
    return typeof value === 'string' ? value : String(value ?? '')
  } catch {
    return ''
  }
}

function restoreStdio(py: Pyodide) {
  try {
    py.runPython(`
import sys
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
`)
  } catch {
    // ignore restore failures after a crash
  }
}

function displayValue(raw: unknown): string | null {
  if (typeof raw === 'boolean' || typeof raw === 'number' || typeof raw === 'bigint') {
    return String(raw)
  }
  if (typeof raw === 'string' && raw.length > 0) return raw
  return null
}

export async function runPython(code: string): Promise<PythonRunResult> {
  botBuffer.commands = []

  try {
    const py = await ensurePython()
    py.runPython(`
import sys, io
from botlab import forward, left, right, back
_kmg_buf = io.StringIO()
sys.stdout = _kmg_buf
sys.stderr = _kmg_buf
`)

    let timer = 0
    const timeout = new Promise<never>((_, reject) => {
      timer = window.setTimeout(
        () => reject(new Error('That took too long. Check for a loop that never ends.')),
        RUN_MS,
      )
    })

    try {
      const run = py.runPythonAsync(code)
      const raw = await Promise.race([run, timeout])
      const printed = readBuffer(py)
      const extra = printed.trim() ? null : displayValue(raw)
      return {
        stdout: extra ? `${printed}${printed.endsWith('\n') || printed === '' ? '' : '\n'}${extra}` : printed.replace(/\n$/, ''),
        commands: [...botBuffer.commands],
      }
    } catch (err) {
      const printed = readBuffer(py)
      const message = err instanceof Error ? err.message : 'Python hit a problem.'
      return {
        stdout: printed.replace(/\n$/, ''),
        commands: [...botBuffer.commands],
        error: message,
      }
    } finally {
      window.clearTimeout(timer)
      restoreStdio(py)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Python hit a problem.'
    return { stdout: '', commands: [...botBuffer.commands], error: message }
  }
}
