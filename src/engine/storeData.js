// ══════════════════════════════════════════════════════════
// STORE LAYOUT DATA — pure data, no Three.js / React dependency
// Store floor: 16 × 12, centred at origin. Units ≈ metres.
// ══════════════════════════════════════════════════════════

export const FLOOR_W = 20;
export const FLOOR_D = 16;

/**
 * Obstacle rectangles used for collision + waypoint generation.
 * x,z = centre, hw = half-width (x axis), hd = half-depth (z axis).
 */
export const OBS3D = [
  // shelves row 1 (left column)
  { x: -5.5, z: -3.5, hw: 0.9, hd: 0.25, label: 'Shelf Cola/Water' },
  { x: -5.5, z: -2, hw: 0.9, hd: 0.25, label: 'Shelf Snacks' },
  { x: -5.5, z: -0.5, hw: 0.9, hd: 0.25, label: 'Shelf Candy' },
  // row 2 (centre column)
  { x: -1, z: -3.5, hw: 0.9, hd: 0.25, label: 'Shelf Juice' },
  { x: -1, z: -2, hw: 0.9, hd: 0.25, label: 'Shelf Chips' },
  { x: -1, z: -0.5, hw: 0.9, hd: 0.25, label: 'Shelf Cookies' },
  // row 3 (right column)
  { x: 3.5, z: -3.5, hw: 0.9, hd: 0.25, label: 'Shelf Soap' },
  { x: 3.5, z: -2, hw: 0.9, hd: 0.25, label: 'Shelf Shampoo' },
  { x: 3.5, z: -0.5, hw: 0.9, hd: 0.25, label: 'Shelf Misc' },
  // fridges
  { x: 6.8, z: -3.5, hw: 0.35, hd: 0.7, label: 'Fridge 1' },
  { x: 6.8, z: -1.5, hw: 0.35, hd: 0.7, label: 'Fridge 2' },
  // POS counter
  { x: 0, z: 3.5, hw: 2, hd: 0.4, label: 'POS Counter' },
  // ATM
  { x: 5.5, z: 3.5, hw: 0.3, hd: 0.4, label: 'ATM' },
  // stock room back-left
  { x: -7, z: -4.5, hw: 0.8, hd: 1, label: 'Stock Room' },
  // break room back-right
  { x: 6.5, z: 1.5, hw: 0.8, hd: 0.7, label: 'Break Room' },
  // outer walls
  { x: 0, z: -6.1, hw: 8.5, hd: 0.15, label: 'Back Wall' },
  { x: -8.1, z: 0, hw: 0.15, hd: 6.5, label: 'Left Wall' },
  { x: 8.1, z: 0, hw: 0.15, hd: 6.5, label: 'Right Wall' },
];

export function inObs(px, pz, margin = 0.25) {
  for (const o of OBS3D) {
    if (
      px >= o.x - o.hw - margin &&
      px <= o.x + o.hw + margin &&
      pz >= o.z - o.hd - margin &&
      pz <= o.z + o.hd + margin
    )
      return true;
  }
  return false;
}

/** Fresh copy of shelf-item stock data (call once per engine instance). */
export function createItems() {
  return [
    { shelfIdx: 0, name: 'Cola', price: 1.5, maxQty: 20, qty: 20 },
    { shelfIdx: 1, name: 'Snacks', price: 2.5, maxQty: 20, qty: 20 },
    { shelfIdx: 2, name: 'Candy', price: 1.0, maxQty: 20, qty: 20 },
    { shelfIdx: 3, name: 'Juice', price: 2.0, maxQty: 20, qty: 20 },
    { shelfIdx: 4, name: 'Chips', price: 2.5, maxQty: 20, qty: 20 },
    { shelfIdx: 5, name: 'Cookies', price: 3.0, maxQty: 20, qty: 20 },
    { shelfIdx: 6, name: 'Soap', price: 3.5, maxQty: 20, qty: 20 },
    { shelfIdx: 7, name: 'Shampoo', price: 4.0, maxQty: 20, qty: 20 },
    { shelfIdx: 8, name: 'Misc', price: 1.0, maxQty: 20, qty: 20 },
  ];
}

const posO = OBS3D.find((o) => o.label === 'POS Counter');
const atmO = OBS3D.find((o) => o.label === 'ATM');
const stkO = OBS3D.find((o) => o.label === 'Stock Room');
const brkO = OBS3D.find((o) => o.label === 'Break Room');

// Shelf centre positions (3D) — the "browsing" point just in front of each shelf
export const SHELF3D = OBS3D.filter((o) => o.label.startsWith('Shelf')).map((o) => ({
  x: o.x,
  z: o.z + 0.5,
}));
export const ATM3D = { x: atmO.x, z: atmO.z - 1 };
export const POS3D = { x: posO.x, z: posO.z - 1.2 };
export const EXIT3D = { x: 0, z: 7.5 };
export const SPAWN3D = { x: 0, z: 6.8 };
export const BREAK3D = { x: brkO.x, z: brkO.z - 0.5 };
export const STOCK3D = { x: stkO.x + 1.2, z: stkO.z + 1.5 };
export const WAIT3D = { x: 6, z: 2 };

export const POS_OBSTACLE = posO;
export const ATM_OBSTACLE = atmO;
export const STOCK_OBSTACLE = stkO;
export const BREAK_OBSTACLE = brkO;
