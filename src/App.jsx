import React, { useRef, useState, useContext, createContext, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

/* ════════════════════════════════════════
   COLORS  (same hex values as the original)
════════════════════════════════════════ */
const COLORS = {
  floor: '#d4c5a0',
  wall: '#f0ece0',
  ceiling: '#fafaf8',
  shelf: '#8b6914',
  shelfMetal: '#aaaaaa',
  counter: '#5c3d1e',
  counterTop: '#2a2a2a',
  red: '#cc2222',
  blue: '#1a5fa0',
  green: '#2a8c2a',
  yellow: '#e8c012',
  orange: '#e8640a',
  purple: '#7a2d8c',
  white: '#ffffff',
  dark: '#222222',
  fridgeBody: '#444455',
  fridgeGlass: '#8af0f8',
  neonPink: '#ff2288',
  neonBlue: '#22ccff',
  signBg: '#111122',
  lamp: '#fff8cc',
  tile: '#e8e4d8',
  darkTile: '#b8b0a0',
  can1: '#e02020',
  can2: '#1060c0',
  can3: '#20a020',
};

/* ── Hover-label context (replaces the manual raycaster in the original) ── */
const HoverContext = createContext({ showLabel: () => {}, hideLabel: () => {} });

/* ── Registry for flickering point lights (replaces the animate-loop filter) ── */
const FlickerContext = createContext({ register: () => {} });

/* ════════════════════════════════════════
   GENERIC BOX  (mirrors the `box()` helper)
════════════════════════════════════════ */
function Box({
  args = [1, 1, 1],
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  color,
  material = 'lambert',
  matProps = {},
  castShadow = true,
  receiveShadow = true,
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow={castShadow} receiveShadow={receiveShadow}>
      <boxGeometry args={args} />
      {material === 'lambert' && <meshLambertMaterial color={color} {...matProps} />}
      {material === 'basic' && <meshBasicMaterial color={color} {...matProps} />}
      {material === 'phong' && <meshPhongMaterial color={color} {...matProps} />}
    </mesh>
  );
}

/* ── Box that also reports hover state for the label pill ── */
function TaggedBox({
  args = [0.18, 0.28, 0.16],
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  color,
  name,
  material = 'lambert',
  matProps = {},
  castShadow = true,
  receiveShadow = true,
}) {
  const { showLabel, hideLabel } = useContext(HoverContext);
  return (
    <mesh
      position={position}
      rotation={rotation}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
      onPointerOver={(e) => { e.stopPropagation(); showLabel(name); }}
      onPointerOut={(e) => { e.stopPropagation(); hideLabel(); }}
    >
      <boxGeometry args={args} />
      {material === 'lambert' && <meshLambertMaterial color={color} {...matProps} />}
      {material === 'basic' && <meshBasicMaterial color={color} {...matProps} />}
      {material === 'phong' && <meshPhongMaterial color={color} {...matProps} />}
    </mesh>
  );
}

/* ── Point light that registers itself with the flicker loop ── */
function FlickerLight({ color, intensity, distance, position }) {
  const ref = useRef();
  const { register } = useContext(FlickerContext);
  useEffect(() => {
    if (ref.current) return register(ref.current, color);
  }, [register, color]);
  return <pointLight ref={ref} color={color} intensity={intensity} distance={distance} position={position} />;
}

/* ════════════════════════════════════════
   FLOOR  (checkerboard)
════════════════════════════════════════ */
function Floor() {
  const tiles = useMemo(() => {
    const arr = [];
    for (let x = -4; x < 4; x++) {
      for (let z = -4; z < 4; z++) {
        arr.push({ x: x + 0.5, z: z + 0.5, dark: (x + z) % 2 !== 0 });
      }
    }
    return arr;
  }, []);
  return (
    <group>
      {tiles.map((t, i) => (
        <mesh key={i} position={[t.x, 0, t.z]} receiveShadow>
          <boxGeometry args={[1, 0.02, 1]} />
          <meshLambertMaterial color={t.dark ? COLORS.darkTile : COLORS.tile} />
        </mesh>
      ))}
    </group>
  );
}

/* ════════════════════════════════════════
   WALLS & CEILING
════════════════════════════════════════ */
function WallsAndCeiling() {
  return (
    <group>
      <Box args={[10, 6, 0.15]} position={[0, 3, -4]} color={COLORS.wall} />
      <Box args={[0.15, 6, 8]} position={[-5, 3, 0]} color={COLORS.wall} />
      <Box args={[0.15, 6, 8]} position={[5, 3, 0]} color={COLORS.wall} />
      <mesh position={[0, 6, 0]} receiveShadow>
        <boxGeometry args={[10, 0.15, 8]} />
        <meshLambertMaterial color={COLORS.ceiling} />
      </mesh>
    </group>
  );
}

/* ════════════════════════════════════════
   CEILING LIGHTS  (fluorescent strips)
════════════════════════════════════════ */
function CeilLight({ x, z }) {
  return (
    <group>
      <mesh position={[x, 5.9, z]}>
        <boxGeometry args={[0.2, 0.06, 1.5]} />
        <meshBasicMaterial color={COLORS.lamp} />
      </mesh>
      <FlickerLight color="#fff5e0" intensity={15} distance={7} position={[x, 5.7, z]} />
    </group>
  );
}

/* ════════════════════════════════════════
   NEON SIGN  (back wall)
════════════════════════════════════════ */
function NeonBar({ w, h, x, y, color }) {
  return (
    <group>
      <mesh position={[x, y, -3.83]}>
        <boxGeometry args={[w, h, 0.05]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <FlickerLight color={color} intensity={5} distance={2} position={[x, y, -3.7]} />
    </group>
  );
}

function NeonSign() {
  return (
    <group>
      <mesh position={[0, 5.2, -3.9]}>
        <boxGeometry args={[3.5, 0.8, 0.1]} />
        <meshLambertMaterial color={COLORS.signBg} />
      </mesh>
      <NeonBar w={1.2} h={0.08} x={-0.7} y={5.35} color={COLORS.neonPink} />
      <NeonBar w={1.2} h={0.08} x={0.7} y={5.35} color={COLORS.neonBlue} />
      <NeonBar w={0.08} h={0.4} x={-0.32} y={5.2} color={COLORS.neonPink} />
      <NeonBar w={0.08} h={0.4} x={0.32} y={5.2} color={COLORS.neonBlue} />
      <NeonBar w={0.6} h={0.08} x={0} y={5.05} color={COLORS.neonPink} />
    </group>
  );
}

/* ════════════════════════════════════════
   SHELF UNIT
════════════════════════════════════════ */
function ShelfUnit({ sx, sz, items }) {
  const { showLabel, hideLabel } = useContext(HoverContext);
  return (
    <group>
      <mesh
        position={[sx, 1.1, sz]}
        castShadow
        receiveShadow
        onPointerOver={(e) => { e.stopPropagation(); showLabel('Shelf'); }}
        onPointerOut={(e) => { e.stopPropagation(); hideLabel(); }}
      >
        <boxGeometry args={[1.8, 2.2, 0.08]} />
        <meshLambertMaterial color={COLORS.shelfMetal} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <Box key={i} args={[1.8, 0.06, 0.45]} position={[sx, 0.35 + i * 0.72, sz + 0.18]} color={COLORS.shelf} />
      ))}
      <Box args={[0.06, 2.2, 0.45]} position={[sx - 0.87, 1.1, sz + 0.18]} color={COLORS.shelf} />
      <Box args={[0.06, 2.2, 0.45]} position={[sx + 0.87, 1.1, sz + 0.18]} color={COLORS.shelf} />
      {items.map((it, i) => (
        <TaggedBox
          key={i}
          args={[it.w || 0.18, it.h || 0.28, it.d || 0.16]}
          position={[sx + it.x, it.y, sz + it.z]}
          color={COLORS[it.c]}
          name={it.n || 'Product'}
        />
      ))}
    </group>
  );
}

