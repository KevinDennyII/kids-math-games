import { Link } from 'react-router-dom'
import { CharacterSprite } from '../shared/characters/CharacterSprite'
import { SPRITES } from '../shared/characters/sprites'
import './home.css'

function ColorfulKeyboard() {
  const rows = [
    [
      { label: 'Q', color: '#ff6b6b' },
      { label: 'W', color: '#ffa94d' },
      { label: 'E', color: '#ffe066' },
      { label: 'R', color: '#69db7c' },
      { label: 'T', color: '#4dabf7' },
    ],
    [
      { label: 'A', color: '#da77f2' },
      { label: 'S', color: '#ff8787' },
      { label: 'D', color: '#63e6be' },
      { label: 'F', color: '#74c0fc' },
      { label: 'G', color: '#ffd43b' },
    ],
    [
      { label: 'Z', color: '#20c997' },
      { label: 'X', color: '#ff922b' },
      { label: 'C', color: '#845ef7' },
      { label: 'V', color: '#f06595' },
      { label: 'B', color: '#339af0' },
    ],
  ]

  return (
    <svg
      className="home-keyboard"
      viewBox="0 0 200 118"
      width="168"
      height="99"
      role="img"
    >
      <rect
        x="4"
        y="8"
        width="192"
        height="102"
        rx="16"
        fill="#1e293b"
        stroke="#94a3b8"
        strokeWidth="3"
      />
      {rows.map((row, rowIndex) =>
        row.map((key, keyIndex) => {
          const x = 16 + keyIndex * 34 + rowIndex * 8
          const y = 20 + rowIndex * 28
          return (
            <g key={`${rowIndex}-${key.label}`} className="home-key">
              <rect
                x={x}
                y={y}
                width="28"
                height="22"
                rx="6"
                fill={key.color}
                stroke="#0f172a"
                strokeWidth="1.5"
              />
              <text
                x={x + 14}
                y={y + 15}
                textAnchor="middle"
                fontFamily="Fredoka, Nunito, sans-serif"
                fontSize="11"
                fontWeight="700"
                fill="#0f172a"
              >
                {key.label}
              </text>
            </g>
          )
        }),
      )}
      <rect x="40" y="104" width="120" height="10" rx="5" fill="#94a3b8" />
    </svg>
  )
}

export function Home() {
  return (
    <main className="home-shell">
      <div className="home-glow" aria-hidden="true" />
      <div className="home-composition">
        <p className="home-brand">Kids Math Games</p>
        <h1 className="home-headline">Pick your adventure</h1>
        <p className="home-sub">
          Math worlds for each kid — plus a shared typing rain they can both play.
        </p>

        <div className="home-fox-banner" aria-hidden="true">
          <CharacterSprite src={SPRITES.fox} alt="" size="md" motion="hop" />
          <span>Fox friend joins every world</span>
        </div>

        <div className="home-actions">
          <Link className="home-cta race-cta" to="/race">
            <div className="cta-art" aria-hidden="true">
              <CharacterSprite src={SPRITES.car} alt="" size="lg" motion="drive" />
            </div>
            <span className="cta-kicker">For him · Ages ~8</span>
            <span className="cta-title">Racecar Math League</span>
            <span className="cta-copy">Multiply, fuel up, collect badges</span>
          </Link>
          <Link className="home-cta academy-cta" to="/academy">
            <div className="cta-art cta-art-pets" aria-hidden="true">
              <CharacterSprite src={SPRITES.dog} alt="" size="sm" motion="bob" />
              <CharacterSprite src={SPRITES.cat} alt="" size="sm" motion="sway" />
              <CharacterSprite src={SPRITES.unicorn} alt="" size="sm" motion="hop" />
            </div>
            <span className="cta-kicker">For her · Ages ~6</span>
            <span className="cta-title">Magical Friendship Academy</span>
            <span className="cta-copy">Add, care for pets, earn stickers</span>
          </Link>
          <Link className="home-cta typing-cta" to="/typing">
            <div className="cta-art cta-art-keyboard" aria-hidden="true">
              <ColorfulKeyboard />
            </div>
            <span className="cta-kicker">Both kids · Typing</span>
            <span className="cta-title">Fox Word Rain</span>
            <span className="cta-copy">Type falling words before they land</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
