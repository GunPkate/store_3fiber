import { inObs } from "../../../config/storeLayout/storeLayoutLv1";
import { uid } from "../uid";

export class WpGraph {
    constructor(specialPoints, shelfPoints) {
        this.nodes = [];
        this._build(specialPoints, shelfPoints);
    }

    _build(specialPoints, shelfPoints) {
        const step = 1.3;
        for (let x = -7.5; x <= 7.5; x += step){   
            for (let z = -5.5; z <= 6.5; z += step) {
                if (!inObs(x, z, 0.2)) this._rawAdd(x, z, 'generic');
            }
        }
        // special nodes
        specialPoints.forEach(([t, p]) => this._rawAdd(p.x, p.z, t));
        shelfPoints.forEach((s) => this._rawAdd(s.x, s.z, 'shelf'));
        this._autoConnect(2.2);
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
                if (Math.hypot(a.x - b.x, a.z - b.z) < maxD && this._los(a, b)) {
                    if (!a.edges.includes(b.id)) a.edges.push(b.id);
                    if (!b.edges.includes(a.id)) b.edges.push(a.id);
                }
            }
        }
    }

    _los(a, b) {
        for (let i = 1; i < 16; i++) {
            const t = i / 16;
            if (inObs(a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t, 0.1)) return false;
        }
        return true;
    }

}

export const WP_COLOR = {
  generic: '#4488ff',
  shelf: '#ffaa22',
  pos: '#44aaff',
  atm: '#ff44aa',
  exit: '#44ff88',
  spawn: '#88ff44',
  break: '#ff8844',
  stock: '#aaff44',
  waiting: '#aaaaaa',
};