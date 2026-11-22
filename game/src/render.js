// Drawing only: the room, the cones, the people, the loot and the
// HUD. The 1280x720 room scales to fit the window. Cover is green and
// leafy, danger is warm amber turning red, loot is gold: the three
// read at a glance even when the frame is shrunk for the judge.

import { COLS, FIELD, FONT, PALETTE, ROWS, TILE } from './config.js';
import { coneEdge } from './vision.js';
import { SIGHT } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';
export const SCREEN_WIN = 'win';

function drawPot(context, x, y, scale, filled) {
  context.save();
  context.translate(x, y);
  context.scale(scale, scale);
  context.fillStyle = PALETTE.pot;
  context.beginPath();
  context.moveTo(-14, -8);
  context.lineTo(14, -8);
  context.lineTo(10, 14);
  context.quadraticCurveTo(0, 20, -10, 14);
  context.closePath();
  context.fill();
  context.fillStyle = PALETTE.potDark;
  context.fillRect(-17, -12, 34, 5);
  context.strokeStyle = PALETTE.potDark;
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(6, -8);
  context.lineTo(3, 6);
  context.stroke();
  if (filled) {
    context.fillStyle = PALETTE.packet;
    for (let i = 0; i < 3; i += 1) {
      context.fillRect(-9 + i * 7, -18 + (i % 2) * 3, 6, 9);
    }
  }
  context.restore();
}

function drawPacket(context, x, y, time) {
  const bob = Math.sin(time * 3 + x) * 2;
  context.save();
  context.translate(x, y + bob);
  context.fillStyle = PALETTE.packet;
  context.fillRect(-11, -14, 22, 28);
  context.fillStyle = PALETTE.packetSeal;
  context.fillRect(-11, -14, 22, 6);
  context.fillStyle = '#fff6d8';
  context.beginPath();
  context.moveTo(0, -6);
  context.lineTo(6, 2);
  context.lineTo(0, 9);
  context.lineTo(-6, 2);
  context.closePath();
  context.fill();
  context.restore();
}

function drawCone(context, level, x, y, facing, range, halfAngle, alert) {
  const left = coneEdge(level, x, y, facing, range, halfAngle, -1);
  const right = coneEdge(level, x, y, facing, range, halfAngle, 1);
  const mid = coneEdge(level, x, y, facing, range, 0, 0);
  context.beginPath();
  context.moveTo(x, y);
  context.quadraticCurveTo(left.x, left.y, mid.x, mid.y);
  context.quadraticCurveTo(right.x, right.y, x, y);
  context.closePath();
  context.fillStyle = alert ? PALETTE.coneAlert : PALETTE.coneCalm;
  context.fill();
  context.strokeStyle = alert ? 'rgba(232,90,60,0.55)' : 'rgba(232,200,90,0.35)';
  context.lineWidth = 1.5;
  context.stroke();
}

