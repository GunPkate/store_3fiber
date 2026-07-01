import { WPGraph } from './graph.js';
import { Customer, Employee } from './npc.js';
import {
  inObs,
  createItems,
  SHELF3D,
  ATM3D,
  POS3D,
  EXIT3D,
  SPAWN3D,
  BREAK3D,
  STOCK3D,
  WAIT3D,
} from './storeData.js';

const DAY_REAL = 720; // seconds per game day (real time, before timeSpeed)
const DAY_GAME = 1440; // game-minutes per day

/**
 * GameEngine owns ALL simulation state and runs independently of React's
 * render cycle. React components read from it inside useFrame (for smooth
 * per-frame visuals) or subscribe to its pub/sub channels (for list
 * add/remove and HUD snapshots, throttled).
 */
export class GameEngine {
  constructor() {
    this.CFG = {
      customerLimit: 50,
      spawnInterval: 15, // game seconds
      showWP: false,
      showPaths: true,
      timeSpeed: 1,
    };

    this.items = createItems();
    this.SHELF3D = SHELF3D;
    this.ATM3D = ATM3D;
    this.POS3D = POS3D;
    this.EXIT3D = EXIT3D;
    this.SPAWN3D = SPAWN3D;
    this.BREAK3D = BREAK3D;
    this.STOCK3D = STOCK3D;
    this.WAIT3D = WAIT3D;

    this.graph = new WPGraph(
      [
        ['atm', ATM3D],
        ['pos', POS3D],
        ['exit', EXIT3D],
        ['spawn', SPAWN3D],
        ['break', BREAK3D],
        ['stock', STOCK3D],
        ['waiting', WAIT3D],
      ],
      SHELF3D
    );

    this.npcs = [];
    this.posQueue = [];
    this.npcsToRemove = [];
    this.custSpawnTimer = 0;

    this.day = 1;
    this.gameTime = 5 * 60; // start 05:00
    this.revenue = 0;
    this.served = 0;
    this.totalWait = 0;

    this.evts = [];

    this._npcListeners = new Set();
    this._graphListeners = new Set();

    // seed employees
    this.createNPC('employee', -1, 3.2);
    this.createNPC('employee', 1, 3.2);
    this.createNPC('employee', -3, 0.5);
    this.addEvt('🏪 Store initialized');
  }

  // ── pub/sub ─────────────────────────────────────────────
  onNpcsChange(cb) {
    this._npcListeners.add(cb);
    return () => this._npcListeners.delete(cb);
  }
  onGraphChange(cb) {
    this._graphListeners.add(cb);
    return () => this._graphListeners.delete(cb);
  }
  _notifyNpcs() {
    this._npcListeners.forEach((cb) => cb());
  }
  notifyGraphChange() {
    this._graphListeners.forEach((cb) => cb());
  }

