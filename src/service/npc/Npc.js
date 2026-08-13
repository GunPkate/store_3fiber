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
    this._wanderTimer = 0;
    this._wanderTarget = null;
    // label text shown above head, kept up to date by subclasses
    this.label = '';
    this.labelColor = '#88ff88';
  }

  get graph() {
    return this.engine.graph;
  }

  moveTo(targetX, targetZ) {
    this.path = this.graph.pathXZ(this.x, this.z, targetX, targetZ);
    this.pathIdx = 0;
  }

  isAtTarget() {
    return !this.path || this.pathIdx >= this.path.length;
  }

  _followPath(dt) {
    if (this.isAtTarget()) return;
    const target = this.path[this.pathIdx];
    const deltaX = target.x - this.x,
      deltaZ = target.z - this.z;
    const dist = Math.hypot(deltaX, deltaZ);
    const step = this.speed * dt;

    // Stuck detection: if this NPC hasn't gotten measurably closer to its
    // current waypoint for a while, it's likely wedged against an obstacle
    // (e.g. a bad graph edge or an offset that lands inside a collision box).
    // Logs which NPC and what it was doing, since neither is visible from
    // the generic path array alone.
    if (this._lastStuckDist === undefined || dist < this._lastStuckDist - 0.02) {
      this._lastStuckDist = dist;
      this._stuckTimer = 0;
    } else {
      this._stuckTimer = (this._stuckTimer || 0) + dt;
      if (this._stuckTimer > 2 && !this._loggedStuck) {
        const activity = this.curTask ?? this.state ?? 'unknown';
        console.warn(
          `[stuck] ${this.name} (${this.type}) stuck during "${activity}" at ` +
          `(${this.x.toFixed(1)}, ${this.z.toFixed(1)}) heading to (${target.x}, ${target.z})`
        );
        this._loggedStuck = true;
      }
    }

    if (dist < step + 0.05) {
      this.x = target.x;
      this.z = target.z;
      this.pathIdx++;
      this._stuckTimer = 0;
      this._loggedStuck = false;
      this._lastStuckDist = undefined;
    } else {
      this.x += (deltaX / dist) * step;
      this.z += (deltaZ / dist) * step;
    }
    if (dist > 0.05) {
      this.rotationY = Math.atan2(deltaX, deltaZ);
    }
  }

  /** Path points still ahead, for the optional path-trail visual. */
  remainingPath() {
    if (!this.path || this.pathIdx >= this.path.length) return null;
    const points = [{ x: this.x, z: this.z }];
    for (let i = this.pathIdx; i < this.path.length; i++) points.push(this.path[i]);
    return points;
  }

  wander(dt, centerX, centerZ, range) {
    this._wanderTimer -= dt;
    if (this._wanderTimer <= 0 || !this._wanderTarget) {
      const angle = Math.random() * Math.PI * 2,
        radius = 0.5 + Math.random() * range;
      const targetX = centerX + Math.cos(angle) * radius,
        targetZ = centerZ + Math.sin(angle) * radius;
      if (!inObs(targetX, targetZ, 0.2)) {
        this._wanderTarget = { x: targetX, z: targetZ };
        this.moveTo(targetX, targetZ);
      }
      this._wanderTimer = 1.5 + Math.random() * 2.5;
    }
    this._followPath(dt);
  }

  dispose() {}
}