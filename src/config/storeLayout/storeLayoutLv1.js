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
      {x:-9 ,z: 7.5},
    ],
    posEnd:[
      {x:-12 ,z: -2.5},
      {x:-12 ,z: 7.5}
    ] 
  },
  { row:5,
    posStart: [ 
      {x:-9 ,z: -2.5},
      {x:-9 ,z: 7.5},
    ],
    posEnd:[
      {x:-12 ,z: -2.5},
      {x:-12 ,z: 7.5}
    ] 
  },
  { row:6,
    posStart: [ 
      {x:6 ,z: 4.5},
      {x:6 ,z: 7.5},
    ],
    posEnd:[
      {x:7 ,z: 4.5},
      {x:7 ,z: 7.5}
    ] 
  },
]

export const FORBIDDEN_AREA = [
  { row:1,
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

  { x: -2.75, z: -3.5, hw: 0.9, hd: 0.25, row:"A", id:1, colorOuterFrame: "#201b1b", side:"back", objType: 'Shelf' },
  { x: -2.75, z: -1.5, hw: 0.9, hd: 0.25, row:"A", id:2, colorOuterFrame: "#201b1b", side: "front", objType: 'Shelf' },
  { x: -2.75, z: -0.5, hw: 0.9, hd: 0.25, row:"A", id:3, colorOuterFrame: "#201b1b", side:"back", objType: 'Shelf' },

  { x: -1, z: -3.5, hw: 0.9, hd: 0.25, row:"B", id:1, colorOuterFrame: "#201b1b",  side:"back", objType: 'Shelf' },
  { x: -1, z: -1.5, hw: 0.9, hd: 0.25, row:"B", id:2, colorOuterFrame: "#201b1b", side: "front", objType: 'Shelf' },
  { x: -1, z: -0.5, hw: 0.9, hd: 0.25, row:"B", id:3, colorOuterFrame: "#201b1b",  side:"back", objType: 'Shelf' },

  { x: .75, z: -3.5, hw: 0.9, hd: 0.25, row:"C", id:1, colorOuterFrame: "#201b1b", side:"back", objType: 'Shelf' },
  { x: .75, z: -1.5, hw: 0.9, hd: 0.25, row:"C", id:2, colorOuterFrame: "#201b1b", side: "front", objType: 'Shelf' },
  { x: .75, z: -0.5, hw: 0.9, hd: 0.25, row:"C", id:3, colorOuterFrame: "#201b1b", side:"back", objType: 'Shelf' },
  // fridges

  { x:-10.5, y:1, z:3.5, hw:1.35, hh:2, hd:.15, colorOuterFrame: "#201b1b", colorRack: "#adadad", colorGlass: "#a9e7f4", side:"right", objType: 'Fridge' },
  { x:-10.5, y:1, z:1.5, hw:1.35, hh:2, hd:.15, colorOuterFrame: "#201b1b", colorRack: "#adadad", colorGlass: "#a9e7f4", side:"right", objType: 'Fridge' },
  { x:-10.5, y:1, z:-0.5, hw:1.35, hh:2, hd:.15, colorOuterFrame: "#201b1b", colorRack: "#adadad", colorGlass: "#a9e7f4", side:"right", objType: 'Fridge' },

  // POS counter
  { x: 0, z: 3.5, hw: 2, hd: 0.4, objType: 'POS' },
  // ATM
  { x: 6.5, z: 6, hw: 0.3, hd: 0.4, objType: 'ATM' },
  // stock room
  { x: -16, z: 4.5, hw: 0.8, hd: 1, side:"left", objType: 'Stock' },
  // break room back-right
  { x: 6.5, z: 1.5, hw: 0.8, hd: 0.7, objType: 'Break' },
  // outer walls
  { x: 0, z: -6.1, hw: 8.5, hd: 0.15, objType: 'Back Wall' },
  { x: -8.1, z: 0, hw: 0.15, hd: 6.5, objType: 'Left Wall' },
  { x: 8.1, z: 0, hw: 0.15, hd: 6.5, objType: 'Right Wall' },
];

export function inObs(pointX, pointZ, margin = 0.25) {
  for (const obstacle of OBJECT_3D) {
    if (
      pointX >= obstacle.x - obstacle.hw - margin &&
      pointX <= obstacle.x + obstacle.hw + margin &&
      pointZ >= obstacle.z - obstacle.hd - margin &&
      pointZ <= obstacle.z + obstacle.hd + margin
    )
      return true;
  }
  return false;
}

/** Fresh copy of shelf-item stock data (call once per engine instance). */

const posObstacle = OBJECT_3D.find((obj) => obj.objType === 'POS');
const atmObstacle = OBJECT_3D.find((obj) => obj.objType === 'ATM');
const stockObstacle = OBJECT_3D.find((obj) => obj.objType === 'Stock');
const breakObstacle = OBJECT_3D.find((obj) => obj.objType === 'Break');
const fridgeObstacle = OBJECT_3D.find((obj) => obj.objType === 'Fridge');

// Shelf centre positions (3D) — the "browsing" point just in front of each shelf
export const SHELF3D = OBJECT_3D.filter((obj) => obj.objType.startsWith('Shelf')).map((shelf) => ({
  x: shelf.x,
  z: shelf.side=="front"? shelf.z-.5: shelf.z+.5,
  side: shelf.side
}));
export const FRIDGE3D = OBJECT_3D.filter((obj) => obj.objType.startsWith('Fridge')).map((fridge) => ({
  x: fridge.side == "right" ? fridge.x +1.05 : fridge.x -1.05,
  z: fridge.z,
  side: fridge.side
}));

export const ATM3D = { x: atmObstacle.x, z: atmObstacle.z - 1 };
export const POS3D = { x: posObstacle.x, z: posObstacle.z - 1.2 };
export const EXIT3D = { x: 0, z: 7.5 };
export const SPAWN3D = { x: 0, z: 6.8 };
export const BREAK3D = { x: breakObstacle.x, z: breakObstacle.z - 0.5 };
export const STOCK3D = { x: stockObstacle.x + 1.2, z: stockObstacle.z + 1.5 };
export const WAIT3D = { x: 6, z: 2 };

export const POS_OBSTACLE = posObstacle;
export const ATM_OBSTACLE = atmObstacle;
export const STOCK_OBSTACLE = stockObstacle;
export const BREAK_OBSTACLE = breakObstacle;