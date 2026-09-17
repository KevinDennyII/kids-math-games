/** Playful clock face mascot for It’s TIME! home CTA + game chrome. */
import { useId } from 'react'
import './clockMascot.css'

export function ClockMascot({ className = '' }: { className?: string }) {
  const uid = useId()
  const rimId = `${uid}-rim`
  const faceId = `${uid}-face`

  return (
    <svg
      className={`clock-mascot ${className}`}
      viewBox="0 0 160 160"
      width="148"
      height="148"
      role="img"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={rimId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff8a3d" />
          <stop offset="50%" stopColor="#ff6fab" />
          <stop offset="100%" stopColor="#6ec4f0" />
        </linearGradient>
        <radialGradient id={faceId} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#fffdf8" />
          <stop offset="100%" stopColor="#ffe8d4" />
        </radialGradient>
      </defs>

      <ellipse
        className="clock-mascot-shadow"
        cx="80"
        cy="148"
        rx="42"
        ry="8"
        fill="rgb(40 30 50 / 0.18)"
      />

      <g className="clock-mascot-body">
        <circle cx="48" cy="22" r="8" fill="#ffb347" />
        <circle cx="112" cy="22" r="8" fill="#ff8ec8" />

        <circle cx="80" cy="82" r="62" fill={`url(#${rimId})`} />
        <circle cx="80" cy="82" r="52" fill={`url(#${faceId})`} />
        <circle
          cx="80"
          cy="82"
          r="52"
          fill="none"
          stroke="#fff"
          strokeWidth="3"
          opacity="0.85"
        />

        <text x="80" y="44" textAnchor="middle" className="clock-mascot-num">
          12
        </text>
        <text x="118" y="88" textAnchor="middle" className="clock-mascot-num">
          3
        </text>
        <text x="80" y="128" textAnchor="middle" className="clock-mascot-num">
          6
        </text>
        <text x="42" y="88" textAnchor="middle" className="clock-mascot-num">
          9
        </text>

        <ellipse cx="62" cy="74" rx="9" ry="11" fill="#2a1f28" />
        <ellipse cx="98" cy="74" rx="9" ry="11" fill="#2a1f28" />
        <circle cx="65" cy="70" r="3.2" fill="#fff" />
        <circle cx="101" cy="70" r="3.2" fill="#fff" />

        <path
          d="M62 98 Q80 112 98 98"
          fill="none"
          stroke="#2a1f28"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path d="M70 100 Q80 108 90 100" fill="#ff8ec8" opacity="0.45" />

        <g className="clock-mascot-hour">
          <line
            x1="80"
            y1="86"
            x2="80"
            y2="64"
            stroke="#ff6fab"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>
        <g className="clock-mascot-minute">
          <line
            x1="80"
            y1="88"
            x2="80"
            y2="54"
            stroke="#f39c12"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </g>
        <circle cx="80" cy="82" r="4.5" fill="#2a1f28" />
        <circle cx="80" cy="82" r="2" fill="#ffe066" />
      </g>
    </svg>
  )
}
