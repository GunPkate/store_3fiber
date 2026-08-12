import { Canvas } from '@react-three/fiber'
import HUD from './components/hud/HUD'
import { Suspense } from 'react';
import Experience from './components/Experience.jsx';
import { useUIStore } from './service/state/uiState.js';
import DocsScene from './components/docs/DocsScene.jsx';
import DocHUD from './components/docs/docshud/DocHUD.jsx';

export default function App() {
  const activeScene = useUIStore((s) => s.activeScene);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0a0a1a', overflow: 'hidden' }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true }}
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <Suspense fallback={null}>
          {activeScene === 'docs'?<DocsScene/>:<Experience />}
        </Suspense>
      </Canvas>
      
      {activeScene === 'docs'?<DocHUD/>:<HUD/>}
      
    </div>
  );
}
