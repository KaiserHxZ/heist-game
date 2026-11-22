// Screenshot scenes behind ?shot=cover|title|chase|win. Each scene
// starts from the real rules and then stages one honest moment: the
// cover puts Fen mid-room with keepers, a camera, loot and the alarm
// all in frame; chase stages a high-alarm pursuit; win stages the
// finished run. The same query always stages the same frame.

import { STEP } from './config.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './render.js';

function walkForward(game, seconds, dx, dy) {
  const steps = Math.round(seconds / STEP);
  for (let i = 0; i < steps; i += 1) {
    game.step(STEP, dx, dy, false, null);
    if (game.state.caught || game.state.won) break;
  }
}

export function stageShot(name, game) {
  const state = game.state;
  if (name === 'title') {
    game.reset();
    return { screen: SCREEN_TITLE, best: 1250 };
  }
  if (name === 'win') {
    game.reset();
    game.loadLevel(2);
    for (const packet of state.packets) packet.taken = true;
    state.packetsTaken = state.packetsTotal;
    state.score = 2840;
    state.alarm = 18;
    state.won = true;
    return { screen: SCREEN_WIN, best: 2840 };
  }
  if (name === 'chase') {
    game.reset();
    game.loadLevel(1);
    // Walk Fen into the tomato rows, then let a keeper's suspicion fill.
    walkForward(game, 1.1, 1, 0);
    walkForward(game, 1.4, 0, 1);
    state.thief.x = 640;
    state.thief.y = 360;
    state.packets[0].taken = true;
    state.packetsTaken = 1;
    state.score = 350;
    state.alarm = 78;
    const keeper = state.keepers[0];
    keeper.x = 560;
    keeper.y = 300;
    keeper.suspicion = 100;
    keeper.mode = 'chase';
    keeper.facing = Math.atan2(state.thief.y - keeper.y, state.thief.x - keeper.x);
    const other = state.keepers[1];
    other.x = 420;
    other.y = 430;
    other.suspicion = 62;
    other.facing = Math.atan2(state.thief.y - other.y, state.thief.x - other.x);
    return { screen: SCREEN_PLAY, best: 1250 };
  }
  // Cover: room 1, mid-crossing. Fen is on a gravel path between two
  // benches, a keeper patrols with its cone across the room, a second
  // keeper watches from below, a camera sweeps overhead, gold packets
  // wait on both sides, and the alarm sits part-filled.
  game.reset();
  walkForward(game, 0.7, 1, 0);
  walkForward(game, 0.6, 0, 1);
  state.thief.x = 620;
  state.thief.y = 330;
  state.thief.sneaking = true;
  state.thief.facing = 0.4;
  state.packets[0].taken = false;
  state.alarm = 34;
  state.score = 200;
  const keeper = state.keepers[0];
  keeper.x = 880;
  keeper.y = 290;
  keeper.facing = Math.PI;
  keeper.suspicion = 48;
  keeper.mode = 'suspicious';
  const second = state.keepers[1];
  second.x = 330;
  second.y = 470;
  second.facing = -0.6;
  second.suspicion = 22;
  state.cameras[0].facing = 1.1;
  state.cameras[0].seeing = false;
  state.cameras[1].facing = Math.PI - 0.4;
  return { screen: SCREEN_PLAY, best: 1250 };
}
