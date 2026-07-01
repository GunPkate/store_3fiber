// Small standalone helper kept out of Waypoints.jsx so that file can
// export only the React component (keeps react-refresh happy).
export function findNearNode(graph, x, z, maxD = 0.8) {
  let best = null,
    bd = maxD;
  graph.nodes.forEach((n) => {
    const d = Math.hypot(n.x - x, n.z - z);
    if (d < bd) {
      bd = d;
      best = n;
    }
  });
  return best;
}
