// StorePage.jsx
import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import WaypointVisuals from './components/npc/WaypointVisuals';
import useWaypointGraph  from './components/npc/useWaypointGraph';
import MapLoader from './components/MapLoader'; 

export default function App() {
  const { graph, version, addNode, removeNode, linkNodes } = useWaypointGraph();
  const [showWP, setShowWP] = useState(false);
  const [tool, setTool] = useState('none');
  const [linkingNode, setLinkingNode] = useState(null);
  const [selectedWP, setSelectedWP] = useState(null);

  const handleFloorClick = (e) => {
    if (tool !== 'add-wp') return;
    e.stopPropagation();
    const { x, z } = e.point;
    const n = addNode(x, z, 'generic');
    if (!n) console.log('blocked by obstacle');
  };

  const handleNodeClick = (n) => {
    if (tool === 'del-wp') {
      removeNode(n.id);
    } else if (tool === 'link-wp') {
      if (!linkingNode) setLinkingNode(n);
      else if (linkingNode.id !== n.id) {
        linkNodes(linkingNode, n);
        setLinkingNode(null);
      }
    } else {
      setSelectedWP(n);
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <Canvas camera={{ position: [7, 7, 0] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} />
        <MapLoader onFloorClick={handleFloorClick} />
        <WaypointVisuals
          graph={graph}
          version={version}
          visible={showWP}
          tool={tool}
          onNodeClick={handleNodeClick}
        />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={2}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2 - 0.05}
          makeDefault
          enabled={tool === 'none'}
        />
      </Canvas>

      <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)' }}>
        <button onClick={() => setTool('none')}>🎥 View</button>
        <button onClick={() => { setTool('add-wp'); setShowWP(true); }}>➕ Waypoint</button>
        <button onClick={() => { setTool('del-wp'); setShowWP(true); }}>❌ Del WP</button>
        <button onClick={() => { setTool('link-wp'); setShowWP(true); setLinkingNode(null); }}>🔗 Link WP</button>
        <button onClick={() => setShowWP(s => !s)}>👁 Toggle WP</button>
      </div>
    </div>
  );
}