import { uid } from "uid";
import { OBS3D, ATM3D, POS3D, EXIT3D, SPAWN3D, BREAK3D, STOCK3D, WAIT3D, SHELF3D } from '../components/store/layout';

export class WPGraph {
    constructor() { this.nodes = []; this.build(); }

    inObs(px,pz,margin=.25){
        for(const o of OBS3D){
            if(px>=o.x-o.hw-margin&&px<=o.x+o.hw+margin&&pz>=o.z-o.hd-margin&&pz<=o.z+o.hd+margin) return true;
        }
        return false;
    }

    build() {
        const step = 1.3;
        for (let x = -7.5; x <= 7.5; x += step) for (let z = -5.5; z <= 6.5; z += step) {
            if (!this.inObs(x, z, .2)) this.rawAdd(x, z, 'generic');
        }
        // special nodes
        [
            ['atm', ATM3D],
            ['pos', POS3D],
            ['exit', EXIT3D],
            ['spawn', SPAWN3D],
            ['break', BREAK3D],
            ['stock', STOCK3D],
            ['waiting', WAIT3D]
        ].forEach(([t, p]) => this.rawAdd(p.x, p.z, t));
        SHELF3D.forEach(s => this.rawAdd(s.x, s.z, 'shelf'));
        this.autoConnect(2.2);
    }

    rawAdd(x, z, type) {
        // dedup
        for (const n of this.nodes) {
            if (Math.hypot(n.x - x, n.z - z) < .4)
                return n;
        }
        const node = { id: uid(), x, z, type, edges: [] };
        this.nodes.push(node);
        return node;
    }

    addNode(x, z, type = 'generic') {
        if (this.inObs(x, z, .15)) return null;
        const n = this.rawAdd(x, z, type);
        this.connect(n, 2.2); return n;
    }

    removeNode(id) {
        this.nodes = this.nodes.filter(n => n.id !== id);
        this.nodes.forEach(n => n.edges = n.edges.filter(e => e !== id));
    }

    linkNodes(a, b) {
        if (!a || !b) return;
        if (!a.edges.includes(b.id)) {
            a.edges.push(b.id);
        }
        if (!b.edges.includes(a.id)) {
            b.edges.push(a.id);
        }
    }

    getNode(id) {
        return this.nodes.find(n => n.id === id);
    }

    nearest(x, z, type = null) {
        let best = null, bd = Infinity;
        for (const n of this.nodes) {
            if (type && n.type !== type && n.type !== 'generic') continue;
            const d = Math.hypot(n.x - x, n.z - z); if (d < bd) { bd = d; best = n; }
        }
        return best;
    }

    los(a, b) {
        for (let i = 1; i < 16; i++) { const t = i / 16; if (this.inObs(a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t, .1)) return false; } return true;
    }

    autoConnect(maxD) {
        for (let i = 0; i < this.nodes.length; i++) for (let j = i + 1; j < this.nodes.length; j++) {
            const a = this.nodes[i], b = this.nodes[j];
            if (Math.hypot(a.x - b.x, a.z - b.z) < maxD && this.los(a, b)) {
                if (!a.edges.includes(b.id)) a.edges.push(b.id);
                if (!b.edges.includes(a.id)) b.edges.push(a.id);
            }
        }
    }

    connect(node, maxD) {
        for (const n of this.nodes) {
            if (n.id === node.id) continue;
            if (Math.hypot(n.x - node.x, n.z - node.z) < maxD && this.los(node, n)) {
                if (!node.edges.includes(n.id)) node.edges.push(n.id);
                if (!n.edges.includes(node.id)) n.edges.push(node.id);
            }
        }
    }

    astar(startId, goalId) {
        if (startId === goalId) return [startId];
        const goal = this.getNode(goalId); if (!goal) return [];
        const h = id => { const n = this.getNode(id); return n ? Math.hypot(n.x - goal.x, n.z - goal.z) : 1e9; };
        const open = new Map([[startId, true]]);
        const closed = new Set();
        const g = new Map([[startId, 0]]);
        const f = new Map([[startId, h(startId)]]);
        const came = new Map();
        while (open.size) {
            let cur = null, cf = 1e9;
            for (const [id] of open) { const fv = f.get(id) ?? 1e9; if (fv < cf) { cf = fv; cur = id; } }
            if (cur === goalId) {
                const path = []; let c = cur;
                while (came.has(c)) { path.unshift(c); c = came.get(c); }
                path.unshift(startId); return path;
            }
            open.delete(cur); closed.add(cur);
            const node = this.getNode(cur); if (!node) continue;
            for (const nid of node.edges) {
                if (closed.has(nid)) continue;
                const nb = this.getNode(nid); if (!nb) continue;
                const ng = (g.get(cur) ?? 1e9) + Math.hypot(node.x - nb.x, node.z - nb.z);
                if (ng < (g.get(nid) ?? 1e9)) {
                    came.set(nid, cur); g.set(nid, ng); f.set(nid, ng + h(nid)); open.set(nid, true);
                }
            }
        }
        return [];
    }
    
    pathXZ(fx, fz, tx, tz) {
        const sn = this.nearest(fx, fz), gn = this.nearest(tx, tz);
        if (!sn || !gn) return [{ x: tx, z: tz }];
        const ids = this.astar(sn.id, gn.id);
        const pts = ids.map(id => { const n = this.getNode(id); return n ? { x: n.x, z: n.z } : null; }).filter(Boolean);
        pts.push({ x: tx, z: tz }); return pts;
    }
}