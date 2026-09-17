import { useCallback, useId, useRef, type PointerEvent as ReactPointerEvent } from 'react'
import { anglesFromTime, snapMinutes } from './generateTimeProblem'
import './analogClock.css'

type Props = {
  hours: number
  minutes: number
  showMinuteHand?: boolean
  /** When true, kids drag hands to set the time. */
  interactive?: boolean
  /** Limit which hand can be dragged (tutorial scaffolding). */
  dragMode?: 'both' | 'hour' | 'minute'
  onChange?: (hours: number, minutes: number) => void
  celebrate?: boolean
  /** Soft highlight on the hour hand for early scaffolding. */
  emphasizeHour?: boolean
  /** Soft highlight on the minute hand. */
  emphasizeMinute?: boolean
  /** Show tick marks (helps count-by-5s). */
  showMinuteTicks?: boolean
  /** Show outer minute labels (00, 05, 10…). Default true. */
  showMinuteLabels?: boolean
  level?: number
  className?: string
}

function normalizeAngle(deg: number) {
  return ((deg % 360) + 360) % 360
}

function angleDelta(a: number, b: number) {
  const d = Math.abs(normalizeAngle(a) - normalizeAngle(b))
  return Math.min(d, 360 - d)
}

function pointerPolar(
  clientX: number,
  clientY: number,
  svg: SVGSVGElement,
): { angle: number; radiusRatio: number } {
  const rect = svg.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const dx = clientX - cx
  const dy = clientY - cy
  const rad = Math.atan2(dx, -dy)
  const radius = Math.hypot(dx, dy)
  const maxR = Math.min(rect.width, rect.height) / 2
  return {
    angle: normalizeAngle((rad * 180) / Math.PI),
    radiusRatio: maxR > 0 ? radius / maxR : 0,
  }
}

