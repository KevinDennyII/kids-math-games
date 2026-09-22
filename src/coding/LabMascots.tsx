/**
 * Decorative Minecraft-inspired mascots for the Python Lab header.
 * Pure SVG + CSS — no image assets. aria-hidden; motion is presence, not a task.
 */

export function LabMascots() {
  return (
    <div className="lab-mascots" aria-hidden="true">
      <span className="lab-mascot lab-mascot--miner" data-i="0">
        <Miner />
      </span>
      <span className="lab-mascot lab-mascot--creeper" data-i="1">
        <Creeper />
      </span>
      <span className="lab-mascot lab-mascot--chicken" data-i="2">
        <Chicken />
      </span>
      <span className="lab-mascot lab-mascot--bot" data-i="3">
        <CodeBot />
      </span>
    </div>
  )
}

function Miner() {
  return (
    <svg viewBox="0 0 32 40" width="40" height="50" className="lab-mascot-svg">
      <ellipse className="lab-mascot-shadow" cx="16" cy="38" rx="10" ry="2.2" fill="rgb(0 0 0 / 0.35)" />
      <rect x="9" y="28" width="6" height="8" fill="#1e3a5f" />
      <rect x="17" y="28" width="6" height="8" fill="#1e3a5f" />
      <rect x="8" y="16" width="16" height="13" fill="#3b82f6" />
      <rect x="8" y="16" width="16" height="3" fill="#60a5fa" />
      <rect x="9" y="4" width="14" height="13" fill="#d4a574" />
      <rect x="9" y="4" width="14" height="3" fill="#5b3a1f" />
      <g className="lab-mascot-face">
        <rect x="11" y="9" width="3" height="3" fill="#0f172a" />
        <rect x="18" y="9" width="3" height="3" fill="#0f172a" />
        <rect x="12" y="14" width="8" height="1.5" fill="#b45309" opacity="0.55" />
      </g>
      <rect x="22" y="18" width="2" height="12" fill="#78716c" />
      <rect x="20" y="16" width="8" height="3" fill="#94a3b8" />
    </svg>
  )
}

function Creeper() {
  return (
    <svg viewBox="0 0 28 40" width="36" height="50" className="lab-mascot-svg">
      <ellipse className="lab-mascot-shadow" cx="14" cy="38" rx="9" ry="2.2" fill="rgb(0 0 0 / 0.35)" />
      <rect x="7" y="28" width="5" height="8" fill="#166534" />
      <rect x="16" y="28" width="5" height="8" fill="#166534" />
      <rect x="5" y="12" width="18" height="17" fill="#22c55e" />
      <rect x="5" y="12" width="18" height="3" fill="#4ade80" />
      <rect x="6" y="2" width="16" height="12" fill="#16a34a" />
      <g className="lab-mascot-face">
        <rect x="8" y="5" width="4" height="4" fill="#052e16" />
        <rect x="16" y="5" width="4" height="4" fill="#052e16" />
        <rect x="11" y="10" width="6" height="3" fill="#052e16" />
        <rect x="10" y="12" width="3" height="3" fill="#052e16" />
        <rect x="15" y="12" width="3" height="3" fill="#052e16" />
      </g>
    </svg>
  )
}

function Chicken() {
  return (
    <svg viewBox="0 0 32 36" width="40" height="46" className="lab-mascot-svg">
      <ellipse className="lab-mascot-shadow" cx="16" cy="34" rx="9" ry="2" fill="rgb(0 0 0 / 0.35)" />
      <rect x="11" y="26" width="3" height="7" fill="#f59e0b" />
      <rect x="18" y="26" width="3" height="7" fill="#f59e0b" />
      <rect x="8" y="14" width="16" height="14" fill="#f8fafc" />
      <rect x="8" y="14" width="16" height="3" fill="#e2e8f0" />
      <rect x="10" y="4" width="12" height="11" fill="#f8fafc" />
      <polygon points="10,8 4,10 10,12" fill="#f97316" />
      <rect x="14" y="1" width="4" height="4" fill="#ef4444" />
      <g className="lab-mascot-face">
        <rect x="18" y="8" width="3" height="3" fill="#0f172a" />
      </g>
      <rect className="lab-chicken-wing" x="20" y="16" width="7" height="5" fill="#e2e8f0" />
    </svg>
  )
}

function CodeBot() {
  return (
    <svg viewBox="0 0 32 40" width="40" height="50" className="lab-mascot-svg">
      <ellipse className="lab-mascot-shadow" cx="16" cy="38" rx="10" ry="2.2" fill="rgb(0 0 0 / 0.35)" />
      <circle cx="10" cy="34" r="5" fill="#0f172a" stroke="#fbbf24" strokeWidth="2" />
      <circle cx="22" cy="34" r="5" fill="#0f172a" stroke="#fbbf24" strokeWidth="2" />
      <rect x="7" y="14" width="18" height="16" rx="2" fill="#155e75" stroke="#7dd3fc" strokeWidth="1.5" />
      <rect x="9" y="6" width="14" height="10" rx="1.5" fill="#0e7490" />
      <rect x="11" y="8" width="10" height="5" rx="1" fill="#22d3ee" className="lab-bot-visor" />
      <rect x="14" y="3" width="4" height="4" fill="#fbbf24" />
      <circle cx="16" cy="2" r="1.5" fill="#fde68a" className="lab-bot-antenna" />
    </svg>
  )
}
