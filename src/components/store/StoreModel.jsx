import { useMemo } from "react";
import { FLOOR_D, FLOOR_W } from "../../config/storeLayout/storeLayoutLv1";

export default function StoreModel() {
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

  return(<>
    <Floor/>
  </>)
}