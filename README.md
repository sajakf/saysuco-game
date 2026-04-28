# Say Suco X&O Game 🥤

A branded Tic-Tac-Toe game for Say Suco café — play as the Açaí Cup against the AI, win 10 times, and unlock an exclusive promo code!

## Quick Start

```bash
# Install Node.js first if you haven't:
# https://nodejs.org (download LTS version)

cd saysuco-game
npm install
npm run dev
# Open http://localhost:3000
```

## Deploy to Vercel (Free — get a shareable link)

```bash
npm install -g vercel
vercel
# Follow prompts — your link will be like https://saysuco-game.vercel.app
```

## Features

| Feature | Details |
|---------|---------|
| 🎮 Game | Tic-Tac-Toe vs AI (medium difficulty) |
| ⏱ Timer | 3-minute countdown per session |
| 🏆 Promo | Win 10 total games → unique promo code |
| 📱 Auth | Mobile number registration |
| ❌ Daily limit | Lose once → locked out until tomorrow |
| 🧠 Trivia | Say Suco açaí trivia every 3rd game (+15s bonus) |
| 🔊 Sound | Web Audio API — no files needed |
| 📲 QR Code | Auto-generated from your deployment URL |
| 📊 Leaderboard | Top winners tracked in localStorage |

## Customization

- **Wins needed for promo**: `lib/storage.ts` → `WINS_THRESHOLD`
- **Game duration**: `components/GameBoard.tsx` → `GAME_DURATION`
- **AI difficulty**: `components/GameBoard.tsx` → `getBestMove(..., "medium")` → change to `"easy"` or `"hard"`
- **Promo code format**: `lib/storage.ts` → `generatePromoCode()`
- **Trivia questions**: `lib/trivia.ts` → add/edit `TRIVIA_QUESTIONS`

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (custom Say Suco theme)
- **Framer Motion** (animations)
- **qrcode.react** (QR generation)
- **Web Audio API** (sounds — no sound files needed)
- **canvas-confetti** (win celebrations)
- **localStorage** (player data, no backend needed)
