import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { simulationEngine, useUIStore } from '../../service/state/uiState'

const HUD_HZ = 10; // refresh the HUD overlay ~10x/sec instead of every frame

export default function GameLoop() {
  const refreshHud = useUIStore((s) => s.refreshHud);
  const acc = useRef(0);

  useFrame((_, delta) => {
    const rawDt = Math.min(delta, 0.1);
    simulationEngine.update(rawDt);

    acc.current += rawDt;
    if (acc.current >= 1 / HUD_HZ) {
      acc.current = 0;
      refreshHud();
    }
  });

  return null;
}