export function AnalogClock({
  hours,
  minutes,
  showMinuteHand = true,
  interactive = false,
  dragMode = 'both',
  onChange,
  celebrate = false,
  emphasizeHour = false,
  emphasizeMinute = false,
  showMinuteTicks = false,
  showMinuteLabels = true,
  level = 1,
  className = '',
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const dragRef = useRef<'hour' | 'minute' | null>(null)
  const uid = useId()

  const { hourAngle, minuteAngle } = anglesFromTime(hours, minutes)

  // Minute hand reaches toward minute labels; hour stays clearly shorter.
  const hourLen = 40
  const minuteLen = 70
  const hourTip = {
    x: 100 + hourLen * Math.sin((hourAngle * Math.PI) / 180),
    y: 100 - hourLen * Math.cos((hourAngle * Math.PI) / 180),
  }
  const minuteTip = {
    x: 100 + minuteLen * Math.sin((minuteAngle * Math.PI) / 180),
    y: 100 - minuteLen * Math.cos((minuteAngle * Math.PI) / 180),
  }
  const hourTail = {
    x: 100 - 7 * Math.sin((hourAngle * Math.PI) / 180),
    y: 100 + 7 * Math.cos((hourAngle * Math.PI) / 180),
  }
  const minuteTail = {
    x: 100 - 11 * Math.sin((minuteAngle * Math.PI) / 180),
    y: 100 + 11 * Math.cos((minuteAngle * Math.PI) / 180),
  }

  const applyAngle = useCallback(
    (hand: 'hour' | 'minute', angle: number) => {
      if (!onChange) return
      if (hand === 'minute') {
        const nextMinutes = snapMinutes(angle / 6, level)
        onChange(hours, nextMinutes)
        return
      }
      // Hour hand: nearest hour mark (independent of minutes).
      let h = Math.round(angle / 30) % 12
      if (h === 0) h = 12
      onChange(h, minutes)
    },
    [hours, minutes, level, onChange],
  )

  const pickHand = useCallback(
    (angle: number, radiusRatio: number): 'hour' | 'minute' => {
      if (dragMode === 'hour' || !showMinuteHand) return 'hour'
      if (dragMode === 'minute') return 'minute'
      // Inner half of the face → hour; outer ring → minutes (kid-friendly).
      if (radiusRatio < 0.48) return 'hour'
      // If click is near a hand tip by angle, prefer that hand.
      const nearHour = angleDelta(angle, hourAngle) < 18
      const nearMinute = angleDelta(angle, minuteAngle) < 18
      if (nearHour && !nearMinute) return 'hour'
      if (nearMinute && !nearHour) return 'minute'
      return 'minute'
    },
    [dragMode, showMinuteHand, hourAngle, minuteAngle],
  )

  const onPointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!interactive || !svgRef.current) return
    event.preventDefault()
    const { angle, radiusRatio } = pointerPolar(
      event.clientX,
      event.clientY,
      svgRef.current,
    )
    const hand = pickHand(angle, radiusRatio)
    dragRef.current = hand
    event.currentTarget.setPointerCapture(event.pointerId)
    applyAngle(hand, angle)
  }

  const onPointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!interactive || !dragRef.current || !svgRef.current) return
    const { angle } = pointerPolar(
      event.clientX,
      event.clientY,
      svgRef.current,
    )
    applyAngle(dragRef.current, angle)
  }

  const onPointerUp = () => {
    dragRef.current = null
  }

  const numerals = Array.from({ length: 12 }, (_, i) => {
    const n = i + 1
    const a = (n * 30 * Math.PI) / 180
    const hourR = 68
    const minuteR = 80
    return {
      n,
      minutes: n === 12 ? 0 : n * 5,
      hourX: 100 + hourR * Math.sin(a),
      hourY: 100 - hourR * Math.cos(a),
      minX: 100 + minuteR * Math.sin(a),
      minY: 100 - minuteR * Math.cos(a),
    }
  })

  return (
    <svg
      ref={svgRef}
      className={`analog-clock ${celebrate ? 'is-celebrate' : ''} ${interactive ? 'is-interactive' : ''} ${className}`}
      viewBox="0 0 200 200"
      role="img"
      aria-label={`Clock showing ${hours}:${String(minutes).padStart(2, '0')}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <defs>
        <radialGradient id={`${uid}-face`} cx="45%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#fffdf9" />
          <stop offset="55%" stopColor="#fff5fb" />
          <stop offset="100%" stopColor="#ffe8d6" />
        </radialGradient>
        <linearGradient id={`${uid}-rim`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff8a3d" />
          <stop offset="50%" stopColor="#ff6fab" />
          <stop offset="100%" stopColor="#7ec8f0" />
        </linearGradient>
      </defs>

      {/* Colorful outer rim + thin track dash — face stays bright so numerals read clearly */}
      <circle cx="100" cy="100" r="97" fill={`url(#${uid}-rim)`} />
      <circle
        cx="100"
        cy="100"
        r="93"
        fill="none"
        stroke="#4a5d73"
        strokeWidth="3.5"
      />
      <circle
        cx="100"
        cy="100"
        r="93"
        fill="none"
        stroke="#f1c40f"
        strokeWidth="1.75"
        strokeDasharray="6 8"
        opacity="0.95"
      />
      <circle cx="100" cy="100" r="90" fill={`url(#${uid}-face)`} />
      <circle
        cx="100"
        cy="100"
        r="90"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2"
      />

      {showMinuteTicks
        ? Array.from({ length: 60 }, (_, i) => {
            const a = (i * 6 * Math.PI) / 180
            const outer = 88
            const inner = i % 5 === 0 ? 85 : 86.5
            return (
              <line
                key={i}
                x1={100 + inner * Math.sin(a)}
                y1={100 - inner * Math.cos(a)}
                x2={100 + outer * Math.sin(a)}
                y2={100 - outer * Math.cos(a)}
                stroke={i % 5 === 0 ? '#4a3040' : '#d0b0c0'}
                strokeWidth={i % 5 === 0 ? 2 : 1}
                strokeLinecap="round"
              />
            )
          })
        : null}

      {numerals.map(({ n, minutes: minLabel, hourX, hourY, minX, minY }) => (
        <g key={n}>
          <text
            x={hourX}
            y={hourY}
            textAnchor="middle"
            dominantBaseline="central"
            className="analog-clock-numeral"
          >
            {n}
          </text>
          {showMinuteLabels ? (
            <text
              x={minX}
              y={minY}
              textAnchor="middle"
              dominantBaseline="central"
              className="analog-clock-minutes"
            >
              {String(minLabel).padStart(2, '0')}
            </text>
          ) : null}
        </g>
      ))}

      {/* Hour hand — shorter, thicker */}
      <g
        className={`analog-hand analog-hand-hour ${emphasizeHour ? 'is-emphasis' : ''}`}
      >
        <line
          x1={hourTail.x}
          y1={hourTail.y}
          x2={hourTip.x}
          y2={hourTip.y}
          stroke="#4a3040"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <line
          x1={hourTail.x}
          y1={hourTail.y}
          x2={hourTip.x}
          y2={hourTip.y}
          stroke="#ff6fab"
          strokeWidth="5.5"
          strokeLinecap="round"
        />
      </g>

      {showMinuteHand ? (
        <g
          className={`analog-hand analog-hand-minute ${emphasizeMinute ? 'is-emphasis' : ''}`}
        >
          <line
            x1={minuteTail.x}
            y1={minuteTail.y}
            x2={minuteTip.x}
            y2={minuteTip.y}
            stroke="#1b2430"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <line
            x1={minuteTail.x}
            y1={minuteTail.y}
            x2={minuteTip.x}
            y2={minuteTip.y}
            stroke="#f39c12"
            strokeWidth="2.25"
            strokeLinecap="round"
          />
        </g>
      ) : null}

      <circle cx="100" cy="100" r="8" fill="#1b2430" />
      <circle cx="100" cy="100" r="4" fill="#ffe066" />
    </svg>
  )
}
