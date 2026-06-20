// components/WaypointVisuals.jsx
import { useMemo } from 'react';
import * as THREE from 'three';

const WP_COLOR = {
  generic:'#4488ff', shelf:'#ffaa22', pos:'#44aaff', atm:'#ff44aa',
  exit:'#44ff88', spawn:'#88ff44', break:'#ff8844', stock:'#aaff44', waiting:'#aaaaaa'
};

export default function WaypointVisuals({ graph, version, visible, tool, onNodeClick }) {
  // rebuild edge geometry only when graph mutates (version bump)
  const edgeGeo = useMemo(() => {
    const pts = [];
    graph.nodes.forEach(n => {
      n.edges.forEach(eid => {
        const nb = graph.getNode(eid);
        if (!nb || nb.id < n.id) return; // avoid duplicate segments
        pts.push(new THREE.Vector3(n.x, .15, n.z), new THREE.Vector3(nb.x, .15, nb.z));
      });
    });
    return new THREE.BufferGeometry().setFromPoints(pts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  if (!visible) return null;

  return (
    <group>
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#223366" transparent opacity={0.4} />
      </lineSegments>

      {graph.nodes.map(n => (
        <mesh
          key={n.id}
          position={[n.x, .15, n.z]}
          onClick={(e) => {
            e.stopPropagation();
            onNodeClick?.(n);
          }}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        >
          <sphereGeometry args={[0.12, 8, 6]} />
          <meshBasicMaterial color={WP_COLOR[n.type] ?? '#ffffff'} />
        </mesh>
      ))}
    </group>
  );
}