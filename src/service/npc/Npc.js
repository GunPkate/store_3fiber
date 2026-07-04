import { inObs } from "../../config/storeLayout/storeLayoutLv1";
import { uid } from "../engine/uid";

export class Npc {
  constructor(engine, type, x, z) {
    this.engine = engine;
    this.id = uid();
    this.type = type;
    this.x = x;
    this.z = z;
    this.rotationY = 0;
    this.path = [];
    this.pathIdx = 0;
    this.speed = 2.8 + (Math.random() * 0.6 - 0.3);
    this._wTimer = 0;
    this._wTarget = null;
    // label text shown above head, kept up to date by subclasses
    this.label = '';
    this.labelColor = '#88ff88';
  }

  get graph() {
    return this.engine.graph;
  }

  moveTo(tx, tz) {
    this.path = this.graph.pathXZ(this.x, this.z, tx, tz);
    this.pathIdx = 0;
  }

  isAtTarget() {
    return !this.path || this.pathIdx >= this.path.length;
  }

  _followPath(dt) {
    if (this.isAtTarget()) return;
    const tgt = this.path[this.pathIdx];
    const dx = tgt.x - this.x,
      dz = tgt.z - this.z;
    const dist = Math.hypot(dx, dz);
    const step = this.speed * dt;
    if (dist < step + 0.05) {
      this.x = tgt.x;
      this.z = tgt.z;
      this.pathIdx++;
    } else {
      this.x += (dx / dist) * step;
      this.z += (dz / dist) * step;
    }
    if (dist > 0.05) {
      this.rotationY = Math.atan2(dx, dz);
    }
  }

  /** Path points still ahead, for the optional path-trail visual. */
  remainingPath() {
    if (!this.path || this.pathIdx >= this.path.length) return null;
    const pts = [{ x: this.x, z: this.z }];
    for (let i = this.pathIdx; i < this.path.length; i++) pts.push(this.path[i]);
    return pts;
  }

  wander(dt, cx, cz, range) {
    this._wTimer -= dt;
    if (this._wTimer <= 0 || !this._wTarget) {
      const ang = Math.random() * Math.PI * 2,
        r = 0.5 + Math.random() * range;
      const tx = cx + Math.cos(ang) * r,
        tz = cz + Math.sin(ang) * r;
      if (!inObs(tx, tz, 0.2)) {
        this._wTarget = { x: tx, z: tz };
        this.moveTo(tx, tz);
      }
      this._wTimer = 1.5 + Math.random() * 2.5;
    }
    this._followPath(dt);
  }

  dispose() {}
}