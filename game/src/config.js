// Tuning, colours and sizes for The Glasshouse Take. One place holds
// every number a designer would want to change: speeds, sight ranges,
// suspicion and alarm rates, and the palette that makes cover, danger
// and loot readable at a glance.

export const FIELD = { width: 1280, height: 720 };
export const TILE = 40;
export const COLS = 32;
export const ROWS = 18;

export const STEP = 1 / 60;

export const THIEF = {
  radius: 13,
  walkSpeed: 205,
  sneakSpeed: 105,
  gravelSpeed: 235,
};

export const SIGHT = {
  guardRange: 225,
  guardHalfAngle: 0.56,
  cameraRange: 265,
  cameraHalfAngle: 0.42,
  closeRange: 62,
};

export const SUSPICION = {
  riseSeen: 62,
  riseClose: 130,
  riseCamera: 26,
  decay: 30,
  chaseAt: 100,
  calmAt: 18,
};

export const ALARM = {
  riseChase: 11,
  riseCameraSeen: 15,
  riseSpotted: 5,
  decay: 3.2,
  max: 100,
};

export const PODS = { perLevel: 3, range: 320, lureRadius: 240, rattleSeconds: 3 };

export const SCORE = { packet: 100, levelClear: 250, lowAlarmBonus: 150, timeBonusPerSecond: 4 };

export const PALETTE = {
  backdrop: '#10160f',
  soil: '#4a3826',
  soilDark: '#3d2d1e',
  gravel: '#8a7f6a',
  gravelDot: '#6f6455',
  grass: '#2e4a22',
  wall: '#5d6b73',
  wallTop: '#7d8b93',
  glass: '#a8c8c4',
  bench: '#7a5230',
  benchTop: '#8f6238',
  planter: '#3f6b2f',
  planterLeaf: '#5da244',
  planterLeaf2: '#79bd58',
  thief: '#2fb3a8',
  thiefHat: '#e8c85a',
  keeper: '#d97b2f',
  keeperApron: '#f2e6c8',
  coneCalm: 'rgba(232, 200, 90, 0.20)',
  coneAlert: 'rgba(232, 90, 60, 0.30)',
  camera: '#39434a',
  cameraEye: '#e84a3c',
  packet: '#f2c94c',
  packetSeal: '#c94f32',
  gate: '#3f9e4d',
  gateLocked: '#6b7a6e',
  alarmLow: '#7ac74f',
  alarmMid: '#e8a83c',
  alarmHigh: '#e84a3c',
  panel: '#1c261a',
  text: '#f2efe4',
  muted: '#b8b39f',
  pot: '#b3613a',
  potDark: '#8a4526',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';
export const BEST_KEY = 'glasshouse-take.best';
