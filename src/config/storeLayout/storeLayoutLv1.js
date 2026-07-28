export const FLOOR_W = 30;
export const FLOOR_D = 20;

/**
 * Obstacle rectangles used for collision + waypoint generation.
 * x,z = centre, hw = half-width (x axis), hd = half-depth (z axis).
 */
export const OBSTACLE_POINTS =[
  { row:1,
    posStart: [ 
      {x:-4 ,z: -3.5},
      {x:-4 ,z: -1.5},
    ],
    posEnd:[
      {x:2 ,z: -3.5},
      {x:2 ,z: -1.5}
    ] 
  },
  { row:2,
    posStart: [ 
      {x:-4 ,z: -0.5},
      {x:-4 ,z: 1.5},
    ],
    posEnd:[
      {x:2 ,z: -0.5},
      {x:2 ,z: 1.5}
    ] 
  },
  { row:3,
    posStart: [
      {x:-4,z:3.5},
      {x:-4,z:5.5}
    ],
    posEnd: [
      {x:2,z:3.5},
      {x:2,z:5.5}
    ]
  },
  { row:4,
    posStart: [ 
      {x:-9 ,z: -2.5},
      {x:-9 ,z: 6.5},
    ],
    posEnd:[
      {x:-12 ,z: -2.5},
      {x:-12 ,z: 6.5}
    ] 
  },
  { row:5,
    posStart: [ 
      {x:-11 ,z: -6.5},
      {x:-11 ,z: 6.5},
    ],
    posEnd:[
      {x:-15 ,z: -6.5},
      {x:-15 ,z: 6.5}
    ] 
  },
]

export const OBJECT_3D = [

  { x: -2.75, z: -3.5, hw: 0.9, hd: 0.25, colorOuterFrame: "#201b1b", side:"back", label: 'Shelf Cola/Water' },
  { x: -2.75, z: -1.5, hw: 0.9, hd: 0.25, colorOuterFrame: "#201b1b", side: "front", label: 'Shelf Snacks' },
  { x: -2.75, z: -0.5, hw: 0.9, hd: 0.25, colorOuterFrame: "#201b1b", side:"back", label: 'Shelf Candy' },

  { x: -1, z: -3.5, hw: 0.9, hd: 0.25, colorOuterFrame: "#201b1b",  side:"back", label: 'Shelf Juice' },
  { x: -1, z: -1.5, hw: 0.9, hd: 0.25, colorOuterFrame: "#201b1b", side: "front", label: 'Shelf Chips' },
  { x: -1, z: -0.5, hw: 0.9, hd: 0.25, colorOuterFrame: "#201b1b",  side:"back", label: 'Shelf Cookies' },

  { x: .75, z: -3.5, hw: 0.9, hd: 0.25, colorOuterFrame: "#201b1b", side:"back", label: 'Shelf Soap' },
  { x: .75, z: -1.5, hw: 0.9, hd: 0.25, colorOuterFrame: "#201b1b", side: "front", label: 'Shelf Shampoo' },
  { x: .75, z: -0.5, hw: 0.9, hd: 0.25, colorOuterFrame: "#201b1b", side:"back", label: 'Shelf Misc' },
  // fridges
  { x: 6.8, z: -3.5, hw: 0.35, hd: 0.7, colorOuterFrame: "#201b1b", side:"back", label: 'Fridge 1' },
  { x: 6.8, z: -1.5, hw: 0.35, hd: 0.7, colorOuterFrame: "#201b1b", side: "front", label: 'Fridge 2' },
  // Drink Fridge

  { x:-10.5, y:1, z:3.5, hw:1.35, hh:2, hd:.15, colorOuterFrame: "#201b1b", colorRack: "#adadad", colorGlass: "#a9e7f4", label: 'Drink 1' },
  { x:-10.5, y:1, z:1.5, hw:1.35, hh:2, hd:.15, colorOuterFrame: "#201b1b", colorRack: "#adadad", colorGlass: "#a9e7f4", label: 'Drink 2' },
  { x:-10.5, y:1, z:-0.5, hw:1.35, hh:2, hd:.15, colorOuterFrame: "#201b1b", colorRack: "#adadad", colorGlass: "#a9e7f4", label: 'Drink 3' },

  // POS counter
  { x: 0, z: 3.5, hw: 2, hd: 0.4, label: 'POS Counter' },
  // ATM
  { x: 5.5, z: 3.5, hw: 0.3, hd: 0.4, label: 'ATM' },
  // stock room back-left
  { x: -14, z: 4.5, hw: 0.8, hd: 1, label: 'Stock Room' },
  // break room back-right
  { x: 6.5, z: 1.5, hw: 0.8, hd: 0.7, label: 'Break Room' },
  // outer walls
  { x: 0, z: -6.1, hw: 8.5, hd: 0.15, label: 'Back Wall' },
  { x: -8.1, z: 0, hw: 0.15, hd: 6.5, label: 'Left Wall' },
  { x: 8.1, z: 0, hw: 0.15, hd: 6.5, label: 'Right Wall' },
];

export function inObs(px, pz, margin = 0.25) {
  for (const o of OBJECT_3D) {
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

const posObstacle = OBJECT_3D.find((o) => o.label === 'POS Counter');
const atmObstacle = OBJECT_3D.find((o) => o.label === 'ATM');
const stkObstacle = OBJECT_3D.find((o) => o.label === 'Stock Room');
const breakObstacle = OBJECT_3D.find((o) => o.label === 'Break Room');

// Shelf centre positions (3D) — the "browsing" point just in front of each shelf
export const SHELF3D = OBJECT_3D.filter((o) => o.label.startsWith('Shelf')).map((o) => ({
  x: o.x,
  z: o.side=="front"? o.z-.5: o.z+.5,
  side: o.side
}));
export const ATM3D = { x: atmObstacle.x, z: atmObstacle.z - 1 };
export const POS3D = { x: posObstacle.x, z: posObstacle.z - 1.2 };
export const EXIT3D = { x: 0, z: 7.5 };
export const SPAWN3D = { x: 0, z: 6.8 };
export const BREAK3D = { x: breakObstacle.x, z: breakObstacle.z - 0.5 };
export const STOCK3D = { x: stkObstacle.x + 1.2, z: stkObstacle.z + 1.5 };
export const WAIT3D = { x: 6, z: 2 };

export const POS_OBSTACLE = posObstacle;
export const ATM_OBSTACLE = atmObstacle;
export const STOCK_OBSTACLE = stkObstacle;
export const BREAK_OBSTACLE = breakObstacle;
