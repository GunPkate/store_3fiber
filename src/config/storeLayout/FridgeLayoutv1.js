export const FRIDGELAYOUT = [
  { label: 'Cola', 
    color:"#ded2ad",
    details: // x =row size, z = stack (cookies x: -1, z: -0.5)
      {
        start: { x: -10.5, y: 1.175, z: 3.35},
        size: { hw: .10, hh:.28, hd: .1},
        distanceInRow: { x: -.15, z: .2},
        distanceBetweenShelf: { y: -.75} 
      },
    rowSize: 10,
    rowStack: 1,
    shelfRow: 2
  },
  { label: 'Juice', 
    color:"#ded2ad",
    details: // x =row size, z = stack (cookies x: -1, z: -0.5)
      {
        start: { x: -10.5, y: 1.175, z: 1.35},
        size: { hw: .10, hh:.28, hd: .1},
        distanceInRow: { x: -.15, z: .2},
        distanceBetweenShelf: { y: .75} 
      },
    rowSize: 10,
    rowStack: 1,
    shelfRow: 2
  },
  { label: 'Water', 
    color:"#ded2ad",
    details: // x =row size, z = stack (cookies x: -1, z: -0.5)
      {
        start: { x: -10.5, y: 1.175, z: -0.35},
        size: { hw: .10, hh:.28, hd: .1},
        distanceInRow: { x: -.15, z: .2},
        distanceBetweenShelf: { y: .75} 
      },
    rowSize: 10,
    rowStack: 1,
    shelfRow: 2
  },

]
