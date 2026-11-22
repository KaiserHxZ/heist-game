// Groundskeepers and cameras: patrol, suspicion, chase, and the
// sweeping camera cones. A keeper walks its waypoint loop, pauses to
// look around at each corner, investigates a rattling seed pod, and
// gives chase only when suspicion fills. Breaking line of sight calms
// a keeper; a chase that finds nothing returns to patrol.

import { SIGHT, SUSPICION, TILE } from './config.js';
import { blocksMove } from './levels.js';
import { watcherSees } from './vision.js';

export const KEEPER_CALM = 'patrol';
export const KEEPER_SUSPICIOUS = 'suspicious';
export const KEEPER_CHASE = 'chase';
export const KEEPER_INVESTIGATE = 'investigate';

function tileCentre(col, row) {
  return { x: (col + 0.5) * TILE, y: (row + 0.5) * TILE };
}

function moveToward(keeper, targetX, targetY, speed, dt, level) {
  const dx = targetX - keeper.x;
  const dy = targetY - keeper.y;
  const distance = Math.hypot(dx, dy);
  if (distance < 2) return true;
  const step = Math.min(distance, speed * dt);
  const nextX = keeper.x + (dx / distance) * step;
  const nextY = keeper.y + (dy / distance) * step;
  const blockedX = blocksMove(level, Math.floor(nextX / TILE), Math.floor(keeper.y / TILE));
  const blockedY = blocksMove(level, Math.floor(keeper.x / TILE), Math.floor(nextY / TILE));
  if (!blockedX) keeper.x = nextX;
  if (!blockedY) keeper.y = nextY;
  keeper.facing = Math.atan2(dy, dx);
  return distance <= step + 2;
}

export function createKeeper(definition) {
  const start = tileCentre(definition.col, definition.row);
  const patrol = definition.patrol.map(([col, row]) => tileCentre(col, row));
  return {
    x: start.x,
    y: start.y,
    facing: 0,
    patrol,
    waypoint: 1 % patrol.length,
    speed: definition.speed,
    suspicion: 0,
    mode: KEEPER_CALM,
    pause: 0,
    investigateX: start.x,
    investigateY: start.y,
    lookTimer: 0,
  };
}

export function createCamera(definition) {
  const at = tileCentre(definition.col, definition.row);
  return {
    x: at.x,
    y: at.y,
    centre: definition.centre,
    swing: definition.swing,
    speed: definition.speed,
    phase: definition.col * 0.7 + definition.row * 0.3,
    facing: definition.centre,
    seeing: false,
  };
}

export function updateCamera(camera, time) {
  camera.facing = camera.centre + Math.sin(time * camera.speed + camera.phase) * camera.swing;
  return camera;
}

export function keeperSeesPlayer(level, keeper, player) {
  return watcherSees(level, keeper.x, keeper.y, keeper.facing, SIGHT.guardRange, SIGHT.guardHalfAngle, player.x, player.y);
}

export function cameraSeesPlayer(level, camera, player) {
  return watcherSees(level, camera.x, camera.y, camera.facing, SIGHT.cameraRange, SIGHT.cameraHalfAngle, player.x, player.y);
}

export function updateKeeper(keeper, dt, level, player, lure) {
  const seen = keeperSeesPlayer(level, keeper, player);
  const sneaking = player.sneaking;
  const onGravel = player.onGravel;

  if (seen.seen) {
    let rise = SUSPICION.riseSeen;
    if (seen.distance < SIGHT.closeRange) rise = SUSPICION.riseClose;
    if (sneaking) rise *= 0.45;
    if (onGravel) rise *= 1.5;
    keeper.suspicion = Math.min(SUSPICION.chaseAt, keeper.suspicion + rise * dt);
  } else {
    keeper.suspicion = Math.max(0, keeper.suspicion - SUSPICION.decay * dt);
  }

  if (keeper.suspicion >= SUSPICION.chaseAt) keeper.mode = KEEPER_CHASE;
  else if (keeper.mode === KEEPER_CHASE && keeper.suspicion <= SUSPICION.calmAt) keeper.mode = KEEPER_CALM;
  else if (keeper.mode !== KEEPER_CHASE && keeper.suspicion > 35) keeper.mode = KEEPER_SUSPICIOUS;

  if (lure && lure.active && keeper.mode !== KEEPER_CHASE) {
    const distance = Math.hypot(lure.x - keeper.x, lure.y - keeper.y);
    if (distance < 240) {
      keeper.mode = KEEPER_INVESTIGATE;
      keeper.investigateX = lure.x;
      keeper.investigateY = lure.y;
    }
  }

  if (keeper.mode === KEEPER_CHASE) {
    moveToward(keeper, player.x, player.y, keeper.speed * 1.65, dt, level);
    return seen;
  }

  if (keeper.mode === KEEPER_INVESTIGATE) {
    const arrived = moveToward(keeper, keeper.investigateX, keeper.investigateY, keeper.speed * 1.25, dt, level);
    if (arrived || !lure || !lure.active) {
      keeper.pause = 1.2;
      keeper.mode = KEEPER_SUSPICIOUS;
    }
    return seen;
  }

  if (keeper.pause > 0) {
    keeper.pause -= dt;
    keeper.lookTimer += dt;
    keeper.facing += Math.sin(keeper.lookTimer * 2.2) * 0.02;
    return seen;
  }

  const target = keeper.patrol[keeper.waypoint];
  const arrived = moveToward(keeper, target.x, target.y, keeper.speed, dt, level);
  if (arrived) {
    keeper.waypoint = (keeper.waypoint + 1) % keeper.patrol.length;
    keeper.pause = 0.8;
    keeper.lookTimer = 0;
  }
  return seen;
}
