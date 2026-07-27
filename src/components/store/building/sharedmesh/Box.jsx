export function Box({ w, h, d, color, x, y, z, ry = 0, cast = true, recv = true, opacity = 1, emissive }) {
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

  
