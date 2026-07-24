import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react'
import './scratchPad.css'

type Props = {
  /** Clears the pad when this changes (usually problem.id) */
  resetKey: string
  disabled?: boolean
}

/**
 * Finger/stylus-friendly work area for bigger multiplication & fractions.
 */
export function ScratchPad({ resetKey, disabled }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const last = useRef<{ x: number; y: number } | null>(null)

  const resizeAndPaintGrid = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const width = parent.clientWidth
    const height = Math.max(140, Math.round(width * 0.42))

    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)

    ctx.strokeStyle = 'rgb(243 156 18 / 0.28)'
    ctx.lineWidth = 1
    for (let y = 28; y < height; y += 28) {
      ctx.beginPath()
      ctx.moveTo(10, y)
      ctx.lineTo(width - 10, y)
      ctx.stroke()
    }
    ctx.strokeStyle = 'rgb(231 76 60 / 0.35)'
    ctx.beginPath()
    ctx.moveTo(36, 8)
    ctx.lineTo(36, height - 8)
    ctx.stroke()
  }

  useEffect(() => {
    resizeAndPaintGrid()
    const onResize = () => resizeAndPaintGrid()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    resizeAndPaintGrid()
    last.current = null
    drawing.current = false
  }, [resetKey])

  const pointFromEvent = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
  }

  const strokeTo = (x: number, y: number) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !last.current) {
      last.current = { x, y }
      return
    }
    ctx.strokeStyle = '#1b2430'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(last.current.x, last.current.y)
    ctx.lineTo(x, y)
    ctx.stroke()
    last.current = { x, y }
  }

  const clear = () => {
    resizeAndPaintGrid()
    last.current = null
    drawing.current = false
  }

  return (
    <div className={`scratch-pad ${disabled ? 'is-disabled' : ''}`}>
      <div className="scratch-pad-top">
        <span className="scratch-pad-label">Scratch pad</span>
        <button
          type="button"
          className="scratch-pad-clear"
          onClick={clear}
          disabled={disabled}
        >
          Clear
        </button>
      </div>
      <canvas
        ref={canvasRef}
        className="scratch-pad-canvas"
        aria-label="Scratch pad for working out the problem"
        onPointerDown={(event) => {
          if (disabled) return
          event.currentTarget.setPointerCapture(event.pointerId)
          drawing.current = true
          const point = pointFromEvent(event)
          if (!point) return
          last.current = point
          strokeTo(point.x, point.y)
        }}
        onPointerMove={(event) => {
          if (disabled || !drawing.current) return
          const point = pointFromEvent(event)
          if (!point) return
          strokeTo(point.x, point.y)
        }}
        onPointerUp={() => {
          drawing.current = false
          last.current = null
        }}
        onPointerCancel={() => {
          drawing.current = false
          last.current = null
        }}
      />
    </div>
  )
}
