// Boot and the one loop: input is read every frame, the world
// advances in fixed 1/60 s steps, and the renderer paints what is
// there. Screens: title, play, paused, caught (over) and win.
// ?shot=cover|title|chase|win stages one scene for a screenshot and
// sets window.__shotReady once it has painted twice.

import { BEST_KEY, FIELD, STEP } from './config.js';
import { createGame, EVENT_ALARM, EVENT_CAUGHT, EVENT_PACKET, EVENT_POD, EVENT_SPOTTED, EVENT_WIN } from './world.js';
import { ACTION_CONFIRM, ACTION_MUTE, ACTION_PAUSE, ACTION_POD, ACTION_RESTART, createInput } from './input.js';
import { createRenderer, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './render.js';
import { createSound } from './sound.js';
import { stageShot } from './shots.js';

const MAX_FRAME = 0.25;
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const game = createGame();
const renderer = createRenderer(canvas);
const sound = createSound();

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off: the best score then lasts this visit only.
  }
}

function roomPoint(click) {
  const rect = canvas.getBoundingClientRect();
  const scale = Math.min(rect.width / FIELD.width, rect.height / FIELD.height);
  const offsetX = (rect.width - FIELD.width * scale) / 2;
  const offsetY = (rect.height - FIELD.height * scale) / 2;
  return { x: (click.x - offsetX) / scale, y: (click.y - offsetY) / scale };
}

if (shot) {
  const scene = stageShot(shot, game);
  let painted = 0;
  function paint() {
    renderer.draw(game.state, scene.screen, scene.best, 1.2);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
} else {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();
  let time = 0;

  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    game.reset();
    accumulator = 0;
    screen = SCREEN_PLAY;
    announce('Playing. Collect every seed packet, then reach the green gate.');
  }

  function endRun(won) {
    screen = won ? SCREEN_WIN : SCREEN_OVER;
    if (game.state.score > best) {
      best = game.state.score;
      saveBest(best);
    }
    announce(won ? `Every seed is home. Score ${game.state.score}.` : `Run over. Score ${game.state.score}.`);
  }

  function frame(now) {
    requestAnimationFrame(frame);
    const elapsed = Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    time += elapsed;
    const actions = input.takeActions();
    const click = input.takeClick();
    const wasPlaying = screen === SCREEN_PLAY;

    if (actions & ACTION_MUTE) sound.toggleMute();
    if (actions & ACTION_RESTART && (screen === SCREEN_PLAY || screen === SCREEN_OVER || screen === SCREEN_WIN)) {
      startGame();
    }
    if (actions & ACTION_CONFIRM && (screen === SCREEN_TITLE || screen === SCREEN_OVER || screen === SCREEN_WIN)) {
      startGame();
    } else if (actions & ACTION_PAUSE && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    } else if (actions & (ACTION_PAUSE | ACTION_CONFIRM) && screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
      announce('Playing.');
    }

    if (screen === SCREEN_PLAY) {
      accumulator += elapsed;
      while (accumulator >= STEP) {
        accumulator -= STEP;
        const move = input.direction();
        let throwAt = null;
        if (wasPlaying && ((actions & ACTION_POD) || click)) {
          if (click) throwAt = roomPoint(click);
          else throwAt = { x: game.state.thief.x + Math.cos(game.state.thief.facing) * 160, y: game.state.thief.y + Math.sin(game.state.thief.facing) * 160 };
        }
        const events = game.step(STEP, move.x, move.y, move.sneak, throwAt);
        if (events & EVENT_PACKET) sound.packet();
        if (events & EVENT_POD) sound.pod();
        if (events & EVENT_SPOTTED) sound.spotted();
        if (events & EVENT_CAUGHT || events & EVENT_ALARM) {
          sound.caught();
          endRun(false);
        } else if (events & EVENT_WIN) {
          sound.win();
          endRun(true);
        }
        // A pod throw is a one-shot: only the first step of this frame uses it.
        if (throwAt) break;
      }
    }
    renderer.draw(game.state, screen, best, time);
  }

  announce('The Glasshouse Take. Press Space or click to start.');
  requestAnimationFrame(frame);
}
