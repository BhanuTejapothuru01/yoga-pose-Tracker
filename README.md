# YogaTracker

Web app for tracking fitness and yoga form with a webcam. Uses MediaPipe for pose detection and Supabase for auth and data.

## Setup

You need Node 18+, a Supabase project, and Chrome (or Edge) for the camera.

```bash
git clone https://github.com/BhanuTejapothuru01/yoga-pose-Tracker.git
cd yoga-pose-Tracker
npm run install:app
cp yoga-tracker/.env.local.example yoga-tracker/.env.local
```

Add your Supabase URL, anon key, and service role key to `yoga-tracker/.env.local`.  
For database setup, also add `SUPABASE_DB_PASSWORD` and `SUPABASE_DB_HOST`, then run:

```bash
npm run setup:supabase
```

## Quick Start (Single Command)

You can start both backend API endpoints and frontend with a single command:

**macOS / Linux / Git Bash / WSL:**
```bash
chmod +x start.sh
./start.sh
```

**Windows (Command Prompt / PowerShell):**
```cmd
start.bat
```

*(Note: `start.sh` can also be executed on Windows environments via Git Bash or WSL).*

## Manual Setup

Start the dev server:

```bash
npm run dev
```

Open **http://localhost:3000** — use that URL, not Live Server on port 5500.

## Using the app

1. Sign up with any email
2. Finish onboarding (profile, goal, equipment)
3. Open **Session** → start camera → pick an exercise
4. **Start Session** when ready; stop to save to the dashboard

## Commands

| Command | What it does |
|---------|----------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run setup:supabase` | Run SQL migrations |

All commands run from the repo root. The Next.js app lives in `yoga-tracker/`.

## Stack

Next.js, TypeScript, Tailwind, Supabase, MediaPipe Tasks Vision, Recharts.

## Deploy

Push to GitHub and deploy on Vercel or Netlify. Set the same env vars in the host dashboard. Build command: `npm run build` from repo root (or `cd yoga-tracker && npm run build`).

## License

MIT
