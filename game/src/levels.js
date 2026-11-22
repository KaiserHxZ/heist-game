// The three rooms, drawn as text maps. One character is one 40px tile.
//   # wall / glasshouse frame (blocks movement and sight)
//   . soil floor (quiet, normal speed)
//   g gravel path (fast, loud: suspicion rises faster there)
//   B potting bench (blocks movement and sight: cover)
//   T tall planter / trellis (blocks movement and sight: cover)
//   L seed packet (loot)
//   E the green gate (exit; locked until every packet is taken)
//   P Fen's starting corner, beside the cracked pot
//   G a groundskeeper's patrol start
// Guards carry a patrol: a list of tile waypoints they walk in a loop.
// Cameras are fixed to the frame with a sweep centre and swing.

export const LEVELS = [
  {
    name: 'Room 1 — The Potting Shed',
    hint: 'Benches hide you. Gravel hurries you, and gives you away.',
    map: [
      '################################',
      '#P....g....B....g......L.......#',
      '#.....g....B....g..............#',
      '#..B..g....B....g...T..T.......#',
      '#..B.......B........T..T..G....#',
      '#..B..g....B....g...T..T.......#',
      '#.....g....B....g..............#',
      '#..T..g.........g......B.......#',
      '#..T..g....L....g......B..L....#',
      '#..T..g.........g......B.......#',
      '#.....g....B....g..............#',
      '#..B..g....B....g...T..T.......#',
      '#..B.......B........T..T.......#',
      '#..B..g....B....g...T..T..G....#',
      '#.....g....B....g..............#',
      '#..L..g.........g......E.......#',
      '#..............................#',
      '################################',
    ],
    guards: [
      { col: 27, row: 4, patrol: [[27, 4], [27, 13], [20, 13], [20, 4]], speed: 78 },
      { col: 6, row: 10, patrol: [[6, 10], [14, 10], [14, 15], [6, 15]], speed: 66 },
    ],
    cameras: [
      { col: 16, row: 1, centre: Math.PI / 2, swing: 0.85, speed: 0.55 },
      { col: 29, row: 8, centre: Math.PI, swing: 0.7, speed: 0.7 },
    ],
  },
  {
    name: 'Room 2 — The Tomato Rows',
    hint: 'Trellises are walls you can read through. Pods pull a keeper away.',
    map: [
      '################################',
      '#P.g.....T....T....T....L......#',
      '#..g.....T....T....T...........#',
      '#..g..B..T....T....T..B..G.....#',
      '#..g..B.......g.......B........#',
      '#.....B...L...g...L...B........#',
      '#..g..B.......g.......B..T.....#',
      '#..g.....T....T....T..B..T.....#',
      '#..g.....T....T....T.....T.....#',
      '#.....B.......g.......B........#',
      '#..L..B...g...L...g...B..L.....#',
      '#..g..B...g.......g...B........#',
      '#..g.....T....T....T.....G.....#',
      '#..g.....T....T....T..B........#',
      '#..g..B.......g.......B........#',
      '#.....B....L..g....L..B..E.....#',
      '#..............................#',
      '################################',
    ],
    guards: [
      { col: 26, row: 3, patrol: [[26, 3], [26, 12], [17, 12], [17, 3]], speed: 88 },
      { col: 12, row: 12, patrol: [[12, 12], [5, 12], [5, 5], [12, 5]], speed: 80 },
      { col: 22, row: 15, patrol: [[22, 15], [28, 15], [28, 8]], speed: 72 },
    ],
    cameras: [
      { col: 1, row: 1, centre: 0.6, swing: 0.9, speed: 0.6 },
      { col: 16, row: 1, centre: Math.PI / 2, swing: 0.8, speed: 0.8 },
      { col: 30, row: 16, centre: -Math.PI / 2, swing: 0.8, speed: 0.5 },
    ],
  },
  {
    name: 'Room 3 — The Cold Vault',
    hint: 'The vault keeper walks slow and sees far. Take the last packets together.',
    map: [
      '################################',
      '#P....B.....g......B....L......#',
      '#.....B.....g......B...........#',
      '#..T..B..L..g..L...B..T..G.....#',
      '#..T........g.........T........#',
      '#..T..g....BgB....g..T.........#',
      '#.....g....B.B....g............#',
      '#..B..g....BgB....g...B..L.....#',
      '#..B.......g.......B...........#',
      '#..B..g....g......g..B..T......#',
      '#.....g....B......g..B..T......#',
      '#..L..g....B..L...g..B.........#',
      '#..T.......B......g.....G......#',
      '#..T..g....B......g..T.........#',
      '#.....g....B......g..T.........#',
      '#..L..g....B......g.....E......#',
      '#..............................#',
      '################################',
    ],
    guards: [
      { col: 27, row: 3, patrol: [[27, 3], [27, 12], [18, 12], [18, 3]], speed: 96 },
      { col: 8, row: 12, patrol: [[8, 12], [8, 4], [15, 4], [15, 12]], speed: 84 },
      { col: 24, row: 9, patrol: [[24, 9], [10, 9]], speed: 90 },
    ],
    cameras: [
      { col: 16, row: 1, centre: Math.PI / 2, swing: 1.0, speed: 0.9 },
      { col: 1, row: 9, centre: 0, swing: 0.75, speed: 0.65 },
      { col: 30, row: 9, centre: Math.PI, swing: 0.75, speed: 0.65 },
      { col: 16, row: 16, centre: -Math.PI / 2, swing: 0.9, speed: 0.75 },
    ],
  },
];

export function tileAt(level, col, row) {
  if (col < 0 || row < 0 || col >= COLS || row >= ROWS) return '#';
  return level.map[row][col];
}

import { COLS, ROWS } from './config.js';

export function blocksSight(level, col, row) {
  const tile = tileAt(level, col, row);
  return tile === '#' || tile === 'B' || tile === 'T';
}

export function blocksMove(level, col, row) {
  const tile = tileAt(level, col, row);
  return tile === '#' || tile === 'B' || tile === 'T';
}

export function findTiles(level, wanted) {
  const found = [];
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      if (level.map[row][col] === wanted) found.push({ col, row });
    }
  }
  return found;
}
