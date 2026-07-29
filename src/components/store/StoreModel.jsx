import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { FLOOR_W, FLOOR_D, OBJECT_3D, POS_OBSTACLE, ATM_OBSTACLE, STOCK_OBSTACLE, BREAK_OBSTACLE } from '../../config/storeLayout/storeLayoutLv1.js';
import { simulationEngine, useUIStore } from '../../service/state/uiState'
import { Html } from '@react-three/drei';
import { SHELFLAYOUT } from '../../config/storeLayout/ShelfLayoutLv1.js';
import { Walls } from './building/store/Walls.jsx';
import { Floor } from './building/store/Floor.jsx';
import { Entrance } from './building/store/Entrance.jsx';
import { CeilingLights } from './building/store/CeilingLights.jsx';
import StorageItems from './products/StorageItems.jsx';
import ShelfItems from './products/ShelfItems.jsx';
import { Box } from './building/sharedmesh/Box.jsx';
import { RegisterScreen, ShelfUnit, Fridge, Atm } from './facilities/Facilities.jsx';
import { NeonSign } from './building/store/NeonSign.jsx';

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
        <StorageItems/>

        {fridgeObs.map((o,i)=>(
          <Fridge key={i} o={o}/>
        ))}
        <RegisterScreen posObstacle={POS_OBSTACLE} />
        <Atm atmObstacle={ATM_OBSTACLE} />
        <Entrance />
        <StockBars items={simulationEngine.items} />
        <CeilingLights />
        {/* <NeonSign />

        <Box
          w={BREAK_OBSTACLE.hw * 2}
          h={2}
          d={BREAK_OBSTACLE.hd * 2}
          color={0x334433}
          x={BREAK_OBSTACLE.x}
          y={1}
          z={BREAK_OBSTACLE.z}
        /> */}

    </group>);
}