import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './components/Experience.jsx';
import HUD from './components/HUD.jsx';

export default function App() {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0a0a1a', overflow: 'hidden' }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true }}
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>
      <HUD />
    </div>
  );
}
