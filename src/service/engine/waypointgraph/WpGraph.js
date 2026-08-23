import { FLOOR_D, FLOOR_W, inObs, OBSTACLE_POINTS } from "../../../config/storeLayout/storeLayoutLv1";
import { uid } from "../uid";

export class WpGraph {
    constructor(specialPoints, shelfPoints, fridgePoints) {
        this.nodes = [];
        this._build(specialPoints, shelfPoints, fridgePoints);
    }

    _build(specialPoints, shelfPoints, fridgePoints) {

        const step = 1;
        for (let x = -15; x <= 7; x += step){   
            for (let z = -6.5; z <= 6.5; z += step) {
                if (!this._checkObstacle(x, z)){
                    this._rawAdd(x, z, 'generic');
                } 
            }
        }

        this._autoConnect(2.2);
        specialPoints.forEach(([type, point]) =>{
            this._rawAdd(point.x, point.z, type)
            this._connectSpecialPointsFrontBack(point)
        })
        shelfPoints.forEach((shelfPoint) => {
            this._rawAdd(shelfPoint.x, shelfPoint.z, 'shelf');
            this._connectSpecialPointsFrontBack(shelfPoint)
        });

        fridgePoints.forEach((fridgePoint) => {
            this._rawAdd(fridgePoint.x, fridgePoint.z, 'fridge');
            this._connectSpecialPointsRightLeft(fridgePoint)
        });
    }
    
    _rawAdd(x, z, type) {
        // dedup
        for (const node of this.nodes) if (Math.hypot(node.x - x, node.z - z) < 0.4) return node;
        const node = { id: uid(), x, z, type, edges: [] };
        this.nodes.push(node);
        return node;
    }

    _autoConnect(maxDist) {
        for (let i = 0; i < this.nodes.length; i++){
            for (let j = i + 1; j < this.nodes.length; j++) {
                const nodeA = this.nodes[i],
                nodeB = this.nodes[j];
                if (Math.hypot(nodeA.x - nodeB.x, nodeA.z - nodeB.z) < maxDist) {
                    let blocked = false;
                    for (let step = 0; step <= 1; step += 0.1) {
                        const midX = nodeA.x + (nodeB.x - nodeA.x) * step;
                        const midZ = nodeA.z + (nodeB.z - nodeA.z) * step;
                        if (this._checkObstacle(midX, midZ)) { blocked = true; break; }
                    }
                    if (!blocked) {
                        if (!nodeA.edges.includes(nodeB.id)) nodeA.edges.push(nodeB.id);
                        if (!nodeB.edges.includes(nodeA.id)) nodeB.edges.push(nodeA.id);
                    }
                }
            }
        }
    }

    _checkObstacle(x, z) {
        return OBSTACLE_POINTS.some(({ posStart, posEnd }) => {
            const x1 = Math.min(posStart[0].x, posEnd[0].x);
            const x2 = Math.max(posStart[0].x, posEnd[0].x);
            const z1 = Math.min(posStart[0].z, posStart[1].z);
            const z2 = Math.max(posEnd[0].z, posEnd[1].z);
            return x > x1 && x < x2 && z > z1 && z < z2;
        });
    }

_connectSpecialPointsRightLeft(specialPoint) {
    const specialNode = this.nodes.find(
        (node) => Math.hypot(node.x - specialPoint.x, node.z - specialPoint.z) < .4
    );
    if (!specialNode) return;

    let bestRow = null, bestDist = Infinity;
    OBSTACLE_POINTS.forEach((row) => {
        const x1 = Math.min(row.posStart[0].x, row.posEnd[0].x);
        const x2 = Math.max(row.posStart[0].x, row.posEnd[0].x);
        const mid = (x1 + x2) / 2;
        const dist = Math.abs(specialPoint.x - mid);
        if (dist < bestDist) {
            bestDist = dist;
            bestRow = { x1, x2 };
        }
    });
    if (!bestRow) return;
    
    const borderX = specialPoint.side === 'left' ? bestRow.x1 : bestRow.x2;
    const centerZ = specialPoint.z;
    
    [centerZ - 1, centerZ, centerZ + 1].forEach((borderZ) => {
        const borderNode = this.nodes.find(
            (node) => Math.abs(node.z - borderZ) < 0.1 && Math.abs(node.x - borderX) < 0.1
        );
        if (borderNode) this.linkNodes(specialNode, borderNode);
    });
}

    _connectSpecialPointsFrontBack(specialPoint) {
        const specialNode = this.nodes.find(
            (node) => Math.hypot(node.x - specialPoint.x, node.z - specialPoint.z) < 0.4
        );
        if (!specialNode) return;

        let bestRow = null, bestDist = Infinity;
        OBSTACLE_POINTS.forEach((row) => {
            const z1 = Math.min(row.posStart[0].z, row.posStart[1].z);
            const z2 = Math.max(row.posEnd[0].z, row.posEnd[1].z);
            const mid = (z1 + z2) / 2;
            const dist = Math.abs(specialPoint.z - mid);
            if (dist < bestDist) {
                bestDist = dist;
                bestRow = { z1, z2 };
            }
        });
        if (!bestRow) return;

        const borderZ = specialPoint.side === 'back' ? bestRow.z1 : bestRow.z2;
        const centerX = Math.round(specialPoint.x);

        [centerX - 1, centerX, centerX + 1].forEach((borderX) => {
            const borderNode = this.nodes.find(
                (node) => Math.abs(node.x - borderX) < 0.1 && Math.abs(node.z - borderZ) < 0.1
            );
            if (borderNode) this.linkNodes(specialNode, borderNode);
        });
    }

