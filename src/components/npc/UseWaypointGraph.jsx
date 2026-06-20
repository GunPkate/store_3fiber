import { useRef, useState, useCallback } from 'react';
import { WPGraph } from '../../service/WpGraph';

export default function UseWaypointGraph() {
  const graphRef = useRef(new WPGraph());
  const [version, setVersion] = useState(0); // bump to force re-render of visuals
  const bump = useCallback(() => setVersion(v => v + 1), []);

  const addNode = useCallback((x, z, type) => {
    const n = graphRef.current.addNode(x, z, type);
    if (n) bump();
    return n;
  }, [bump]);

  const removeNode = useCallback(id => {
    graphRef.current.removeNode(id);
    bump();
  }, [bump]);

  const linkNodes = useCallback((a, b) => {
    graphRef.current.linkNodes(a, b);
    bump();
  }, [bump]);

  return { graph: graphRef.current, version, addNode, removeNode, linkNodes };
}