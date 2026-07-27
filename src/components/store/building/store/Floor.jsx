import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { FLOOR_W, FLOOR_D } from '../../../../config/storeLayout/storeLayoutLv1.js';

/** Floor + faint checkerboard tile lines. */
export function Floor({ onFloorClick }) {
  const lines = useMemo(() => {
    const position = [];
    for (let i = -FLOOR_W / 2; i <= FLOOR_W / 2; i += 1.5) {
      if(i < 8 && i> -8){
        position.push({ axis: 'x', i });
      }
      if(i < 10){
        position.push({ axis: 'z', i });
      }
    }
    return position; 
  }, []);
  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        position={[-4.5,0,0]}
        onClick={onFloorClick}
      >
        <planeGeometry args={[FLOOR_W-3, FLOOR_D]} />
        <meshToonMaterial color={0xe0dbd0} />
      </mesh>
      
      {lines.map(({ axis, i }, idx) => (
        <mesh
          key={idx}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[axis === 'z' ? i : 0 -3.75, 0.001, axis === 'x' ? i : 0]}
        >
          <planeGeometry args={[axis === 'x' ? FLOOR_W -4.5 : 0.05, axis === 'z' ? FLOOR_D - 4.95 : 0.05]} />
          <meshBasicMaterial color={0xccccbb} />
        </mesh>
      ))}
    </group>
  );
}

  
