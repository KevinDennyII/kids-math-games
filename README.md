# Kids Math Games

Math and typing games on **dennymathgames.online**. Python Lab is a separate site on **coding.dennymathgames.online** (same Netlify deploy, different hostname).

- **Racecar Math League** (`/race`) — addition, subtraction, multiplication, and division with independent levels (ages 8+)
- **Magical Math Academy** (`/academy`) — the same four operations with gentler independent levels (ages 6+)
- **It’s TIME!** (`/clock`) — analog clock reading & setting that blends race + pet themes (both kids). Optional hands-on tutorial, then scaffolds o’clock → half past → quarters → count-by-5s with read and set modes.
- **Fox Rockets** (`/typing`) — shared falling-words typing for both kids

Progress saves in the browser via `localStorage`. No accounts. No download required.

## Python Lab (`coding.dennymathgames.online`)

Its own site. Kids open that URL — it is not a card on the math home.

In-browser Python (Pyodide): `print`, variables, `if` / `else`, loops, then `forward()` / `left()` / `right()` to drive a little bot, plus a free sandbox. Each mission starts with a short briefing and a check question, then Run.

### Point the subdomain

Same Netlify site, second hostname:

1. DNS: `CNAME coding` → the same Netlify target as `dennymathgames.online`.
2. Netlify → **Domain management → Add domain alias** → `coding.dennymathgames.online`.
3. `coding.dennymathgames.online` is Python Lab at `/`. Math games stay on the apex. Visiting `/coding` on the math domain redirects to the coding host.

Local preview (no DNS): `http://localhost:5173/coding`.

Python downloads the Pyodide engine from jsDelivr on first visit (a few seconds, needs network).

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
4. Deploy. Deep links (`/race`, `/academy`, `/clock`, `/typing`, `/coding`) work via SPA fallback.

Optional CLI:

```bash
npx netlify deploy --prod
```

Kids open the HTTPS URL on a tablet or the Raspberry Pi browser. Progress stays on that device.

## Clean code notes

Guided by [Responsive Typography](https://separated-day-526.notion.site/Responsive-Typography-3a6175a31ea2804da8f7ee7deb9aae59) and [The Joy Of React](https://separated-day-526.notion.site/The-Joy-Of-React-d234359051a44f2ca721bcb4c9ec5de5):

- Body text stays `1rem`; headings use fluid `clamp` tokens in `src/styles/tokens.css`
- Form inputs are `1rem` to avoid iOS Safari focus zoom
- Shared math loop lives in `useAdaptiveProblemGame`; `OperationPicker` is the shared per-operation level UI
- Game chrome composed via `GameHeader` + `MathPlayPanel`

## Stack

React 19 + TypeScript + Vite + React Router + Zustand. CSS-first whimsical motion. Pure TypeScript math engine for adaptive difficulty. In-browser Python via Pyodide.
