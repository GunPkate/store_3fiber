import { Canvas } from '@react-three/fiber'
import './App.css'
import MapLoader from './components/MapLoader'
import { OrbitControls } from '@react-three/drei'

function App() {
  return (
    <div div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <Canvas camera={{ position: [7, 7, 0] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} />
        <MapLoader/>
        <OrbitControls
          enableDamping={true}
          dampingFactor={0.05}
          minDistance={2}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2 - 0.05}
          makeDefault
        />
      </Canvas>
    </div>
  )
}

export default App
