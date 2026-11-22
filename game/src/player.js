// Fen: movement, sneaking, and the seed pods. Movement is axis by
// axis against the tile map, so sliding along a bench feels right and
// Fen never sinks into a wall. The pod is thrown toward the mouse and
// rattles where it lands; keepers nearby go to look.

import { PODS, THIEF, TILE } from './config.js';
import { blocksMove, tileAt } from './levels.js';

export function createThief(startX, startY) {
  return {
    x: startX,
    y: startY,
    radius: THIEF.radius,
    facing: 0,
    sneaking: false,
    moving: false,
    onGravel: false,
    pods: PODS.perLevel,
  };
}

function blockedAt(level, x, y, radius) {
  const corners = [
    [x - radius, y - radius],
    [x + radius, y - radius],
    [x - radius, y + radius],
    [x + radius, y + radius],
  ];
  for (const [cx, cy] of corners) {
    if (blocksMove(level, Math.floor(cx / TILE), Math.floor(cy / TILE))) return true;
  }
  return false;
}

export function moveThief(thief, dx, dy, dt, level) {
  const onGravelNow = tileAt(level, Math.floor(thief.x / TILE), Math.floor(thief.y / TILE)) === 'g';
  thief.onGravel = onGravelNow;
  let speed = thief.sneaking ? THIEF.sneakSpeed : THIEF.walkSpeed;
  if (onGravelNow && !thief.sneaking) speed = THIEF.gravelSpeed;
  const length = Math.hypot(dx, dy);
  thief.moving = length > 0;
  if (length === 0) return;
  const nx = dx / length;
  const ny = dy / length;
  thief.facing = Math.atan2(ny, nx);
  const stepX = nx * speed * dt;
  const stepY = ny * speed * dt;
  if (!blockedAt(level, thief.x + stepX, thief.y, thief.radius)) thief.x += stepX;
  if (!blockedAt(level, thief.x, thief.y + stepY, thief.radius)) thief.y += stepY;
  thief.x = Math.max(thief.radius, Math.min(1280 - thief.radius, thief.x));
  thief.y = Math.max(thief.radius, Math.min(720 - thief.radius, thief.y));
}

export function createPod() {
  return { active: false, x: 0, y: 0, targetX: 0, targetY: 0, flying: false, rattle: 0 };
}

export function throwPod(pod, thief, targetX, targetY) {
  if (thief.pods <= 0 || pod.active) return false;
  thief.pods -= 1;
  pod.active = true;
  pod.flying = true;
  pod.x = thief.x;
  pod.y = thief.y;
  const dx = targetX - thief.x;
  const dy = targetY - thief.y;
  const distance = Math.min(Math.hypot(dx, dy), PODS.range);
  const angle = Math.atan2(dy, dx);
  pod.targetX = thief.x + Math.cos(angle) * distance;
  pod.targetY = thief.y + Math.sin(angle) * distance;
  pod.rattle = 0;
  return true;
}

export function updatePod(pod, dt, level) {
  if (!pod.active) return;
  if (pod.flying) {
    const dx = pod.targetX - pod.x;
    const dy = pod.targetY - pod.y;
    const distance = Math.hypot(dx, dy);
    const step = 520 * dt;
    if (distance <= step) {
      pod.x = pod.targetX;
      pod.y = pod.targetY;
      pod.flying = false;
      pod.rattle = PODS.rattleSeconds;
    } else {
      pod.x += (dx / distance) * step;
      pod.y += (dy / distance) * step;
    }
    if (blocksMove(level, Math.floor(pod.x / TILE), Math.floor(pod.y / TILE))) {
      pod.flying = false;
      pod.rattle = PODS.rattleSeconds;
    }
  } else {
    pod.rattle -= dt;
    if (pod.rattle <= 0) pod.active = false;
  }
}
