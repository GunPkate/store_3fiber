import { Canvas } from '@react-three/fiber'
import './App.css'
import MapLoader from './components/MapLoader'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { glass_bg, row_menu, glass_text } from './config/uimenu/uimenu'

function App() {
  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', zIndex:2 }}>
      {/* <div style={{position: 'absolute', zIndex: 1 }}  className="backdrop-blur-md bg-gray-600/20 border border-white/10 rounded-2xl shadow-xl p-8 max-w-sm text-white"> */}
      <div style={{position: 'absolute', zIndex: 1 }}  className = {row_menu +" "+glass_text+" "+ glass_bg} >
  
        <div>Dashboard</div>
        <div>Employee</div>
      </div>
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
