import { useMemo } from "react";
import { FLOOR_D, FLOOR_W, OBJECT_3D, ATM_OBSTACLE } from "../../config/storeLayout/storeLayoutLv1";

export default function StoreModel() {
  const shelfObs = OBJECT_3D.filter((o) => o.label.startsWith('Shelf'));
  const fridgeObs = OBJECT_3D.filter((o) => o.label.startsWith('Fridge'));

  function Floor({ onFloorClick }) {
    const lines = useMemo(() => {
      const position = [];
      for (let i = -FLOOR_W / 2; i <= FLOOR_W / 2; i += 1.5) {
        position.push({ axis: 'x', i });
        position.push({ axis: 'z', i });
      }
      return position; 
    }, []);

    return (
      <group>
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
          // onClick={onFloorClick}
        >
          <planeGeometry args={[FLOOR_W, FLOOR_D]} />
          <meshLambertMaterial color={0xe0dbd0} />
        </mesh>
        {lines.map(({ axis, i }, idx) => (
          <mesh
            key={idx}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[axis === 'z' ? i : 0, 0.001, axis === 'x' ? i : 0]}
          >
            <planeGeometry args={[axis === 'x' ? FLOOR_W : 0.05, axis === 'z' ? FLOOR_D : 0.05]} />
            <meshBasicMaterial color={0xccccbb} />
          </mesh>
        ))}
      </group>
    );
  }

  function Box({ w, h, d, color, x, y, z, ry = 0, cast = true, recv = true, opacity = 1, emissive }) {
  return (
    <mesh position={[x, y, z]} rotation={[0, ry, 0]} castShadow={cast} receiveShadow={recv}>
      <boxGeometry args={[w, h, d]} />
      <meshLambertMaterial color={color} transparent={opacity < 1} opacity={opacity} emissive={emissive} />
    </mesh>
  );
}

  function Walls() {
    return (
      <group>

        <Box w={FLOOR_W} h={0.1} d={12} color={0xf0ede5} x={0} y={3} z={-6} cast={false} />
        <Box w={0.1} h={6} d={FLOOR_D} color={0xf0ede5} x={-8} y={3} z={0} cast={false} />
        <Box w={0.1} h={6} d={FLOOR_D} color={0xf0ede5} x={8} y={3} z={0} cast={false} />
        <Box w={FLOOR_W} h={0.1} d={6.4} color={0xf0ede5} x={0} y={6} z={0} cast={false} recv={false} />

        <Box w={FLOOR_W} h={6} d={0.2} color={0xf5f2ea} x={0} y={3} z={-6} />
        <Box w={0.2} h={6} d={FLOOR_D} color={0xf0ede5} x={-8} y={3} z={0} />
        <Box w={0.2} h={6} d={FLOOR_D} color={0xf0ede5} x={8} y={3} z={0} />
        <Box w={FLOOR_W} h={0.15} d={FLOOR_D} color={0xfafafa} x={0} y={6} z={0} cast={false} />
      </group>
    );
  }

  function ShelfUnit({ o }) {
    return (
      <group>
        <Box w={o.hw * 2} h={2.2} d={0.08} color={0x999999} x={o.x} y={1.1} z={o.z} />
        {[0, 1, 2].map((i) => (
          <Box key={i} w={o.hw * 2} h={0.06} d={0.45} color={0x8b6914} x={o.x} y={0.35 + i * 0.72} z={o.z + 0.15} />
        ))}
        {[-1, 1].map((s) => (
          <Box key={s} w={0.06} h={2.2} d={0.45} color={0x8b6914} x={o.x + s * (o.hw - 0.03)} y={1.1} z={o.z + 0.15} />
        ))}
      </group>
    );
  }


  function Fridge({ o }) {
    return (
      <group>
        <Box w={o.hw * 2} h={3.2} d={o.hd * 2} color={0x444466} x={o.x} y={1.6} z={o.z}/>
        <mesh position={[o.x, 1.6, o.z + o.hd + 0.05]}>
          <boxGeometry args={[o.hw * 2, 3.0, 0.05]} />
          <meshPhongMaterial color={0x88eeff} transparent opacity={0.35} shininess={120} />
        </mesh>
        <pointLight position={[o.x, 2.5, o.z]} color={0x88ddff} intensity={0.7} distance={2} />
      </group>
    );
  }

  function Atm({ atmObstacle }) {
  return (
    <group>
      <Box w={atmObstacle.hw * 2} h={1.8} d={atmObstacle.hd * 2} color={0x222222} x={atmObstacle.x} y={0.9} z={atmObstacle.z} />
      <mesh position={[atmObstacle.x, 1.2, atmObstacle.z - atmObstacle.hd - 0.02]}>
        <boxGeometry args={[0.5, 0.3, 0.02]} />
        <meshBasicMaterial color={0x2255ff} />
      </mesh>
    </group>
  );
}

  return(<group>
    <Floor/>
    <Walls/>
    {shelfObs.map((o, i) => (
        <ShelfUnit key={i} o={o} />
    ))}
    {fridgeObs.map((o, i) => (
        <Fridge key={i} o={o} />
    ))}
    <Atm atmObstacle={ATM_OBSTACLE} />
  </group>)
}