  // ── time helpers ────────────────────────────────────────
  getHM() {
    const m = this.gameTime % DAY_GAME;
    return { h: Math.floor(m / 60), m: Math.floor(m % 60) };
  }
  fmtT() {
    const { h, m } = this.getHM();
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
  isOpen() {
    const { h } = this.getHM();
    return h >= 6 && h < 22;
  }
  shiftLabel() {
    const { h } = this.getHM();
    if (h >= 6 && h < 14) return 'SHIFT 1';
    if (h >= 14 && h < 22) return 'SHIFT 2';
    if (h === 5) return 'PRE-OPEN';
    if (h >= 22) return 'CLOSING';
    return 'CLOSED';
  }

  // ── events ──────────────────────────────────────────────
  addEvt(msg) {
    this.evts.unshift(`${this.fmtT()} ${msg}`);
    if (this.evts.length > 10) this.evts.pop();
  }

  // ── NPC management ──────────────────────────────────────
  findAvailEmp() {
    return this.npcs.find((n) => n.type === 'employee' && n.state !== 'occupied' && n.state !== 'break');
  }
  custInStore() {
    return this.npcs.filter((n) => n.type === 'customer' && n.state !== 'done').length;
  }
  createNPC(type, x, z) {
    const npc = type === 'customer' ? new Customer(this, x, z) : new Employee(this, x, z);
    this.npcs.push(npc);
    if (type === 'employee') this._initEmpTask(npc);
    this._notifyNpcs();
    return npc;
  }
  _initEmpTask(emp) {
    const cashiers = this.npcs.filter((n) => n.type === 'employee' && n.curTask === 'cashier').length;
    if (cashiers < 1 && emp.role.role === 'cashier') {
      emp.setTask('cashier');
      return;
    }
    const ROLE_TASK = { cashier: 'patrol', floorStaff: 'cleaningFloor', stocker: 'restock' };
    emp.setTask(ROLE_TASK[emp.role.role] || 'idle');
  }
  removeNPC(id) {
    const npc = this.npcs.find((n) => n.id === id);
    if (!npc) return;
    this.posQueue = this.posQueue.filter((c) => c.id !== id);
    npc.dispose();
    this.npcs = this.npcs.filter((n) => n.id !== id);
    this._notifyNpcs();
  }

  // ── POS queue ───────────────────────────────────────────
  updatePOS() {
    this.npcs.forEach((n) => {
      if (n.type === 'customer' && n.state === 'checkingout' && n.isAtTarget() && !this.posQueue.includes(n)) {
        this.posQueue.push(n);
      }
    });
    this.posQueue.forEach((c, i) => {
      const tx = this.POS3D.x - 2 + i * 1.1,
        tz = this.POS3D.z + 0.8;
      if (Math.hypot(c.x - tx, c.z - tz) > 0.3) c.moveTo(tx, tz);
    });
  }

  // ── spawning ────────────────────────────────────────────
  updateSpawn(dt) {
    if (!this.isOpen()) return;
    if (this.custInStore() >= this.CFG.customerLimit) return;
    this.custSpawnTimer += dt * (DAY_GAME / DAY_REAL); // advance in game-seconds
    if (this.custSpawnTimer >= this.CFG.spawnInterval) {
      this.custSpawnTimer = 0;
      const n = this.createNPC(
        'customer',
        this.SPAWN3D.x + (Math.random() * 0.6 - 0.3),
        this.SPAWN3D.z
      );
      const item = n.curItem();
      if (item) {
        const shelf = n.shelfFor(item.name);
        if (shelf) n.moveTo(shelf.x, shelf.z);
      }
      this.addEvt('👤 Customer entered');
    }
  }

  // ── waypoint tool actions ───────────────────────────────
  addWaypoint(x, z, type = 'generic') {
    if (inObs(x, z, 0.15)) return null;
    const n = this.graph.addNode(x, z, type);
    if (n) {
      this.addEvt('📍 Waypoint added');
      this.notifyGraphChange();
    } else {
      this.addEvt('⚠️ Blocked by obstacle');
    }
    return n;
  }
  removeWaypoint(id) {
    this.graph.removeNode(id);
    this.addEvt('🗑 WP removed');
    this.notifyGraphChange();
  }
  linkWaypoints(a, b) {
    this.graph.linkNodes(a, b);
    this.addEvt('🔗 Linked');
    this.notifyGraphChange();
  }
  setWaypointType(id, type) {
    const n = this.graph.getNode(id);
    if (n) {
      n.type = type;
      this.notifyGraphChange();
    }
  }

  // ── spawn / remove via tools ────────────────────────────
  spawnCustomerAt(x, z) {
    if (inObs(x, z, 0.2)) return null;
    if (this.custInStore() >= this.CFG.customerLimit) {
      this.addEvt('⚠️ Customer limit reached');
      return null;
    }
    const nc = this.createNPC('customer', x, z);
    const item = nc.curItem();
    if (item) {
      const shelf = nc.shelfFor(item.name);
      if (shelf) nc.moveTo(shelf.x, shelf.z);
    }
    this.addEvt('👤 Customer spawned');
    return nc;
  }
  spawnEmployeeAt(x, z) {
    if (inObs(x, z, 0.2)) return null;
    const e = this.createNPC('employee', x, z);
    this.addEvt('👷 Employee spawned');
    return e;
  }

  // ── master tick ─────────────────────────────────────────
  update(rawDt) {
    const dt = rawDt * this.CFG.timeSpeed;

    this.gameTime += dt * (DAY_GAME / DAY_REAL);
    if (this.gameTime >= this.day * DAY_GAME) {
      this.day++;
      this.addEvt(`🌅 Day ${this.day} begins`);
    }

    this.updateSpawn(rawDt); // raw dt avoids speed-multiplied spawn bursts
    this.npcs.forEach((n) => n.update(dt));
    this.updatePOS();

    if (this.npcsToRemove.length) {
      this.npcsToRemove.forEach((id) => this.removeNPC(id));
      this.npcsToRemove = [];
    }

    // auto restock check every 2 game hours
    if (Math.floor(this.gameTime) % 120 === 1) {
      this.npcs
        .filter((n) => n.type === 'employee' && n.role.role === 'stocker' && n.curTask !== 'restock')
        .forEach((e) => {
          if (this.items.some((s) => s.qty < s.maxQty * 0.4)) e.assignTask('restock');
        });
    }
  }

  // ── HUD snapshot (call at a throttled rate, not every frame) ──
  getSnapshot() {
    const custs = this.custInStore();
    const sq = this.items.reduce((s, i) => s + i.qty, 0);
    const mq = this.items.reduce((s, i) => s + i.maxQty, 0);
    const aw = this.served > 0 ? ((this.totalWait / this.served) * (DAY_REAL / DAY_GAME) * 60).toFixed(0) : 0;
    return {
      clock: this.fmtT(),
      day: this.day,
      shift: this.shiftLabel(),
      revenue: this.revenue,
      custCount: custs,
      posCount: this.posQueue.length,
      served: this.served,
      stockPct: mq > 0 ? Math.floor((sq / mq) * 100) : 0,
      avgWait: aw,
      customerLimit: this.CFG.customerLimit,
      employees: this.npcs
        .filter((n) => n.type === 'employee')
        .map((e) => ({ id: e.id, role: e.role.role, task: e.curTask, state: e.state })),
      events: this.evts.slice(0, 6),
    };
  }
}

export { DAY_REAL, DAY_GAME };