    _los(nodeA, nodeB) {
        for (let i = 1; i < 16; i++) {
            const step = i / 16;
            if (inObs(nodeA.x + (nodeB.x - nodeA.x) * step, nodeA.z + (nodeB.z - nodeA.z) * step, 0.1)) return false;
        }
        return true;
    }

    getNode(id) {
        return this.nodes.find((node) => node.id === id);
    }

    addNode(x, z, type = 'generic') {
      if (inObs(x, z, 0.15)) return null;
      const node = this._rawAdd(x, z, type);
      this._connect(node, 2.2);
      return node;
    }

    removeNode(id) {
      this.nodes = this.nodes.filter((node) => node.id !== id);
      this.nodes.forEach((node) => (node.edges = node.edges.filter((edgeId) => edgeId !== id)));
    }

    linkNodes(nodeA, nodeB) {
      if (!nodeA || !nodeB) return;
      if (!nodeA.edges.includes(nodeB.id)) nodeA.edges.push(nodeB.id);
      if (!nodeB.edges.includes(nodeA.id)) nodeB.edges.push(nodeA.id);
    }

    nearest(x, z, type = null) {
        let best = null,
        bestDist = Infinity;
        for (const node of this.nodes) {
            if (type && node.type !== type && node.type !== 'generic') continue;
            const dist = Math.hypot(node.x - x, node.z - z);
            if (dist < bestDist) {
                bestDist = dist;
                best = node;
            }
        }
        return best;
    }
    
    astar(startId, goalId) {
        if (startId === goalId) return [startId];
            const goal = this.getNode(goalId);
        if (!goal) return [];
        const heuristic = (id) => {
            const node = this.getNode(id);
            return node ? Math.hypot(node.x - goal.x, node.z - goal.z) : 1e9;
        };
        const openSet = new Map([[startId, true]]);
        const closedSet = new Set();
        const gScore = new Map([[startId, 0]]);
        const fScore = new Map([[startId, heuristic(startId)]]);
        const cameFrom = new Map();
        while (openSet.size) {
            let current = null,
            lowestFScore = 1e9;
            for (const [id] of openSet) {
                const score = fScore.get(id) ?? 1e9;
                if (score < lowestFScore) {
                    lowestFScore = score;
                    current = id;
                }
            }
            if (current === goalId) {
                const path = [];
                let step = current;
                while (cameFrom.has(step)) {
                    path.unshift(step);
                    step = cameFrom.get(step);
                }
                path.unshift(startId);
                return path;
            }
            openSet.delete(current);
            closedSet.add(current);
            const node = this.getNode(current);
        if (!node) continue;
        for (const neighborId of node.edges) {
            if (closedSet.has(neighborId)) continue;
            const neighbor = this.getNode(neighborId);
            if (!neighbor) continue;
            const tentativeGScore = (gScore.get(current) ?? 1e9) + Math.hypot(node.x - neighbor.x, node.z - neighbor.z);
            if (tentativeGScore < (gScore.get(neighborId) ?? 1e9)) {
                cameFrom.set(neighborId, current);
                gScore.set(neighborId, tentativeGScore);
                fScore.set(neighborId, tentativeGScore + heuristic(neighborId));
                openSet.set(neighborId, true);
                }
            }
        }
        return [];
    }       

    pathXZ(fromX, fromZ, toX, toZ) {
        const startNode = this.nearest(fromX, fromZ),
        goalNode = this.nearest(toX, toZ);
        if (!startNode || !goalNode) return [{ x: toX, z: toZ }];
        const ids = this.astar(startNode.id, goalNode.id);
        const points = ids
        .map((id) => {
            const node = this.getNode(id);
            return node ? { x: node.x, z: node.z } : null;
        })
        .filter(Boolean);
        points.push({ x: toX, z: toZ });
        return points;
    }
      
    _connect(node, maxDist) {
        for (const other of this.nodes) {
          if (other.id === node.id) continue;
          if (Math.hypot(other.x - node.x, other.z - node.z) < maxDist && this._los(node, other)) {
            if (!node.edges.includes(other.id)) node.edges.push(other.id);
            if (!other.edges.includes(node.id)) other.edges.push(node.id);
          }
        }
    }
}

export const WP_COLOR = {
  generic: '#4488ff',
  shelf: '#ffaa22',
  pos: '#ff44ff',
  atm: '#ff44aa',
  exit: '#44ff88',
  spawn: '#88ff44',
  break: '#ff8844',
  stock: '#aaff44',
  waiting: '#aaaaaa',
};