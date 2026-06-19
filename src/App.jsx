import { Canvas } from '@react-three/fiber'
import './App.css'
import MapLoader from './components/MapLoader'
import { OrbitControls } from '@react-three/drei'

function App() {
  return (
    <div div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <Canvas>
        <MapLoader/>
        <OrbitControls />
      </Canvas>
    </div>
  )
}

export default App
