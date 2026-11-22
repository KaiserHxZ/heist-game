// Seeing: whether a watcher can see Fen. A watcher sees only inside
// its cone (distance and angle) and only when no wall, bench or
// trellis stands between the two. The ray is walked in small steps
// across the tile map, so a trellis reads exactly as it looks.

import { TILE } from './config.js';
import { blocksSight } from './levels.js';

function angleTo(fromX, fromY, toX, toY) {
  return Math.atan2(toY - fromY, toX - fromX);
}

function angleGap(a, b) {
  let gap = a - b;
  while (gap > Math.PI) gap -= Math.PI * 2;
  while (gap < -Math.PI) gap += Math.PI * 2;
  return gap;
}

export function hasLineOfSight(level, fromX, fromY, toX, toY) {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const distance = Math.hypot(dx, dy);
  const steps = Math.max(1, Math.ceil(distance / 8));
  for (let i = 1; i < steps; i += 1) {
    const x = fromX + (dx * i) / steps;
    const y = fromY + (dy * i) / steps;
    const col = Math.floor(x / TILE);
    const row = Math.floor(y / TILE);
    if (blocksSight(level, col, row)) return false;
  }
  return true;
}

export function insideCone(watcherX, watcherY, facing, range, halfAngle, targetX, targetY) {
  const dx = targetX - watcherX;
  const dy = targetY - watcherY;
  const distance = Math.hypot(dx, dy);
  if (distance > range) return { seen: false, distance };
  if (distance < 1) return { seen: true, distance };
  const gap = Math.abs(angleGap(angleTo(watcherX, watcherY, targetX, targetY), facing));
  return { seen: gap <= halfAngle, distance };
}

export function watcherSees(level, watcherX, watcherY, facing, range, halfAngle, targetX, targetY) {
  const cone = insideCone(watcherX, watcherY, facing, range, halfAngle, targetX, targetY);
  if (!cone.seen) return { seen: false, distance: cone.distance };
  if (!hasLineOfSight(level, watcherX, watcherY, targetX, targetY)) return { seen: false, distance: cone.distance };
  return { seen: true, distance: cone.distance };
}

export function coneEdge(level, watcherX, watcherY, facing, range, halfAngle, side) {
  const edge = facing + side * halfAngle;
  const step = 8;
  let x = watcherX;
  let y = watcherY;
  for (let travelled = 0; travelled <= range; travelled += step) {
    x = watcherX + Math.cos(edge) * travelled;
    y = watcherY + Math.sin(edge) * travelled;
    const col = Math.floor(x / TILE);
    const row = Math.floor(y / TILE);
    if (blocksSight(level, col, row)) break;
  }
  return { x, y };
}
