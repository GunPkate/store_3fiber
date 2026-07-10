export const SHELFLAYOUT = [
  { label: 'Cookies', 
    color:"#e07878",
    details: // x =row size, z = stack (cookies x: -1, z: -0.5)
      {
        start: { x: -.35, y:.5, z: -.4}, //dif x .65 dif y .1
        size: { hw: .18, hh:.28, hd: .1},
        distanceInRow: { x: -.25, z: .2},
        distanceBetweenShelf: { y: .75} 
      },
    rowSize: 6,
    rowStack: 2,
    shelfRow: 3
  },
  { label: 'Chips', 
    color:"#f9e247",
    details: // x =row size, z = stack (Chips x: -1, z: -2)
      {
        start: { x: -.35, y:.5, z: -1.9}, //dif x .65 dif y .1
        size: { hw: .18, hh:.28, hd: .1},
        distanceInRow: { x: -.25, z: .2},
        distanceBetweenShelf: { y: .75} 
      },
    rowSize: 6,
    rowStack: 2,
    shelfRow: 3
  }, 
]
