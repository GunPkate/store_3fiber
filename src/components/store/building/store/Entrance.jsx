import { Box } from "../sharedmesh/Box";

export function Entrance() {
  return (
    <group>
      {[-1.2, 1.2].map((x) => (
        <Box key={x} w={0.1} h={3} d={0.15} color={0x999999} x={x} y={1.5} z={6} />
      ))}
      <Box w={2.5} h={0.1} d={0.15} color={0x999999} x={0} y={3.05} z={6} />
      <mesh position={[0, 1.4, 5.95]}>
        <boxGeometry args={[2.4, 2.8, 0.04]} />
        <meshPhongMaterial color={0x88ccff} transparent opacity={0.25} shininess={80} />
      </mesh>
    </group>
  );
}
  
