import { Canvas } from '@react-three/fiber'
import './App.css'
import MapLoader from './components/MapLoader'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'

function App() {
  return (
    <div div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <Canvas>
        <PerspectiveCamera makeDefault fov={55} near={0.1} far={100} position={[0, 5, 14.56]} />
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
