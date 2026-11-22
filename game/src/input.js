// Keyboard and mouse input. Held keys steer Fen; one-shot presses
// (confirm, pause, restart, mute, pod) are queued as flags and taken
// once by the loop, so a press between frames is never lost. Clicks
// are converted to room coordinates by the caller through the canvas
// rectangle, and a click both confirms a panel and throws a pod when
// the game is running.

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_RESTART = 4;
export const ACTION_MUTE = 8;
export const ACTION_POD = 16;

const UP = new Set(['ArrowUp', 'KeyW']);
const DOWN = new Set(['ArrowDown', 'KeyS']);
const LEFT = new Set(['ArrowLeft', 'KeyA']);
const RIGHT = new Set(['ArrowRight', 'KeyD']);
const SNEAK = new Set(['ShiftLeft', 'ShiftRight']);
const CONFIRM = new Set(['Space', 'Enter']);
const PAUSE = new Set(['KeyP', 'Escape']);
const RESTART = new Set(['KeyR']);
const MUTE = new Set(['KeyM']);
const POD_KEY = new Set(['KeyQ']);

export function createInput(canvas) {
  const held = new Set();
  let actions = 0;
  let clickPoint = null;

  window.addEventListener('keydown', (event) => {
    if (UP.has(event.code) || DOWN.has(event.code) || LEFT.has(event.code) || RIGHT.has(event.code) || SNEAK.has(event.code)) {
      held.add(event.code);
    } else if (CONFIRM.has(event.code)) {
      if (!event.repeat) actions |= ACTION_CONFIRM;
    } else if (PAUSE.has(event.code)) {
      if (!event.repeat) actions |= ACTION_PAUSE;
    } else if (RESTART.has(event.code)) {
      if (!event.repeat) actions |= ACTION_RESTART;
    } else if (MUTE.has(event.code)) {
      if (!event.repeat) actions |= ACTION_MUTE;
    } else if (POD_KEY.has(event.code)) {
      if (!event.repeat) actions |= ACTION_POD;
    } else {
      return;
    }
    event.preventDefault();
  });
  window.addEventListener('keyup', (event) => {
    held.delete(event.code);
  });
  window.addEventListener('blur', () => {
    held.clear();
  });
  canvas.addEventListener('pointerdown', (event) => {
    const rect = canvas.getBoundingClientRect();
    clickPoint = { x: event.clientX - rect.left, y: event.clientY - rect.top, width: rect.width, height: rect.height };
    actions |= ACTION_CONFIRM | ACTION_POD;
  });

  return {
    direction() {
      let x = 0;
      let y = 0;
      for (const code of held) {
        if (LEFT.has(code)) x -= 1;
        if (RIGHT.has(code)) x += 1;
        if (UP.has(code)) y -= 1;
        if (DOWN.has(code)) y += 1;
      }
      return { x, y, sneak: [...held].some((code) => SNEAK.has(code)) };
    },
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    takeClick() {
      const point = clickPoint;
      clickPoint = null;
      return point;
    },
  };
}
