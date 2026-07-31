/** Floor + faint checkerboard tile lines. */
export function CeilingLights() {
  const positionsXZ = [
    [0, 5.9, 1],
    [4, 5.9, 1],
    [-4, 5.9, 1],
    [0, 5.9, -3],
    [4, 5.9, -3],
    [-4, 5.9, -3],
    [-10.5, .8, -1.35],
    [-10.5, .8, 1.75],
  ];

  return (
    <group>
      {positionsXZ.map(([lx, ly, lz], i) => (
        <group key={i}>
          <mesh position={[lx, ly, lz]}>
            <boxGeometry args={[0.3, 0.06, 1.6]} />
            <meshBasicMaterial color={i ==7 || i==6 ? "#75caff" : 0xfffacc} />
          </mesh>
          <pointLight 
            position={[lx, ly, lz]}
            color={i ==7 || i==6 ? "#75caff" : 0xfffacc}
            intensity={.5}
            distance={2}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-near={0.1}
            shadow-camera-far={1}
          />
          {i ?
            <spotLight
              color={i ==7 || i==6 ? "#75caff" : 0xfffacc}
              intensity={5}
              position={[lx, ly, lx]}
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


  