/* ════════════════════════════════════════
   REFRIGERATOR UNITS
════════════════════════════════════════ */
function Fridge({ x, z, items }) {
  const { showLabel, hideLabel } = useContext(HoverContext);
  const overFridge = (e) => { e.stopPropagation(); showLabel('Refrigerator'); };
  const outFridge = (e) => { e.stopPropagation(); hideLabel(); };
  return (
    <group>
      <mesh position={[x, 1.6, z]} castShadow receiveShadow onPointerOver={overFridge} onPointerOut={outFridge}>
        <boxGeometry args={[1.6, 3.2, 0.8]} />
        <meshLambertMaterial color={COLORS.fridgeBody} />
      </mesh>
      <mesh position={[x, 1.6, z + 0.42]} onPointerOver={overFridge} onPointerOut={outFridge}>
        <boxGeometry args={[1.5, 3.0, 0.05]} />
        <meshPhongMaterial color={COLORS.fridgeGlass} transparent opacity={0.35} shininess={120} />
      </mesh>
      <FlickerLight color="#88ddff" intensity={7.5} distance={1.5} position={[x, 2.5, z + 0.1]} />
      {[0, 1, 2].map((sh) => (
        <group key={sh}>
          <Box args={[1.4, 0.04, 0.6]} position={[x, 0.5 + sh * 0.9, z - 0.05]} color={COLORS.shelfMetal} />
          {items.map((it, i) => {
            if (it.row !== sh) return null;
            return (
              <mesh
                key={i}
                position={[x - 0.45 + (i % 4) * 0.3, 0.66 + sh * 0.9, z - 0.05]}
                castShadow
                onPointerOver={(e) => { e.stopPropagation(); showLabel(it.n || 'Drink'); }}
                onPointerOut={outFridge}
              >
                <cylinderGeometry args={[0.08, 0.08, 0.28, 12]} />
                <meshLambertMaterial color={COLORS[it.c]} />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
}

/* ════════════════════════════════════════
   CHECKOUT COUNTER
════════════════════════════════════════ */
function Counter() {
  const { showLabel, hideLabel } = useContext(HoverContext);
  return (
    <group>
      <mesh
        position={[0, 0.5, 3.2]}
        castShadow
        receiveShadow
        onPointerOver={(e) => { e.stopPropagation(); showLabel('Checkout Counter'); }}
        onPointerOut={(e) => { e.stopPropagation(); hideLabel(); }}
      >
        <boxGeometry args={[2.5, 1.0, 0.8]} />
        <meshLambertMaterial color={COLORS.counter} />
      </mesh>
      <Box args={[2.5, 0.06, 0.8]} position={[0, 1.02, 3.2]} color={COLORS.counterTop} />

      <mesh
        position={[-0.6, 1.24, 3.2]}
        castShadow
        receiveShadow
        onPointerOver={(e) => { e.stopPropagation(); showLabel('Cash Register'); }}
        onPointerOut={(e) => { e.stopPropagation(); hideLabel(); }}
      >
        <boxGeometry args={[0.5, 0.4, 0.35]} />
        <meshLambertMaterial color={COLORS.dark} />
      </mesh>
      <Box args={[0.5, 0.25, 0.04]} position={[-0.6, 1.52, 3.1]} color={COLORS.dark} />

      <mesh
        position={[-0.6, 1.52, 3.09]}
        onPointerOver={(e) => { e.stopPropagation(); showLabel('POS Screen'); }}
        onPointerOut={(e) => { e.stopPropagation(); hideLabel(); }}
      >
        <boxGeometry args={[0.38, 0.22, 0.02]} />
        <meshBasicMaterial color="#44ff88" />
      </mesh>

      <Box args={[0.15, 0.2, 0.1]} position={[0.2, 1.14, 2.88]} color={COLORS.dark} />
    </group>
  );
}

/* ════════════════════════════════════════
   CANDY RACKS  (near counter)
════════════════════════════════════════ */
function CandyRack({ cx, cz }) {
  const rows = [
    ['red', 'yellow', 'orange'],
    ['purple', 'blue', 'green'],
  ];
  return (
    <group>
      <Box args={[0.5, 1.0, 0.12]} position={[cx, 0.5, cz]} color={COLORS.shelfMetal} />
      {rows.map((row, ri) =>
        row.map((c, ci) => (
          <TaggedBox
            key={`${ri}-${ci}`}
            args={[0.12, 0.12, 0.06]}
            position={[cx - 0.12 + ri * 0.24, 0.22 + ci * 0.22, cz + 0.1]}
            color={COLORS[c]}
            name="Candy"
          />
        ))
      )}
    </group>
  );
}

/* ════════════════════════════════════════
   MAGAZINE RACK
════════════════════════════════════════ */
function MagazineRack() {
  const { showLabel, hideLabel } = useContext(HoverContext);
  const colors = ['red', 'blue', 'green', 'yellow', 'orange', 'purple'];
  return (
    <group>
      <mesh
        position={[1.5, 0.7, 3.5]}
        castShadow
        receiveShadow
        onPointerOver={(e) => { e.stopPropagation(); showLabel('Magazine Rack'); }}
        onPointerOut={(e) => { e.stopPropagation(); hideLabel(); }}
      >
        <boxGeometry args={[0.9, 1.4, 0.15]} />
        <meshLambertMaterial color={COLORS.shelfMetal} />
      </mesh>
      {colors.map((c, i) => (
        <TaggedBox
          key={i}
          args={[0.18, 0.28, 0.03]}
          position={[1.2 + (i % 3) * 0.25, 0.6 + Math.floor(i / 3) * 0.38, 3.44]}
          color={COLORS[c]}
          name="Magazine"
        />
      ))}
    </group>
  );
}

/* ════════════════════════════════════════
   ATM
════════════════════════════════════════ */
function Atm() {
  const { showLabel, hideLabel } = useContext(HoverContext);
  return (
    <group>
      <mesh
        position={[-4.2, 0.9, 2.5]}
        castShadow
        receiveShadow
        onPointerOver={(e) => { e.stopPropagation(); showLabel('ATM'); }}
        onPointerOut={(e) => { e.stopPropagation(); hideLabel(); }}
      >
        <boxGeometry args={[0.7, 1.8, 0.5]} />
        <meshLambertMaterial color={COLORS.dark} />
      </mesh>
      <mesh
        position={[-4.2, 1.2, 2.26]}
        onPointerOver={(e) => { e.stopPropagation(); showLabel('ATM Screen'); }}
        onPointerOut={(e) => { e.stopPropagation(); hideLabel(); }}
      >
        <boxGeometry args={[0.45, 0.3, 0.02]} />
        <meshBasicMaterial color="#2266ff" />
      </mesh>
    </group>
  );
}

/* ════════════════════════════════════════
   ENTRANCE DOOR
════════════════════════════════════════ */
function EntranceDoor() {
  const { showLabel, hideLabel } = useContext(HoverContext);
  return (
    <group>
      <Box args={[0.1, 3, 0.15]} position={[-1.0, 1.5, 3.95]} color={COLORS.shelfMetal} />
      <Box args={[0.1, 3, 0.15]} position={[1.0, 1.5, 3.95]} color={COLORS.shelfMetal} />
      <Box args={[2.1, 0.1, 0.15]} position={[0, 3.05, 3.95]} color={COLORS.shelfMetal} />
      <mesh
        position={[0, 1.5, 3.93]}
        onPointerOver={(e) => { e.stopPropagation(); showLabel('Entrance'); }}
        onPointerOut={(e) => { e.stopPropagation(); hideLabel(); }}
      >
        <boxGeometry args={[0.9, 2.8, 0.04]} />
        <meshPhongMaterial color="#88ccff" transparent opacity={0.3} shininess={80} />
      </mesh>
    </group>
  );
}

/* ════════════════════════════════════════
   FLOOR PROMO DISPLAY
════════════════════════════════════════ */
function PromoDisplay() {
  const { showLabel, hideLabel } = useContext(HoverContext);
  const colors = ['red', 'yellow', 'blue', 'orange'];
  return (
    <group>
      <mesh
        position={[2.5, 0.05, -1.5]}
        castShadow
        receiveShadow
        onPointerOver={(e) => { e.stopPropagation(); showLabel('Promo Display'); }}
        onPointerOut={(e) => { e.stopPropagation(); hideLabel(); }}
      >
        <boxGeometry args={[0.8, 0.1, 0.8]} />
        <meshLambertMaterial color={COLORS.counter} />
      </mesh>
      <Box args={[0.04, 0.6, 0.04]} position={[2.1, 0.35, -1.1]} color={COLORS.shelfMetal} />
      <Box args={[0.04, 0.6, 0.04]} position={[2.9, 0.35, -1.1]} color={COLORS.shelfMetal} />
      <Box args={[0.04, 0.6, 0.04]} position={[2.1, 0.35, -1.9]} color={COLORS.shelfMetal} />
      <Box args={[0.04, 0.6, 0.04]} position={[2.9, 0.35, -1.9]} color={COLORS.shelfMetal} />
      <Box args={[0.8, 0.04, 0.8]} position={[2.5, 0.45, -1.5]} color={COLORS.shelf} />
      <Box args={[0.8, 0.04, 0.8]} position={[2.5, 0.75, -1.5]} color={COLORS.shelf} />
      {colors.map((c, i) => (
        <TaggedBox
          key={i}
          args={[0.14, 0.22, 0.14]}
          position={[2.2 + (i % 2) * 0.3, 0.58 + Math.floor(i / 2) * 0.3, -1.3 + Math.floor(i / 2) * 0.3]}
          color={COLORS[c]}
          name="Special Offer"
        />
      ))}
    </group>
  );
}

/* ── Overhead price tags (untagged, no hover) ── */
function PriceTags() {
  const tags = [
    [-2.8, 2.3, -3.55, 'red'],
    [-0.02, 2.3, -3.55, 'blue'],
    [2.8, 2.3, -3.55, 'green'],
  ];
  return (
    <group>
      {tags.map(([x, y, z, c], i) => (
        <Box key={i} args={[0.5, 0.15, 0.03]} position={[x, y, z]} color={COLORS[c]} />
      ))}
    </group>
  );
}

/* ════════════════════════════════════════
   FLICKER MANAGER  (fridge / neon / ceiling lights)
════════════════════════════════════════ */
function FlickerManager({ children }) {
  const lights = useRef([]); // [{ ref, colorObj }]
  const t = useRef(0);

  const register = (mesh, color) => {
    const colorObj = new THREE.Color(color);
    lights.current.push({ ref: mesh, colorObj });
    return () => {
      lights.current = lights.current.filter((l) => l.ref !== mesh);
    };
  };

  useFrame((_, delta) => {
    t.current += 0.01;
    lights.current.forEach((l, i) => {
      if (l.colorObj.b > 0.5) {
        l.ref.intensity = 0.5 + Math.sin(t.current * 3 + i) * 0.08;
      }
    });
  });

  return <FlickerContext.Provider value={{ register }}>{children}</FlickerContext.Provider>;
}

/* ════════════════════════════════════════
   STORE SCENE
════════════════════════════════════════ */
function Store() {
  return (
    <FlickerManager>
      <ambientLight color="#404060" intensity={0.8} />
      <directionalLight
        color="#ffffff"
        intensity={0.6}
        position={[3, 8, 5]}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      <Floor />
      <WallsAndCeiling />

      <CeilLight x={-2} z={0} />
      <CeilLight x={2} z={0} />
      <CeilLight x={-2} z={-2.5} />
      <CeilLight x={2} z={-2.5} />

      <NeonSign />

      {/* Back-wall shelves */}
      <ShelfUnit
        sx={-2.8}
        sz={-3.6}
        items={[
          { x: -0.5, y: 0.52, z: 0.22, c: 'red', n: 'Cola' },
          { x: -0.15, y: 0.52, z: 0.22, c: 'red', n: 'Cola' },
          { x: 0.2, y: 0.52, z: 0.22, c: 'red', n: 'Cola' },
          { x: 0.55, y: 0.52, z: 0.22, c: 'red', n: 'Cola' },
          { x: -0.5, y: 1.24, z: 0.22, c: 'blue', n: 'Water' },
          { x: -0.15, y: 1.24, z: 0.22, c: 'blue', n: 'Water' },
          { x: 0.2, y: 1.24, z: 0.22, c: 'blue', n: 'Water' },
          { x: -0.5, y: 1.96, z: 0.22, c: 'yellow', h: 0.22, w: 0.2, n: 'Chips' },
          { x: 0.1, y: 1.96, z: 0.22, c: 'orange', h: 0.22, w: 0.2, n: 'Snacks' },
          { x: 0.65, y: 1.96, z: 0.22, c: 'green', h: 0.22, w: 0.2, n: 'Crackers' },
        ]}
      />
      <ShelfUnit
        sx={0}
        sz={-3.6}
        items={[
          { x: -0.5, y: 0.52, z: 0.22, c: 'purple', n: 'Candy' },
          { x: -0.1, y: 0.52, z: 0.22, c: 'purple', n: 'Candy' },
          { x: 0.3, y: 0.52, z: 0.22, c: 'orange', n: 'Cookies' },
          { x: -0.5, y: 1.24, z: 0.22, c: 'green', n: 'Juice' },
          { x: 0, y: 1.24, z: 0.22, c: 'green', n: 'Juice' },
          { x: 0.5, y: 1.24, z: 0.22, c: 'yellow', n: 'Lemonade' },
          { x: -0.4, y: 1.96, z: 0.22, c: 'red', h: 0.2, w: 0.15, n: 'Hot Sauce' },
          { x: 0, y: 1.96, z: 0.22, c: 'white', h: 0.2, w: 0.15, n: 'Mayo' },
          { x: 0.4, y: 1.96, z: 0.22, c: 'yellow', h: 0.2, w: 0.15, n: 'Mustard' },
        ]}
      />
      <ShelfUnit
        sx={2.8}
        sz={-3.6}
        items={[
          { x: -0.55, y: 0.52, z: 0.22, c: 'blue', n: 'Pen' },
          { x: -0.2, y: 0.52, z: 0.22, c: 'red', n: 'Notebook' },
          { x: 0.2, y: 0.52, z: 0.22, c: 'green', n: 'Gum' },
          { x: 0.55, y: 0.52, z: 0.22, c: 'yellow', n: 'Mints' },
          { x: -0.5, y: 1.24, z: 0.22, c: 'orange', n: 'Jerky' },
          { x: 0.1, y: 1.24, z: 0.22, c: 'red', n: 'Salsa' },
          { x: -0.3, y: 1.96, z: 0.22, c: 'purple', h: 0.24, w: 0.22, n: 'Cereal' },
          { x: 0.35, y: 1.96, z: 0.22, c: 'blue', h: 0.24, w: 0.22, n: 'Oats' },
        ]}
      />

      {/* Center aisle shelf */}
      <ShelfUnit
        sx={0}
        sz={1}
        items={[
          { x: -0.5, y: 0.52, z: 0, c: 'orange', n: 'Chips' },
          { x: -0.1, y: 0.52, z: 0, c: 'yellow', n: 'Popcorn' },
          { x: 0.3, y: 0.52, z: 0, c: 'red', n: 'Pretzels' },
          { x: -0.5, y: 1.24, z: 0, c: 'blue', n: 'Soap' },
          { x: 0, y: 1.24, z: 0, c: 'white', n: 'Shampoo' },
          { x: 0.5, y: 1.24, z: 0, c: 'green', n: 'Toothpaste' },
        ]}
      />

      {/* Refrigerator units (right wall) */}
      <Fridge
        x={4.1}
        z={-1}
        items={[
          { c: 'can1', n: 'Cola', row: 0 }, { c: 'can1', n: 'Cola', row: 0 },
          { c: 'can1', n: 'Cola', row: 0 }, { c: 'can1', n: 'Cola', row: 0 },
          { c: 'can2', n: 'Energy', row: 1 }, { c: 'can2', n: 'Energy', row: 1 },
          { c: 'can2', n: 'Energy', row: 1 }, { c: 'can2', n: 'Energy', row: 1 },
          { c: 'can3', n: 'Green Tea', row: 2 }, { c: 'can3', n: 'Green Tea', row: 2 },
          { c: 'can3', n: 'Green Tea', row: 2 },
        ]}
      />
      <Fridge
        x={4.1}
        z={1}
        items={[
          { c: 'blue', n: 'Water', row: 0 }, { c: 'blue', n: 'Water', row: 0 },
          { c: 'blue', n: 'Water', row: 0 }, { c: 'blue', n: 'Water', row: 0 },
          { c: 'orange', n: 'OJ', row: 1 }, { c: 'orange', n: 'OJ', row: 1 },
          { c: 'orange', n: 'OJ', row: 1 },
          { c: 'purple', n: 'Grape', row: 2 }, { c: 'purple', n: 'Grape', row: 2 },
          { c: 'purple', n: 'Grape', row: 2 },
        ]}
      />

      <Counter />
      <CandyRack cx={-1.5} cz={3.4} />
      <CandyRack cx={-0.9} cz={3.4} />
      <MagazineRack />
      <Atm />
      <EntranceDoor />
      <PromoDisplay />
      <PriceTags />
    </FlickerManager>
  );
}

/* ════════════════════════════════════════
   APP  (canvas, camera, orbit controls, hover-label overlay)
════════════════════════════════════════ */
export default function App() {
  const [hoverLabel, setHoverLabel] = useState(null);
  const hoverTimeout = useRef();

  const showLabel = (name) => {
    clearTimeout(hoverTimeout.current);
    setHoverLabel(name);
    hoverTimeout.current = setTimeout(() => setHoverLabel(null), 2000);
  };
  const hideLabel = () => {
    clearTimeout(hoverTimeout.current);
    setHoverLabel(null);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', background: '#0a0a1a', overflow: 'hidden' }}>
      <Canvas
        shadows={{ type: THREE.PCFSoftShadowMap }}
        dpr={[1, 2]}
        gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
        flat
        legacy
        camera={{ fov: 55, near: 0.1, far: 100, position: [3.82, 11.54, 5.35] }}
      >
        <color attach="background" args={['#0a0a1a']} />
        <fog attach="fog" args={['#0a0a1a', 18, 32]} />
        <HoverContext.Provider value={{ showLabel, hideLabel }}>
          <Store />
        </HoverContext.Provider>
        <OrbitControls
          target={[0, 1.5, 0]}
          minDistance={3}
          maxDistance={20}
          minPolarAngle={0.1}
          maxPolarAngle={Math.PI / 2}
          enableDamping={false}
        />
      </Canvas>

      <div
        style={{
          position: 'fixed',
          bottom: 14,
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.45)',
          fontSize: 13,
          fontFamily: 'sans-serif',
          pointerEvents: 'none',
        }}
      >
        Drag to orbit · Scroll to zoom · Right-drag to pan
      </div>

      <div
        style={{
          position: 'fixed',
          top: 14,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.6)',
          color: '#fff',
          fontSize: 13,
          fontFamily: 'sans-serif',
          padding: '4px 16px',
          borderRadius: 20,
          pointerEvents: 'none',
          opacity: hoverLabel ? 1 : 0,
          transition: 'opacity .3s',
        }}
      >
        {hoverLabel}
      </div>
    </div>
  );
}
