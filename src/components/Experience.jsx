import * as THREE from 'three';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import StoreModel from './StoreModel.jsx';
import Waypoints from './Waypoints.jsx';
import { findNearNode } from '../engine/waypointUtils.js';
import NPCs from './NPCs.jsx';
import GameLoop from './GameLoop.jsx';
import { engine, useUiStore } from '../state/uiStore.js';

export default function Experience() {
  const currentTool = useUiStore((s) => s.currentTool);
  const linkingWP = useUiStore((s) => s.linkingWP);
  const setLinkingWP = useUiStore((s) => s.setLinkingWP);
  const setSelectedWP = useUiStore((s) => s.setSelectedWP);
  const fov = useUiStore((s) => s.fov);

  const handleFloorClick = ({ x, z }) => {
    switch (currentTool) {
      case 'add-wp':
        engine.addWaypoint(x, z, 'generic');
        break;
      case 'del-wp': {
        const n = findNearNode(engine.graph, x, z);
        if (n) engine.removeWaypoint(n.id);
        break;
      }
      case 'link-wp': {
        const n = findNearNode(engine.graph, x, z);
        if (n) {
          if (!linkingWP) {
            setLinkingWP(n);
            engine.addEvt('🔗 Click 2nd waypoint');
          } else if (linkingWP.id !== n.id) {
            engine.linkWaypoints(linkingWP, n);
            setLinkingWP(null);
          }
        }
        break;
      }
      case 'spawn-c':
        engine.spawnCustomerAt(x, z);
        break;
      case 'spawn-e':
        engine.spawnEmployeeAt(x, z);
        break;
      case 'none':
        setSelectedWP(null);
        break;
      default:
        break;
    }
  };

  return (
    <>
      <color attach="background" args={[0x0a0a1a]} />
      <fog attach="fog" args={[0x0a0a1a, 22, 38]} />
      <PerspectiveCamera makeDefault fov={fov} near={0.1} far={100} position={[1.46, 10.47, 14.56]} />
      <ambientLight color={0x334466} intensity={0.9} />
      <directionalLight
        color={0xffffff}
        intensity={0.8}
        position={[5, 12, 6]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <OrbitControls
        makeDefault
        target={[0, 0, 0]}
        mouseButtons={{ LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }}
        minDistance={3}
        maxDistance={28}
        minPolarAngle={0.08}
        maxPolarAngle={Math.PI / 2.05}
        enableDamping
        dampingFactor={0.12}
      />
      <StoreModel onFloorClick={handleFloorClick} />
      <Waypoints />
      <NPCs />
      <GameLoop />
    </>
  );
}
