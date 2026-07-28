import { FLOOR_D, FLOOR_W, inObs, OBSTACLE_POINTS } from "../../../config/storeLayout/storeLayoutLv1";
import { uid } from "../uid";

export class WpGraph {
    constructor(specialPoints, shelfPoints) {
        this.nodes = [];
        this._build(specialPoints, shelfPoints);
    }

    _build(specialPoints, shelfPoints) {
        const step = 1;
        for (let x = -15; x <= 7; x += step){   
            for (let z = -6.5; z <= 6.5; z += step) {
                    this._rawAdd(x, z, 'generic');
            }
        }

        this._autoConnect(2.2);
        specialPoints.forEach(([t, p]) => this._rawAdd(p.x, p.z, t));
        shelfPoints.forEach((s) => {
            this._rawAdd(s.x, s.z, 'shelf');
            this._connectSpecialPoints(s)
        });
    }

    _rawAdd(x, z, type) {
        // dedup
        for (const n of this.nodes) if (Math.hypot(n.x - x, n.z - z) < 0.4) return n;
        const node = { id: uid(), x, z, type, edges: [] };
        this.nodes.push(node);
        return node;
    }

    _autoConnect(maxD) {
        for (let i = 0; i < this.nodes.length; i++){
            for (let j = i + 1; j < this.nodes.length; j++) {
                const a = this.nodes[i],
                b = this.nodes[j];
                if (Math.hypot(a.x - b.x, a.z - b.z) < maxD) {
                    let blocked = false;
                    for (let t = 0; t <= 1; t += 0.1) {
                        const mx = a.x + (b.x - a.x) * t;
                        const mz = a.z + (b.z - a.z) * t;
                        if (this._checkObstacle(mx, mz)) { blocked = true; break; }
                    }
                    if (!blocked) {
                        if (!a.edges.includes(b.id)) a.edges.push(b.id);
                        if (!b.edges.includes(a.id)) b.edges.push(a.id);
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

    _connectSpecialPoints(sp) {
        const shelfNode = this.nodes.find(
            (n) => Math.hypot(n.x - sp.x, n.z - sp.z) < 0.4
        );
        if (!shelfNode) return;

        let bestRow = null, bestDist = Infinity;
        OBSTACLE_POINTS.forEach((row) => {
            const z1 = Math.min(row.posStart[0].z, row.posStart[1].z);
            const z2 = Math.max(row.posEnd[0].z, row.posEnd[1].z);
            const mid = (z1 + z2) / 2;
            const d = Math.abs(sp.z - mid);
            if (d < bestDist) {
                bestDist = d;
                bestRow = { z1, z2 };
            }
        });
        if (!bestRow) return;

        const borderZ = sp.side === 'back' ? bestRow.z1 : bestRow.z2;
        const cx = Math.round(sp.x);

        [cx - 1, cx, cx + 1].forEach((bx) => {
            const borderNode = this.nodes.find(
                (n) => Math.abs(n.x - bx) < 0.1 && Math.abs(n.z - borderZ) < 0.1
            );
            if (borderNode) this.linkNodes(shelfNode, borderNode);
        });
    }

    _los(a, b) {
        for (let i = 1; i < 16; i++) {
            const t = i / 16;
            if (inObs(a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t, 0.1)) return false;
        }
        return true;
    }

    getNode(id) {
        return this.nodes.find((n) => n.id === id);
    }

    addNode(x, z, type = 'generic') {
      if (inObs(x, z, 0.15)) return null;
      const n = this._rawAdd(x, z, type);
      this._connect(n, 2.2);
      return n;
    }

    removeNode(id) {
      this.nodes = this.nodes.filter((n) => n.id !== id);
      this.nodes.forEach((n) => (n.edges = n.edges.filter((e) => e !== id)));
    }

    linkNodes(a, b) {
      if (!a || !b) return;
      if (!a.edges.includes(b.id)) a.edges.push(b.id);
      if (!b.edges.includes(a.id)) b.edges.push(a.id);
    }

    nearest(x, z, type = null) {
        let best = null,
        bd = Infinity;
        for (const n of this.nodes) {
            if (type && n.type !== type && n.type !== 'generic') continue;
            const d = Math.hypot(n.x - x, n.z - z);
            if (d < bd) {
                bd = d;
                best = n;
            }
        }
        return best;
    }
    
    astar(startId, goalId) {
        if (startId === goalId) return [startId];
            const goal = this.getNode(goalId);
        if (!goal) return [];
        const h = (id) => {
            const n = this.getNode(id);
            return n ? Math.hypot(n.x - goal.x, n.z - goal.z) : 1e9;
        };
        const open = new Map([[startId, true]]);
        const closed = new Set();
        const g = new Map([[startId, 0]]);
        const f = new Map([[startId, h(startId)]]);
        const came = new Map();
        while (open.size) {
            let cur = null,
            cf = 1e9;
            for (const [id] of open) {
                const fv = f.get(id) ?? 1e9;
                if (fv < cf) {
                    cf = fv;
                    cur = id;
                }
            }
            if (cur === goalId) {
                const path = [];
                let c = cur;
                while (came.has(c)) {
                    path.unshift(c);
                    c = came.get(c);
                }
                path.unshift(startId);
                return path;
            }
            open.delete(cur);
            closed.add(cur);
            const node = this.getNode(cur);
        if (!node) continue;
        for (const nid of node.edges) {
            if (closed.has(nid)) continue;
            const nb = this.getNode(nid);
            if (!nb) continue;
            const ng = (g.get(cur) ?? 1e9) + Math.hypot(node.x - nb.x, node.z - nb.z);
            if (ng < (g.get(nid) ?? 1e9)) {
                came.set(nid, cur);
                g.set(nid, ng);
                f.set(nid, ng + h(nid));
                open.set(nid, true);
                }
            }
        }
        return [];
    }       

    pathXZ(fx, fz, tx, tz) {
        const sn = this.nearest(fx, fz),
        gn = this.nearest(tx, tz);
        if (!sn || !gn) return [{ x: tx, z: tz }];
        const ids = this.astar(sn.id, gn.id);
        const pts = ids
        .map((id) => {
            const n = this.getNode(id);
            return n ? { x: n.x, z: n.z } : null;
        })
        .filter(Boolean);
        pts.push({ x: tx, z: tz });
        return pts;
    }
      
    _connect(node, maxD) {
        for (const n of this.nodes) {
          if (n.id === node.id) continue;
          if (Math.hypot(n.x - node.x, n.z - node.z) < maxD && this._los(node, n)) {
            if (!node.edges.includes(n.id)) node.edges.push(n.id);
            if (!n.edges.includes(node.id)) n.edges.push(node.id);
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