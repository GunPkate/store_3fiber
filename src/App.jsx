import { Canvas } from '@react-three/fiber'
import './App.css'
import MapLoader from './components/MapLoader'
import { OrbitControls } from '@react-three/drei'

function App() {
  return (
    <div div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <Canvas>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} />
        <MapLoader/>
        <OrbitControls />
      </Canvas>
    </div>
  )
}

export default App
