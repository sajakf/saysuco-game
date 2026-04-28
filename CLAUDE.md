# Say Suco Game — Project Memory

## Git Commit Rules (ALWAYS FOLLOW)
- Commit after **every new feature** introduced — never batch unrelated features in one commit
- **Title**: Short imperative summary ≤72 chars (e.g. `Add Kuwait +965 country code dropdown`)
- **Body**: Bullet list — what changed + why, one bullet per meaningful change
- **Footer**: Always end with `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`
- Never use vague messages like "fix", "update", "changes", or "misc"

### Example of a good commit
```
Add Open Trivia DB API integration for live questions

- Replace 10 hardcoded questions with live fetch from opentdb.com
- Decode url3986-encoded strings with decodeURIComponent()
- Shuffle answer options so correct index is randomised
- Map 25 categories to matching emojis (🎬 🌍 💡 🐾 etc.)
- Show easy/medium/hard difficulty badge on each question
- Display loading skeleton while API fetch is in progress
- Auto-refetch pool when fewer than 3 questions remain
- Fall back to local Say Suco questions if API is offline

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

## Project Info
- **Repo**: `git@github.com:sajakf/saysuco-game.git`
- **Stack**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion, qrcode.react
- **Theme**: Cream `#EDE0D4` · Burgundy `#85184F` · Gold `#C49540`
- **SSH key**: `~/.ssh/saysuco_game`
- **Local dev**: `http://localhost:3000` · Network: `http://192.168.14.205:3000`
- **Node**: `~/.nvm/versions/node/v24.15.0`

## Features Shipped
| # | Feature | Commit |
|---|---------|--------|
| 1 | Full game — board, AI, timer, score, promo, QR | `fa69e07` |
| 2 | Kuwait +965 country code dropdown | included in initial |
| 3 | Say Suco brand theme restyle (cream/burgundy/gold) | included in initial |
| 4 | Open Trivia DB live API questions | `895be05` |
