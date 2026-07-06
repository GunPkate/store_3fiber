import { useMemo } from 'react';
import * as THREE from 'three';
import { WP_COLOR } from '../../service/engine/waypointgraph/WpGraph.js';
import { simulationEngine, useUIStore } from '../../service/state/uiState.js';

export default function Waypoints() {
  const showWP = useUIStore((s) => s.showWP);
  const currentTool = useUIStore((s) => s.currentTool);
  const linkingWP = useUIStore((s) => s.linkingWP);
  const setLinkingWP = useUIStore((s) => s.setLinkingWP);
  const setSelectedWP = useUIStore((s) => s.setSelectedWP);
  // re-derive node/edge lists whenever the graph version bumps
  const wpVersion = useUIStore((s) => s.wpVersion);

  const { nodes, edgeLines } = useMemo(() => {
    const graph = simulationEngine.graph;
    const ns = graph.nodes;
    const lines = [];
    ns.forEach((n) => {
      n.edges.forEach((eid) => {
        const nb = graph.getNode(eid);
        if (!nb || nb.id < n.id) return;
        lines.push([
          [n.x, 0.15, n.z],
          [nb.x, 0.15, nb.z],
        ]);
      });
    });
    return { nodes: ns, edgeLines: lines };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wpVersion]);

  if (!showWP) return null;

  const handleNodeClick = (e, node) => {
    e.stopPropagation();
    if (currentTool === 'del-wp') {
      simulationEngine.removeWaypoint(node.id);
    } else if (currentTool === 'link-wp') {
      if (!linkingWP) {
        setLinkingWP(node);
        simulationEngine.addEvt('🔗 Click 2nd waypoint');
      } else if (linkingWP.id !== node.id) {
        simulationEngine.linkWaypoints(linkingWP, node);
        setLinkingWP(null);
      }
    } else if (currentTool === 'none') {
      setSelectedWP(node);
    }
  };

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
    </group>
  );
}

function EdgeLine({ points }) {
  const geom = useMemo(() => {
    console.log("points", points)
    const g = new THREE.BufferGeometry();
    g.setFromPoints(points.map((p) => new THREE.Vector3(...p)));
    return g;
  }, [points]);
  return (
    <line geometry={geom}>
      <lineBasicMaterial color={0x223366} transparent opacity={0.4} />
    </line>
  );
}
