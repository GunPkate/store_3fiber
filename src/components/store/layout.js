export const ATM3D   = { x:5.5, z:2.5 };
export const POS3D   = { x:-1.2, z:2.3 };
export const EXIT3D  = { x:0, z:7.5 };
export const SPAWN3D = { x:0, z:6.8 };
export const BREAK3D = { x:5.7, z:1 };
export const STOCK3D = { x:-5.8, z:-3.5 };
export const WAIT3D  = { x:6, z:2 };
export const OBS3D=[
  // shelves 
  // row 1 (left column)
  {x:-5.5,z:-3.5,hw:.9,hd:.25,label:'Shelf Cola/Water'},
  {x:-5.5,z:-2,  hw:.9,hd:.25,label:'Shelf Snacks'},
  {x:-5.5,z:-.5, hw:.9,hd:.25,label:'Shelf Candy'},
  // row 2 (centre column)
  {x:-1,  z:-3.5,hw:.9,hd:.25,label:'Shelf Juice'},
  {x:-1,  z:-2,  hw:.9,hd:.25,label:'Shelf Chips'},
  {x:-1,  z:-.5, hw:.9,hd:.25,label:'Shelf Cookies'},
  // row 3 (right column)
  {x:3.5, z:-3.5,hw:.9,hd:.25,label:'Shelf Soap'},
  {x:3.5, z:-2,  hw:.9,hd:.25,label:'Shelf Shampoo'},
  {x:3.5, z:-.5, hw:.9,hd:.25,label:'Shelf Misc'},
  // fridges
  {x:6.8,z:-3.5, hw:.35,hd:.7,label:'Fridge 1'},
  {x:6.8,z:-1.5, hw:.35,hd:.7,label:'Fridge 2'},
  // POS counter
  {x:0,  z:3.5,  hw:2,hd:.4, label:'POS Counter'},
  // ATM
  {x:5.5,z:3.5,  hw:.3,hd:.4,label:'ATM'},
  // stock room back-left
  {x:-7, z:-4.5, hw:.8,hd:1, label:'Stock Room'},
  // break room back-right
  {x:6.5,z:1.5,  hw:.8,hd:.7,label:'Break Room'},
  // outer walls
  {x:0,  z:-6.1, hw:8.5,hd:.15,label:'Back Wall'},
  {x:-8.1,z:0,   hw:.15,hd:6.5,label:'Left Wall'},
  {x:8.1, z:0,   hw:.15,hd:6.5,label:'Right Wall'},
];
export const SHELF3D = OBS3D.filter(o => o.label.startsWith('Shelf')).map(o => ({ x:o.x, z:o.z+.5 }));