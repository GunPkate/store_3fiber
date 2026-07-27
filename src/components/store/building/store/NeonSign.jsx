import { useFrame } from "@react-three/fiber";
import { Box } from "../sharedmesh/Box";
import { useMemo, useRef } from 'react';

/** Neon sign above the entrance, with a gentle flicker animation. */
export function NeonSign() {
  const lightRefs = useRef([]);
  const t = useRef(0);
  useFrame((_, dt) => {
    t.current += dt;
    lightRefs.current.forEach((l, i) => {
      if (l) l.intensity = 0.4 + Math.sin(t.current * 4 + i) * 0.25 + 0.35;
    });
  });
  const pieces = [
    [1.2, 0.08, -0.6, 5.4, '#ff2288'],
    [1.2, 0.08, 0.6, 5.4, '#22ccff'],
    [0.08, 0.4, -0.3, 5.15, '#ff2288'],
    [0.08, 0.4, 0.3, 5.15, '#22ccff'],
    [0.6, 0.08, 0, 5.0, '#ff2288'],
  ];
  return (
    <group>
      <Box w={3.5} h={0.8} d={0.1} color={0x111122} x={0} y={5.3} z={-5.9} />
      {pieces.map(([w, h, x, y, color], i) => (
        <group key={i}>
          <mesh position={[x, y, -5.85]}>
            <boxGeometry args={[w, h, 0.05]} />
            <meshBasicMaterial color={color} />
          </mesh>
          <pointLight
            ref={(r) => (lightRefs.current[i] = r)}
            position={[x, y, -5.7]}
            color={color}
            intensity={0.5}
            distance={1}
            shadow-camera-near={0.05}
            shadow-camera-far={1}
            shadow-bias={-0.001}
          />
        </group>
      ))}
    </group>
  );
}