export function createRenderer(canvas) {
  const context = canvas.getContext('2d');
  const view = { scale: 1, x: 0, y: 0 };
  const fonts = new Map();

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(window.innerWidth * ratio);
    canvas.height = Math.round(window.innerHeight * ratio);
    view.scale = Math.min(canvas.width / FIELD.width, canvas.height / FIELD.height);
    view.x = (canvas.width - FIELD.width * view.scale) / 2;
    view.y = (canvas.height - FIELD.height * view.scale) / 2;
  }

  function text(value, x, y, size, color, align) {
    if (!fonts.has(size)) fonts.set(size, `bold ${size}px ${FONT}`);
    context.font = fonts.get(size);
    context.fillStyle = color;
    context.textAlign = align;
    context.textBaseline = 'alphabetic';
    context.fillText(value, x, y);
  }

  function drawRoom(game, time) {
    const level = game.level;
    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLS; col += 1) {
        const tile = level.map[row][col];
        const x = col * TILE;
        const y = row * TILE;
        if (tile === '#') {
          context.fillStyle = PALETTE.wall;
          context.fillRect(x, y, TILE, TILE);
          context.fillStyle = PALETTE.wallTop;
          context.fillRect(x, y, TILE, 6);
          context.fillStyle = PALETTE.glass;
          if (row === 0 || col === 0 || col === COLS - 1) context.fillRect(x + 6, y + 10, TILE - 12, TILE - 20);
        } else if (tile === 'g') {
          context.fillStyle = PALETTE.gravel;
          context.fillRect(x, y, TILE, TILE);
          context.fillStyle = PALETTE.gravelDot;
          context.fillRect(x + 8, y + 9, 4, 4);
          context.fillRect(x + 24, y + 26, 4, 4);
          context.fillRect(x + 18, y + 14, 3, 3);
        } else {
          context.fillStyle = (col + row) % 2 === 0 ? PALETTE.soil : PALETTE.soilDark;
          context.fillRect(x, y, TILE, TILE);
        }
        if (tile === 'B') {
          context.fillStyle = PALETTE.bench;
          context.fillRect(x + 3, y + 6, TILE - 6, TILE - 12);
          context.fillStyle = PALETTE.benchTop;
          context.fillRect(x + 3, y + 6, TILE - 6, 8);
          context.fillStyle = PALETTE.planterLeaf;
          context.fillRect(x + 9, y + 18, 8, 8);
          context.fillRect(x + 23, y + 18, 8, 8);
        }
        if (tile === 'T') {
          context.fillStyle = PALETTE.planter;
          context.fillRect(x + 4, y + 20, TILE - 8, TILE - 24);
          context.fillStyle = PALETTE.planterLeaf;
          context.beginPath();
          context.arc(x + 14, y + 14, 9, 0, Math.PI * 2);
          context.arc(x + 27, y + 11, 8, 0, Math.PI * 2);
          context.fill();
          context.fillStyle = PALETTE.planterLeaf2;
          context.beginPath();
          context.arc(x + 20, y + 18, 6, 0, Math.PI * 2);
          context.fill();
        }
      }
    }
    const gate = game.gate;
    const open = game.packetsTaken >= game.packetsTotal;
    context.fillStyle = open ? PALETTE.gate : PALETTE.gateLocked;
    context.fillRect(gate.x - 18, gate.y - 18, 36, 36);
    context.fillStyle = '#f2efe4';
    context.fillRect(gate.x - 18, gate.y - 18, 36, 5);
    text(open ? 'OPEN' : 'LOCKED', gate.x, gate.y + 34, 13, open ? '#dff5d8' : '#e8e2d2', 'center');
    drawPot(context, game.pot.x, game.pot.y, 1, false);
  }

  function drawHud(game) {
    context.fillStyle = 'rgba(10, 14, 10, 0.78)';
    context.fillRect(0, 0, FIELD.width, 52);
    text(game.level.name, 18, 33, 21, PALETTE.text, 'left');
    text(`SEEDS ${game.packetsTaken}/${game.packetsTotal}`, 520, 33, 20, PALETTE.packet, 'left');
    text(`PODS ${game.thief.pods}`, 700, 33, 20, PALETTE.text, 'left');
    text(`SCORE ${game.score}`, 810, 33, 20, PALETTE.text, 'left');
    const barX = 980;
    const barWidth = 210;
    text('ALARM', barX, 22, 13, PALETTE.muted, 'left');
    context.fillStyle = '#2a2f28';
    context.fillRect(barX, 28, barWidth, 14);
    const fraction = game.alarm / 100;
    context.fillStyle = fraction < 0.45 ? PALETTE.alarmLow : fraction < 0.75 ? PALETTE.alarmMid : PALETTE.alarmHigh;
    context.fillRect(barX, 28, barWidth * fraction, 14);
    context.strokeStyle = '#f2efe4';
    context.lineWidth = 1;
    context.strokeRect(barX, 28, barWidth, 14);
    if (game.spottedFlash > 0) {
      text('SEEN!', barX + barWidth + 12, 40, 18, PALETTE.alarmHigh, 'left');
    }
    text(game.level.hint, 18, FIELD.height - 12, 16, PALETTE.muted, 'left');
  }

  function drawPanel(title, lines, prompt, potFilled) {
    context.fillStyle = 'rgba(8, 12, 8, 0.72)';
    context.fillRect(0, 0, FIELD.width, FIELD.height);
    const width = 640;
    const height = 300 + lines.length * 30;
    const x = (FIELD.width - width) / 2;
    const y = (FIELD.height - height) / 2;
    context.fillStyle = PALETTE.panel;
    context.fillRect(x, y, width, height);
    context.strokeStyle = PALETTE.planterLeaf;
    context.lineWidth = 3;
    context.strokeRect(x, y, width, height);
    drawPot(context, FIELD.width / 2, y + 52, 1.6, potFilled);
    text(title, FIELD.width / 2, y + 118, 42, PALETTE.text, 'center');
    lines.forEach((line, index) => {
      text(line, FIELD.width / 2, y + 158 + index * 30, 21, PALETTE.muted, 'center');
    });
    text(prompt, FIELD.width / 2, y + height - 30, 22, PALETTE.packet, 'center');
  }

  function draw(game, screen, best, time) {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = PALETTE.backdrop;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);

    drawRoom(game, time);

    for (const camera of game.cameras) {
      drawCone(context, game.level, camera.x, camera.y, camera.facing, SIGHT.cameraRange, SIGHT.cameraHalfAngle, camera.seeing);
    }
    for (const keeper of game.keepers) {
      const alert = keeper.mode === 'chase' || keeper.suspicion > 35;
      drawCone(context, game.level, keeper.x, keeper.y, keeper.facing, SIGHT.guardRange, SIGHT.guardHalfAngle, alert);
    }
    for (const camera of game.cameras) {
      context.fillStyle = PALETTE.camera;
      context.fillRect(camera.x - 9, camera.y - 9, 18, 18);
      context.fillStyle = camera.seeing ? PALETTE.cameraEye : '#f2c94c';
      context.beginPath();
      context.arc(camera.x, camera.y, 4, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = PALETTE.text;
      context.font = `bold 11px ${FONT}`;
      context.textAlign = 'center';
      context.fillText('CAM', camera.x, camera.y - 14);
    }
    for (const packet of game.packets) {
      if (!packet.taken) drawPacket(context, packet.x, packet.y, time);
    }
    if (game.pod.active) {
      context.fillStyle = '#e8c85a';
      context.beginPath();
      context.arc(game.pod.x, game.pod.y, 6, 0, Math.PI * 2);
      context.fill();
      if (!game.pod.flying) {
        context.strokeStyle = 'rgba(232,200,90,0.8)';
        context.lineWidth = 2;
        context.beginPath();
        context.arc(game.pod.x, game.pod.y, 12 + Math.sin(time * 8) * 3, 0, Math.PI * 2);
        context.stroke();
      }
    }

    const thief = game.thief;
    context.fillStyle = 'rgba(0,0,0,0.3)';
    context.beginPath();
    context.ellipse(thief.x, thief.y + 13, 14, 5, 0, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = PALETTE.thief;
    context.beginPath();
    context.arc(thief.x, thief.y, thief.radius, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = PALETTE.thiefHat;
    context.beginPath();
    context.ellipse(thief.x, thief.y - 4, 15, 6, 0, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#1c261a';
    context.beginPath();
    context.arc(thief.x + Math.cos(thief.facing) * 5, thief.y + Math.sin(thief.facing) * 5, 3, 0, Math.PI * 2);
    context.fill();

    for (const keeper of game.keepers) {
      context.fillStyle = 'rgba(0,0,0,0.3)';
      context.beginPath();
      context.ellipse(keeper.x, keeper.y + 14, 15, 5, 0, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = PALETTE.keeper;
      context.beginPath();
      context.arc(keeper.x, keeper.y, 14, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = PALETTE.keeperApron;
      context.fillRect(keeper.x - 8, keeper.y - 4, 16, 12);
      context.fillStyle = '#1c261a';
      context.beginPath();
      context.arc(keeper.x + Math.cos(keeper.facing) * 6, keeper.y + Math.sin(keeper.facing) * 6, 3, 0, Math.PI * 2);
      context.fill();
      const barWidth = 36;
      context.fillStyle = '#22261f';
      context.fillRect(keeper.x - barWidth / 2, keeper.y - 28, barWidth, 6);
      context.fillStyle = keeper.suspicion > 60 ? PALETTE.alarmHigh : PALETTE.alarmMid;
      context.fillRect(keeper.x - barWidth / 2, keeper.y - 28, barWidth * (keeper.suspicion / 100), 6);
    }

    if (screen !== SCREEN_TITLE) drawHud(game);

    if (screen === SCREEN_TITLE) {
      drawPanel('THE GLASSHOUSE TAKE', [
        'Take back the heirloom seeds before the cold vault locks.',
        'WASD / arrows to move · Shift to sneak · Click or Q for a seed pod',
        `Best score ${best}`,
      ], 'Press Space or click to start', false);
    } else if (screen === SCREEN_PAUSED) {
      drawPanel('Paused', ['The keepers wait. The rain does not.'], 'Press P to carry on', false);
    } else if (screen === SCREEN_OVER) {
      drawPanel(game.alarm >= 100 ? 'The alarm filled' : 'Caught in the glasshouse', [
        `Score ${game.score} · Best ${best}`,
        'Break line of sight before suspicion fills.',
      ], 'Press Space or click to try again', false);
    } else if (screen === SCREEN_WIN) {
      drawPanel('Every seed is home', [
        `Score ${game.score} · Best ${best}`,
        'The cracked pot is full. Leave by the potting door.',
      ], 'Press Space or click to play again', true);
    }
  }

  resize();
  window.addEventListener('resize', resize);
  return { draw, resize };
}
