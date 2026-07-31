export const FRIDGELAYOUT = [
  { label: 'Cola', 
    color:"#f63939",
    details: // x =row size, z = stack (cookies x: -1, z: -0.5)
      {
        start: { x: -10, y: 0.295, z: 1.75},
        size: { hw: .10, hh:.28, hd: .1},
        distanceInRow: { x: -.15, z: .2},
        distanceBetweenShelf: { y: +.925} 
      },
    rowSize: 8,
    rowStack: 8,
    shelfRow: 2
  },
  { label: 'Juice', 
    color:"#ded2ad",
    details: // x =row size, z = stack (cookies x: -1, z: -0.5)
      {
        start: { x: -10, y: 0.295, z: -0.25},
        size: { hw: .10, hh:.28, hd: .1},
        distanceInRow: { x: -.15, z: .2},
        distanceBetweenShelf: { y: +.925} 
      },
    rowSize: 8,
    rowStack: 8,
    shelfRow: 2
  },
  // { label: 'Water', 
  //   color:"#ded2ad",
  //   details: // x =row size, z = stack (cookies x: -1, z: -0.5)
  //     {
        // start: { x: -10, y: 0.295, z: -2.25},
  //       size: { hw: .10, hh:.28, hd: .1},
  //       distanceInRow: { x: -.15, z: .2},
  //       distanceBetweenShelf: { y: +.925} 
  //     },
  //   rowSize: 8,
  //   rowStack: 8,
  //   shelfRow: 2
  // },

]
