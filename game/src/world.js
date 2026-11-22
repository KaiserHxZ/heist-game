// The rules and the state, with no drawing in it: rooms, loot, the
// alarm, catching, winning and scoring. A step advances one fixed
// slice of time and returns what happened as flags, so the loop can
// play a sound or announce it without the world knowing about either.

import { ALARM, COLS, ROWS, SCORE, STEP, TILE } from './config.js';
import { LEVELS, findTiles } from './levels.js';
import { createCamera, createKeeper, cameraSeesPlayer, updateCamera, updateKeeper } from './guards.js';
import { createPod, createThief, moveThief, throwPod, updatePod } from './player.js';

export const EVENT_PACKET = 1;
export const EVENT_CAUGHT = 2;
export const EVENT_ALARM = 4;
export const EVENT_LEVEL = 8;
export const EVENT_WIN = 16;
export const EVENT_SPOTTED = 32;
export const EVENT_POD = 64;

export function createGame() {
  const game = {
    levelIndex: 0,
    level: null,
    thief: null,
    keepers: [],
    cameras: [],
    packets: [],
    gate: null,
    pot: null,
    pod: createPod(),
    alarm: 0,
    score: 0,
    packetsTaken: 0,
    packetsTotal: 0,
    timeInLevel: 0,
    totalTime: 0,
    caught: false,
    won: false,
    levelDone: false,
    spottedFlash: 0,
    best: 0,
  };

  function loadLevel(index) {
    const level = LEVELS[index];
    game.levelIndex = index;
    game.level = level;
    const start = findTiles(level, 'P')[0];
    const startX = (start.col + 0.5) * TILE;
    const startY = (start.row + 0.5) * TILE;
    game.thief = createThief(startX, startY);
    game.pot = { x: startX - 26, y: startY + 22 };
    game.keepers = level.guards.map((definition) => createKeeper(definition));
    game.cameras = level.cameras.map((definition) => createCamera(definition));
    game.packets = findTiles(level, 'L').map(({ col, row }) => ({
      x: (col + 0.5) * TILE,
      y: (row + 0.5) * TILE,
      taken: false,
    }));
    const gateTile = findTiles(level, 'E')[0];
    game.gate = { x: (gateTile.col + 0.5) * TILE, y: (gateTile.row + 0.5) * TILE, col: gateTile.col, row: gateTile.row };
    game.packetsTotal = game.packets.length;
    game.packetsTaken = 0;
    game.alarm = Math.max(0, game.alarm - 25);
    game.timeInLevel = 0;
    game.caught = false;
    game.levelDone = false;
    game.pod.active = false;
  }

  function reset() {
    game.score = 0;
    game.totalTime = 0;
    game.alarm = 0;
    game.won = false;
    loadLevel(0);
  }

  function gateOpen() {
    return game.packetsTaken >= game.packetsTotal;
  }

  function step(dt, moveX, moveY, sneak, throwAt) {
    let events = 0;
    if (game.caught || game.won) return events;
    game.timeInLevel += dt;
    game.totalTime += dt;
    const thief = game.thief;
    thief.sneaking = sneak;
    moveThief(thief, moveX, moveY, dt, game.level);

    if (throwAt) {
      if (throwPod(game.pod, thief, throwAt.x, throwAt.y)) events |= EVENT_POD;
    }
    updatePod(game.pod, dt, game.level);

    let anyChase = false;
    let anyCameraSeeing = false;
    let anySeeing = false;
    for (const keeper of game.keepers) {
      const seen = updateKeeper(keeper, dt, game.level, thief, game.pod);
      if (seen.seen) anySeeing = true;
      if (keeper.mode === 'chase') anyChase = true;
      const caught = Math.hypot(keeper.x - thief.x, keeper.y - thief.y) < 30;
      if (keeper.mode === 'chase' && caught) {
        game.caught = true;
        return EVENT_CAUGHT;
      }
    }
    for (const camera of game.cameras) {
      updateCamera(camera, game.totalTime);
      const seen = cameraSeesPlayer(game.level, camera, thief);
      camera.seeing = seen.seen;
      if (seen.seen) anyCameraSeeing = true;
    }

    if (anySeeing || anyCameraSeeing) {
      game.spottedFlash = 0.6;
      events |= EVENT_SPOTTED;
    } else {
      game.spottedFlash = Math.max(0, game.spottedFlash - dt);
    }

    if (anyChase) game.alarm += ALARM.riseChase * dt;
    if (anyCameraSeeing) game.alarm += ALARM.riseCameraSeen * dt;
    if (anySeeing) game.alarm += ALARM.riseSpotted * dt;
    game.alarm = Math.max(0, Math.min(ALARM.max, game.alarm - ALARM.decay * dt + (anyChase || anyCameraSeeing || anySeeing ? ALARM.decay * dt : 0)));
    // The line above keeps the alarm from decaying in the same step it
    // rose; the net change is the rise alone while watched.
    if (anyChase || anyCameraSeeing || anySeeing) {
      // Re-apply the rise without the decay that the clamp line added back.
    }
    if (game.alarm >= ALARM.max) {
      game.caught = true;
      return EVENT_ALARM;
    }

    for (const packet of game.packets) {
      if (!packet.taken && Math.hypot(packet.x - thief.x, packet.y - thief.y) < 30) {
        packet.taken = true;
        game.packetsTaken += 1;
        game.score += SCORE.packet;
        events |= EVENT_PACKET;
      }
    }

    if (gateOpen() && Math.hypot(game.gate.x - thief.x, game.gate.y - thief.y) < 34) {
      game.score += SCORE.levelClear;
      if (game.alarm < 35) game.score += SCORE.lowAlarmBonus;
      game.score += Math.max(0, Math.round((90 - game.timeInLevel) * SCORE.timeBonusPerSecond));
      if (game.levelIndex + 1 >= LEVELS.length) {
        game.won = true;
        return events | EVENT_WIN;
      }
      loadLevel(game.levelIndex + 1);
      return events | EVENT_LEVEL;
    }
    return events;
  }

  reset();
  return { state: game, reset, loadLevel, gateOpen, step, levelCount: LEVELS.length };
}

export { COLS, ROWS, STEP };
