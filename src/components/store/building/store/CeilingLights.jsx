/** Floor + faint checkerboard tile lines. */
export function CeilingLights() {
  const positionsXZ = [
    [0, 1],
    [4, 1],
    [-4, 1],
    [0, -3],
    [4, -3],
    [-4, -3],
  ];
  const positionY = 5.9
  return (
    <group>
      {positionsXZ.map(([lx, lz], i) => (
        <group key={i}>
          <mesh position={[lx, positionY, lz]}>
            <boxGeometry args={[0.3, 0.06, 1.6]} />
            <meshBasicMaterial color={0xfffacc} />
          </mesh>
          <pointLight 
            position={[lx, positionY, lz]}
            color={0xfff5e0}
            intensity={1.1}
            distance={8}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-near={0.1}
            shadow-camera-far={2}
          />
          {i ?
            <spotLight
              color={0xffffff}
              intensity={20}
              position={[lx, positionY, lx]}
              penumbra={0.5}
              castShadow
              shadow-mapSize-width={2048}                                 
              shadow-mapSize-height={2048}
            />
            : <></>
          }
        </group>
      ))}
    </group>
  );
}


  
