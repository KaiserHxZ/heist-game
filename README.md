[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/KaiserHxZ/heist-game/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/KaiserHxZ/heist-game/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

# The Glasshouse Take

A top-down heist game that runs offline in a desktop browser from static
files. Fen, a seed-keeper's apprentice, slips through a glasshouse at
closing time to take back heirloom seed packets before they are locked in
the company's cold vault. Three rooms, patrolling groundskeepers with
readable vision cones, sweeping security cameras, seed-pod distractions,
and an alarm meter that always gives you a chance to break away.

Built for the make.fun bounty "Make the best heist game"
(best-heist-game-20261122-0559).

## How to play

Serve the game locally, then open it in desktop Chrome:

```
node serve.ts
```

Or open `game/index.html` through any static server.

- **WASD / arrow keys** — move
- **Shift** — sneak: slower, quieter, much harder to spot
- **Mouse click or Q** — toss a seed pod toward the cursor; nearby
  groundskeepers go to investigate where it lands (limited pods)
- **P / Esc** — pause · **R** — restart the level · **M** — mute

Collect every seed packet in the room to unlock the green gate, then
reach the gate. Gravel paths are fast but loud; soil is slow and quiet.
Tall planters and potting benches block sight. If a groundskeeper's
suspicion fills, it gives chase — break its line of sight and it calms
down. If the alarm meter fills, the glasshouse locks and the run ends.

Score: seed packets, a bonus for finishing with a low alarm, and a
time bonus. Three rooms: the Potting Shed, the Tomato Rows, and the
Cold Vault.

## Files

- `game/` — the playable game: `index.html` plus one module per job
  under `game/src/` (levels, vision, guards, player, world, render,
  input, sound, shots, config, main)
- `main.ts` — copies `game/` and `screenshots/` and writes the dossier
- `screenshots/` — renders of the real game in a browser
- `vendor/makefun-game.ts` — the kit library, unchanged

## The cracked pot

Fen carries one chipped terracotta pot. It sits empty on the title
screen, it marks the starting corner of every room, and on the win
screen it holds every packet taken back. The pot is the promise: take
only the seeds, leave the glasshouse standing.
