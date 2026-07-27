import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { FLOOR_W, FLOOR_D } from '../../../../config/storeLayout/storeLayoutLv1.js';

/** Floor + faint checkerboard tile lines. */
export function Walls() {
  return (
    <group>
    <mesh>
      <Box w={0.2} h={6} d={FLOOR_D -5} color={0xf0ede5} x={-16.5} y={3} z={0} cast={false} />
      <Box w={0.2} h={6} d={FLOOR_D -5} color={0xf0ede5} x={-9} y={3} z={0} cast={false} />
      <Box w={0.2} h={6} d={FLOOR_D -5} color={0xf0ede5} x={9} y={3} z={0} cast={false} />
    </mesh>
      
    <mesh position={[-3.75,0,0]}>
      <Box w={FLOOR_W-4.4} h={6} d={0.2} color={0xf5f2ea} x={0} y={3} z={-7.5} />
    </mesh>
    <mesh position={[-3.75,0,15]}>
      {/* <Box w={FLOOR_W-4.4} h={6} d={0.2} color={0xf5f2ea} x={0} y={3} z={-7.5} /> */}
    </mesh>

    <mesh position={[-3.75,0,0]}>
      <Box w={FLOOR_W} h={0.1} d={FLOOR_D} color={0xf0ede5} x={0} y={6} z={0} cast={true} recv={false} />
    </mesh>
      {/* <Box w={FLOOR_W} h={0.15} d={FLOOR_D} color={0xfafafa} x={0} y={6+.1} z={0} cast={true} /> */}
    </group>
  );
}

function Box({ w, h, d, color, x, y, z, ry = 0, cast = true, recv = true, opacity = 1, emissive }) {
  return (
    <mesh position={[x, y, z]} rotation={[0, ry, 0]} castShadow={cast} receiveShadow={recv}>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial 
        color={color} 
        transparent={opacity < 1} 
        opacity={opacity} 
        emissive={emissive}
      />
    </mesh>
  );
}

  
