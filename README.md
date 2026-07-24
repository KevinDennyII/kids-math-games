# Kids Math Games

One web app with three browser games for kids:

- **Racecar Math League** (`/race`) — multiplication & simple fractions (~age 8)
- **Magical Friendship Academy** (`/academy`) — addition with gentle progression (~age 6)
- **Fox Word Rain** (`/typing`) — shared falling-words typing for both kids

Progress saves in the browser via `localStorage`. No accounts. No download required.

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local Vite server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm test` | Unit tests for math engine |
| `npm run lint` | Oxlint |
| `npm run clean` | Remove dead/generated files, lint, test, and verify build |

## Deploy on Netlify

Config is in [`netlify.toml`](netlify.toml) (build + SPA redirects).

1. Push this repo to GitHub/GitLab.
2. In Netlify: **Add new site → Import an existing project**.
3. Confirm:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Node version:** 22 (set in `netlify.toml`)
4. Deploy. Deep links (`/race`, `/academy`, `/typing`) work via SPA fallback.

Optional CLI:

```bash
npx netlify deploy --prod
```

Kids open the HTTPS URL on a tablet or the Raspberry Pi browser. Progress stays on that device.

## Clean code notes

Guided by [Responsive Typography](https://separated-day-526.notion.site/Responsive-Typography-3a6175a31ea2804da8f7ee7deb9aae59) and [The Joy Of React](https://separated-day-526.notion.site/The-Joy-Of-React-d234359051a44f2ca721bcb4c9ec5de5):

- Body text stays `1rem`; headings use fluid `clamp` tokens in `src/styles/tokens.css`
- Form inputs are `1rem` to avoid iOS Safari focus zoom
- Shared math loop lives in `useAdaptiveProblemGame` (single source of truth)
- Game chrome composed via `GameHeader` + `MathPlayPanel`

## Stack

React 19 + TypeScript + Vite + React Router + Zustand. CSS-first whimsical motion. Pure TypeScript math engine for adaptive difficulty.
