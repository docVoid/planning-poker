# Planning Poker

[![Live demo](https://img.shields.io/website?url=https%3A%2F%2Fplanning-poker.pngrtz.com&label=live%20demo&up_message=online&down_message=offline)](https://planning-poker.pngrtz.com)
[![Deployed on Vercel](https://img.shields.io/badge/deployed%20on-Vercel-black?logo=vercel)](https://planning-poker.pngrtz.com)

Scrum estimation. Open a room, share the link, deal the cards.

There is no server and no database: the room lives in the participants' browsers and is synchronised peer-to-peer
over WebRTC. When the last person leaves, the room is gone.

## Features

- Rooms with a shareable link, 8-character hex room codes
- Five fixed decks: Fibonacci, modified Fibonacci, T-shirt sizes, powers of two, linear (1–10), each with an abstain card
- Votes stay secret until everybody has voted (commit-reveal), then the table is revealed automatically
- Lowest, highest and average once revealed; consensus is highlighted
- The host can remove participants and start a new round; if the host leaves, the next person takes over
- English and German, light and dark theme, desktop-first with a mobile layout

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, Zustand, [Trystero](https://github.com/dmotz/trystero) for WebRTC
signalling.

## Getting started

```bash
npm install
npm run dev
```

| Script              | Purpose                                                |
| ------------------- | ------------------------------------------------------ |
| `npm run dev`       | Development server on http://localhost:3000            |
| `npm run build`     | Production build                                       |
| `npm test`          | Unit tests and room logic against an in-memory network |
| `npm run typecheck` | TypeScript check                                       |
| `npm run format`    | Format the code with Prettier                          |

## How it works

| Message       | Purpose                                                              |
| ------------- | -------------------------------------------------------------------- |
| `join`        | Name, join time and current vote state, sent to every new peer       |
| `config`      | Room name, deck, host and round, sent to newcomers by anyone present |
| `vote-commit` | A hash of the vote (never the value)                                 |
| `reveal`      | Value and salt, sent once everybody has voted                        |
| `reset`       | The host starts the next round                                       |
| `kick`        | The host removes a participant                                       |
| `leave`       | A participant leaves                                                 |
| `heartbeat`   | Presence plus a digest of the sender's state, so lost messages heal  |
| `host-change` | The host role moves to the next participant                          |

- **Secret votes.** A vote is sent as `SHA-256(round:id:value:salt)`. Once everybody has voted, each client reveals
  value and salt and all clients verify them against the hash.
- **Host succession.** Every client applies the same rule to the same data (longest present, smallest id on a tie), so
  all of them pick the same successor without a vote. An epoch counter settles diverging views.
- **Joining.** A newcomer receives the room configuration from the peers already present. If nobody answers within
  about eight seconds, the room is reported as not found or ended; an empty room is never created silently.

---

Created with ❤️ by [void](https://www.github.com/docVoid)
