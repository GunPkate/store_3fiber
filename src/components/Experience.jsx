import * as THREE from 'three';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import StoreModel from './store/StoreModel.jsx';
import { findNearNode } from '../service/engine/waypointUtils.js';
import CharacterManager from './npc/CharacterManager.jsx';
import SimulationLoop from './simulation/SimulationLoop.jsx';
import { simulationEngine, useUIStore } from '../service/state/uiState.js';
import Waypoints from './waypoint/Waypoint.jsx';

export default function Experience() {
  const currentTool = useUIStore((s) => s.currentTool);
  const linkingWP = useUIStore((s) => s.linkingWP);
  const setLinkingWP = useUIStore((s) => s.setLinkingWP);
  const setSelectedWP = useUIStore((s) => s.setSelectedWP);
  const fov = useUIStore((s) => s.fov);

  const handleFloorClick = ({ x, z }) => {
    switch (currentTool) {
      case 'add-wp':
        simulationEngine.addWaypoint(x, z, 'generic');
        break;
      case 'del-wp': {
        const n = findNearNode(simulationEngine.graph, x, z);
        if (n) simulationEngine.removeWaypoint(n.id);
        break;
      }
      case 'link-wp': {
        const n = findNearNode(simulationEngine.graph, x, z);
        if (n) {
          if (!linkingWP) {
            setLinkingWP(n);
            simulationEngine.addEvt('🔗 Click 2nd waypoint');
          } else if (linkingWP.id !== n.id) {
            simulationEngine.linkWaypoints(linkingWP, n);
            setLinkingWP(null);
          }
        }
        break;
      }
      case 'spawn-c':
        simulationEngine.spawnCustomerAt(x, z);
        break;
      case 'spawn-e':
        simulationEngine.spawnEmployeeAt(x, z);
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
      <PerspectiveCamera makeDefault fov={55} near={0.1} far={100} position={[0, 5, 14.56]} />
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
      <CharacterManager />
      <SimulationLoop />
    </>
  );
}
