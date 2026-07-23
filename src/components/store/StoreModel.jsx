import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { FLOOR_W, FLOOR_D, OBJECT_3D, POS_OBSTACLE, ATM_OBSTACLE, STOCK_OBSTACLE, BREAK_OBSTACLE } from '../../config/storeLayout/storeLayoutLv1.js';
import { simulationEngine, useUIStore } from '../../service/state/uiState'
import { Html } from '@react-three/drei';
import ShelfItems from './products/ShelfItems.jsx';
import { SHELFLAYOUT } from '../../config/storeLayout/ShelfLayoutLv1.js';

  /** Floor + faint checkerboard tile lines. */
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
          onClick={onFloorClick}
        >
          <planeGeometry args={[FLOOR_W, FLOOR_D]} />
          <meshToonMaterial color={0xe0dbd0} />
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
      <meshToonMaterial 
        color={color} 
        transparent={opacity < 1} 
        opacity={opacity} 
        emissive={emissive}
      />
    </mesh>
  );
}

  function Walls() {
    return (
      <group>

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

  function CeilingLights() {
    const positionsXZ = [
      [0, 0],
      [3, 0],
      [-3, 0],
      [0, -3],
      [3, -3],
      [-3, -3],
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
            <pointLight position={[lx, 5.7, lz]} color={0xfff5e0} intensity={1.1} distance={8} />
            {i ?
              <spotLight
                color={0xffffff}
                intensity={8}
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

  /** Neon sign above the entrance, with a gentle flicker animation. */
  function NeonSign() {
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
              distance={2}
            />
          </group>
        ))}
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

  function Entrance() {
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

  function StockBars({ items }) {
    useUIStore((s) => s.hud);
    const shelfObs = OBJECT_3D.filter((o) => o.label.startsWith('Shelf'));
    return (
      <>
        {items.map((shelfItem, i) => {
          const o = shelfObs[i];
          if (!o) return null;
          const pct = Math.max(0, Math.min(1, shelfItem.qty / shelfItem.maxQty));
          const barColor = pct > 0.5 ? '#44ff88' : pct > 0.2 ? '#ffaa44' : '#ff4444';
          return (
            <Html
              key={shelfItem.name}
              position={[o.x, 2.8, o.z - 0.1]}
              center
              distanceFactor={9}
              occlude={false}
              style={{ pointerEvents: 'none' }}
            >
              <div
                style={{
                  width: 128,
                  background: 'rgba(0,0,0,.55)',
                  borderRadius: 5,
                  padding: '4px 6px',
                  fontFamily: 'sans-serif',
                }}
              >
                <div style={{ color: '#fff', fontSize: 11, fontWeight: 'bold', textAlign: 'center', marginBottom: 3 }}>
                  {shelfItem.name} {shelfItem.qty}/{shelfItem.maxQty}
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,.15)', borderRadius: 3 }}>
                  <div style={{ width: `${pct * 100}%`, height: '100%', background: barColor, borderRadius: 3 }} />
                </div>
              </div>
            </Html>
          );
        })}
      </>
    );
  }
 
  function RegisterScreen({ posObstacle }) {
      const matRef = useRef();
      const t = useRef(0);
      useFrame((_, dt) => {
        t.current += dt;
        if (matRef.current) matRef.current.color.setHSL(0.37, 1, 0.4 + Math.sin(t.current * 2) * 0.1);
      });
      return (
        <group>
          <Box w={posObstacle.hw * 2} h={1.0} d={posObstacle.hd * 2} color={0x5c3d1e} x={posObstacle.x} y={0.5} z={posObstacle.z} />
          <Box w={posObstacle.hw * 2} h={0.06} d={posObstacle.hd * 2} color={0x222222} x={posObstacle.x} y={1.02} z={posObstacle.z} />
          <Box w={0.5} h={0.4} d={0.35} color={0x111111} x={-1.2} y={1.24} z={posObstacle.z} />
          <Box w={0.5} h={0.25} d={0.04} color={0x111111} x={-1.2} y={1.52} z={posObstacle.z - 0.36} />
          <mesh position={[-1.2, 1.52, posObstacle.z - 0.34]}>
            <boxGeometry args={[0.38, 0.22, 0.02]} />
            <meshBasicMaterial ref={matRef} color={0x44ff88} />
          </mesh>
        </group>
      );
  }
  
  export default function StoreModel({ onFloorClick }) {
    const shelfObs = OBJECT_3D.filter((o) => o.label.startsWith('Shelf'));
    const fridgeObs = OBJECT_3D.filter((o) => o.label.startsWith('Fridge'));

    const items = SHELFLAYOUT
    const handleFloorClick = (e) => {
      e.stopPropagation();
      onFloorClick({ x: e.point.x, z: e.point.z });
    };

    return (<group>
        <Floor onFloorClick={handleFloorClick} />
        <Walls />
        {shelfObs.map((o, i) => (
          <ShelfUnit key={i} o={o} />
        ))}
        {items.map( (o,i) => (
          <ShelfItems key={i} o={o} itemOnShelfAmount={simulationEngine.items.filter( item => item.name == o.label) } />
        ))}
        {fridgeObs.map((o, i) => (
          <Fridge key={i} o={o} />
        ))}
        <RegisterScreen posObstacle={POS_OBSTACLE} />
        <Atm atmObstacle={ATM_OBSTACLE} />
        <Entrance />
        <StockBars items={simulationEngine.items} />
        <CeilingLights />
        <NeonSign />
        <Box
          w={STOCK_OBSTACLE.hw * 2}
          h={3}
          d={STOCK_OBSTACLE.hd * 2}
          color={0x554433}
          x={STOCK_OBSTACLE.x}
          y={1.5}
          z={STOCK_OBSTACLE.z}
        />
        <Box
          w={BREAK_OBSTACLE.hw * 2}
          h={2}
          d={BREAK_OBSTACLE.hd * 2}
          color={0x334433}
          x={BREAK_OBSTACLE.x}
          y={1}
          z={BREAK_OBSTACLE.z}
        />

    </group>);
}