import { useMemo } from 'react';
import { BufferGeometry, Vector3} from 'three';
import { WP_COLOR } from '../../service/engine/waypointgraph/WpGraph';
import { simulationEngine, useUIStore } from '../../service/state/uiState';

export default function WayPoint(){
    
  
  const { nodes, edgeLines } = useMemo(() => {
    const graph = simulationEngine.graph;
    const graphNodes = graph.nodes;
    const lines = [];
    graphNodes.forEach((n) => {
      n.edges.forEach((eid) => {
        const nextNode = graph.getNode(eid);
        if (!nextNode || nextNode.id < n.id) return;
        lines.push([
          [n.x, 0.15, n.z],
          [nextNode.x, 0.15, nextNode.z],
        ]);
      });
    });
    return { nodes: graphNodes, edgeLines: lines };
  }, []);
    
    return (
        <group>
          {edgeLines.map((pts, i) => (
            <EdgeLine key={i} points={pts} />
          ))}
          {nodes.map((n) => (
            <mesh key={n.id} position={[n.x, 0.15, n.z]} onClick={(e) => handleNodeClick(e, n)}>
              <sphereGeometry args={[0.12, 8, 6]} />
              <meshBasicMaterial color={WP_COLOR[n.type] ?? '#ffffff'} />
              {/* larger invisible hitbox for easier clicking */}
              <mesh visible={false}>
                <sphereGeometry args={[0.4, 6, 4]} />
              </mesh>
            </mesh>
          ))}
        </group>)
}

function EdgeLine({ points }) {
  const geom = useMemo(() => {
    const g = new BufferGeometry();
    g.setFromPoints(points.map((p) => new Vector3(...p)));
    return g;
  }, [points]);
  return (
    <line geometry={geom}>
      <lineBasicMaterial color={0x223366} transparent opacity={0.4} />
    </line>
  );
}