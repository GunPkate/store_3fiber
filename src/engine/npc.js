import { uid } from './uid.js';
import { inObs } from './storeData.js';

export const SPEED = 2.8;

// ══════════════════════════════════════════════════════════
// NPC BASE — pure simulation state (x, z, path, state machine).
// Rendering is handled separately by <NPCAvatar/> in React.
// `engine` gives access to shared systems: graph, items, time, events…
// ══════════════════════════════════════════════════════════
export class NPC3D {
  constructor(engine, type, x, z) {
    this.engine = engine;
    this.id = uid();
    this.type = type;
    this.x = x;
    this.z = z;
    this.rotationY = 0;
    this.path = [];
    this.pathIdx = 0;
    this.speed = SPEED + (Math.random() * 0.6 - 0.3);
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

  dispose() {
    // nothing to dispose on the simulation side; React unmounts the avatar.
  }
}

// ══════════════════════════════════════════════════════════
// CUSTOMER
// ══════════════════════════════════════════════════════════
export class Customer extends NPC3D {
  constructor(engine, x, z) {
    super(engine, 'customer', x, z);
    this.color = `hsl(${Math.floor(Math.random() * 360)}, 65%, 60%)`;
    this.capital = {
      npcId: this.id,
      cash: (200 + Math.random() * 600) | 0,
      bankAccount: [{ bank: 'KBB', amount: (300 + Math.random() * 1500) | 0 }],
    };
    const ITEMS = engine.items;
    const ni = 1 + Math.floor(Math.random() * 4);
    const shuffled = [...ITEMS].sort(() => Math.random() - 0.5).slice(0, ni);
    this.wantedItem = {
      npcId: this.id,
      item: shuffled.map((s) => ({ name: s.name, qty: 1 + Math.floor(Math.random() * 4) })),
    };
    this.cart = [];
    this.decision = { npcId: this.id, state: 'buying' };
    this._itemIdx = 0;
    this._thinkTimer = 0;
    this._posJoin = null;
  }
  get state() {
    return this.decision.state;
  }
  set state(s) {
    this.decision.state = s;
  }
  curItem() {
    return this.wantedItem.item[this._itemIdx] || null;
  }
  shelfFor(name) {
    const i = this.engine.items.findIndex((s) => s.name === name);
    return i >= 0 ? this.engine.SHELF3D[i] : null;
  }
  getTooltipLines() {
    return [
      'Customer',
      `State: ${this.state}`,
      `Cash: $${this.capital.cash | 0}`,
      `Cart: ${this.cart.length} items`,
      `Wants: ${this.wantedItem.item.map((i) => i.name).join(', ')}`,
    ];
  }

  update(dt) {
    this.label = `$${this.capital.cash | 0}`;
    this.labelColor = '#88ff88';
    switch (this.state) {
      case 'buying':
        this._buying(dt);
        break;
      case 'thinking':
        this._thinking(dt);
        break;
      case 'checkingout':
        this._checkout(dt);
        break;
      case 'withdrawing':
        this._withdraw(dt);
        break;
      case 'done':
        this._done(dt);
        break;
    }
  }
  _buying(dt) {
    const eng = this.engine;
    const item = this.curItem();
    if (!item) {
      this.state = 'checkingout';
      this.moveTo(eng.POS3D.x, eng.POS3D.z);
      if (!this._posJoin) this._posJoin = eng.gameTime;
      return;
    }
    const shelf = this.shelfFor(item.name);
    if (!shelf) {
      this._skipItem();
      return;
    }
    if (!this.isAtTarget()) {
      this._followPath(dt);
      return;
    }
    // at shelf
    const si = eng.items.find((s) => s.name === item.name);
    if (!si || si.qty <= 0) {
      if (Math.random() > 0.5) {
        const emp = eng.findAvailEmp();
        if (emp) {
          emp.checkStockByCustomer(this, item.name);
          this.state = 'thinking';
          return;
        }
      }
      this._skipItem();
      return;
    }
    const qty = Math.min(item.qty, si.qty);
    si.qty -= qty;
    this.cart.push({ name: item.name, qty, price: si.price, total: si.price * qty });
    this._itemIdx++;
    this.state = 'thinking';
    this._thinkTimer = 0.4 + Math.random() * 0.8;
  }
  _skipItem() {
    this._itemIdx++;
    this.state = 'thinking';
    this._thinkTimer = 0.3;
  }
  _thinking(dt) {
    const eng = this.engine;
    this.wander(dt, this.x, this.z, 0.8);
    this._thinkTimer -= dt;
    if (this._thinkTimer > 0) return;
    if (this._itemIdx < this.wantedItem.item.length) {
      const next = this.wantedItem.item[this._itemIdx];
      const si = eng.items.find((s) => s.name === next?.name);
      const needed = si ? si.price * next.qty : 0;
      if (needed > 0 && this.capital.cash < needed) {
        this.state = 'withdrawing';
        this.moveTo(eng.ATM3D.x, eng.ATM3D.z);
      } else {
        const shelf = this.shelfFor(next.name);
        if (shelf) this.moveTo(shelf.x, shelf.z);
        this.state = 'buying';
      }
    } else {
      const total = this.cart.reduce((s, c) => s + c.total, 0);
      if (this.capital.cash < total) {
        this.state = 'withdrawing';
        this.moveTo(eng.ATM3D.x, eng.ATM3D.z);
      } else {
        this.state = 'checkingout';
        this.moveTo(eng.POS3D.x, eng.POS3D.z);
        if (!this._posJoin) this._posJoin = eng.gameTime;
      }
    }
  }
  _checkout(dt) {
    if (!this.isAtTarget()) {
      this._followPath(dt);
      return;
    }
    if (!this._posJoin) this._posJoin = this.engine.gameTime;
    // wait in POS queue (handled by POS manager)
  }
  _withdraw(dt) {
    if (!this.isAtTarget()) {
      this._followPath(dt);
      return;
    }
    for (const acc of this.capital.bankAccount) {
      if (acc.amount > 0) {
        const w = Math.min(acc.amount, (300 + Math.random() * 500) | 0);
        acc.amount -= w;
        this.capital.cash += w;
        break;
      }
    }
    if (this._itemIdx < this.wantedItem.item.length) {
      const next = this.wantedItem.item[this._itemIdx];
      const shelf = this.shelfFor(next?.name);
      if (shelf) {
        this.moveTo(shelf.x, shelf.z);
        this.state = 'buying';
      } else this._skipItem();
    } else {
      this.state = 'checkingout';
      this.moveTo(this.engine.POS3D.x, this.engine.POS3D.z);
    }
  }
  _done(dt) {
    if (!this.isAtTarget()) this._followPath(dt);
    else this.engine.npcsToRemove.push(this.id);
  }
  completePurchase() {
    const eng = this.engine;
    const total = this.cart.reduce((s, c) => s + c.total, 0);
    this.capital.cash -= total;
    eng.revenue += total;
    eng.served++;
    if (this._posJoin) eng.totalWait += eng.gameTime - this._posJoin;
    this.state = 'done';
    this.moveTo(eng.EXIT3D.x, eng.EXIT3D.z);
    eng.addEvt(`💳 Customer paid $${total.toFixed(2)}`);
  }
}

// ══════════════════════════════════════════════════════════
// EMPLOYEE
// ══════════════════════════════════════════════════════════
export const TASK_PRI = { cashier: 100, assistCustomer: 80, restock: 60, cleaningFloor: 40, patrol: 20, idle: 0 };
export const ROLE_TASK = { cashier: 'patrol', floorStaff: 'cleaningFloor', stocker: 'restock' };

export class Employee extends NPC3D {
  constructor(engine, x, z) {
    super(engine, 'employee', x, z);
    this.bodyColor = '#2255cc';
    this.headColor = '#ffd699';
    const roles = ['cashier', 'floorStaff', 'stocker'];
    this.role = { npcId: this.id, role: roles[Math.floor(Math.random() * roles.length)] };
    this.task = { npcId: this.id, task: 'idle' };
    this.previousTask = { npcId: this.id, task: 'idle' };
    this.decision = { npcId: this.id, state: 'working' };
    this._tTimer = 0;
    this._patrolIdx = 0;
    this._posWait = 0;
    this._restockIdx = 0;
    this._restockPhase = '';
    this._custHelp = null;
  }
  get state() {
    return this.decision.state;
  }
  set state(s) {
    this.decision.state = s;
  }
  get curTask() {
    return this.task.task;
  }
  setTask(t) {
    this.previousTask.task = this.task.task;
    this.task.task = t;
    this._tTimer = 0;
    this._initTask();
  }
  restoreTask() {
    this.task.task = this.previousTask.task;
    this._initTask();
  }
  assignTask(t) {
    if ((TASK_PRI[t] ?? -1) >= (TASK_PRI[this.curTask] ?? 0)) this.setTask(t);
  }
  getTooltipLines() {
    return ['Employee', `Role: ${this.role.role}`, `Task: ${this.curTask}`, `State: ${this.state}`];
  }

  _initTask() {
    const eng = this.engine;
    switch (this.curTask) {
      case 'cashier':
        this.moveTo(eng.POS3D.x + 1.5, eng.POS3D.z + 0.5);
        break;
      case 'idle':
        this.moveTo(eng.WAIT3D.x + Math.random() * 0.8 - 0.4, eng.WAIT3D.z + Math.random() * 0.8 - 0.4);
        break;
      case 'patrol':
        this._patrolIdx = 0;
        this._nextPatrol();
        break;
      case 'cleaningFloor':
        break;
      case 'restock':
        this._startRestock();
        break;
    }
  }
  _nextPatrol() {
    const pts = [
      { x: -4, z: -2 },
      { x: 3, z: -2 },
      { x: 5, z: 0 },
      { x: 0, z: 2 },
      { x: -4, z: 2 },
    ];
    const p = pts[this._patrolIdx % pts.length];
    this.moveTo(p.x, p.z);
    this._patrolIdx++;
  }
  _startRestock() {
    const eng = this.engine;
    let minQ = Infinity,
      target = 0;
    eng.items.forEach((s, i) => {
      if (s.qty < s.maxQty * 0.6 && s.qty < minQ) {
        minQ = s.qty;
        target = i;
      }
    });
    this._restockIdx = target;
    this._restockPhase = 'toStock';
    this.moveTo(eng.STOCK3D.x, eng.STOCK3D.z);
  }
  checkStockByCustomer(cust, itemName) {
    const si = this.engine.items.find((s) => s.name === itemName);
    if (!si) return;
    this.state = 'occupied';
    this._custHelp = cust;
    this.setTask('restock');
  }
  update(dt) {
    this.label = `${this.role.role[0].toUpperCase()} ${this.curTask}`;
    this.labelColor = '#88aaff';
    this._checkPOSNeed(dt);
    if (this.state === 'break') {
      this.wander(dt, this.engine.BREAK3D.x, this.engine.BREAK3D.z, 0.8);
      this._tTimer -= dt;
      if (this._tTimer <= 0) {
        this.state = 'working';
        this._initTask();
      }
      return;
    }
    switch (this.curTask) {
      case 'cashier':
        this._updateCashier(dt);
        break;
      case 'cleaningFloor':
        this._updateClean(dt);
        break;
      case 'patrol':
        this._updatePatrol(dt);
        break;
      case 'restock':
        this._updateRestock(dt);
        break;
      case 'idle':
        this.wander(dt, this.engine.WAIT3D.x, this.engine.WAIT3D.z, 0.8);
        break;
    }
  }
  _checkPOSNeed(dt) {
    const eng = this.engine;
    if (eng.posQueue.length > 0 && this.curTask !== 'cashier' && this.state !== 'occupied') {
      const hasCashier = eng.npcs.some(
        (n) => n.type === 'employee' && n.curTask === 'cashier' && n.state !== 'break'
      );
      if (!hasCashier) {
        this.assignTask('cashier');
        this._posWait = 0;
      }
    }
    if (this.curTask === 'cashier' && eng.posQueue.length === 0) {
      this._posWait += dt;
      if (this._posWait > 5) {
        this.restoreTask();
        this._posWait = 0;
      }
    } else this._posWait = 0;
  }
  _updateCashier(dt) {
    console.log("Start update")
    const eng = this.engine;
    if (!this.isAtTarget()) {
      this._followPath(dt);
      console.log("Follow target")
      return;
    }
    if (eng.posQueue.length > 0) {
      const cust = eng.posQueue[0];
      console.log("Pos Q target state"+cust.state)
      console.log("Pos Q target Target"+cust.isAtTarget())
      if (cust.state === 'checkingout' ) {
        console.log("checkingout")
        this._tTimer += dt;
        if (this._tTimer > 2) {
          eng.posQueue.shift();
          cust.completePurchase();
          this._tTimer = 0;
        }
      }
    }
  }
  _updateClean(dt) {
    if (this.isAtTarget()) {
      let tx, tz;
      do {
        tx = -7 + Math.random() * 14;
        tz = -5 + Math.random() * 11;
      } while (inObs(tx, tz, 0.3));
      this.moveTo(tx, tz);
    }
    this._followPath(dt);
  }
  _updatePatrol(dt) {
    if (this.isAtTarget()) this._nextPatrol();
    this._followPath(dt);
  }
  _updateRestock(dt) {
    const eng = this.engine;
    if (!this.isAtTarget()) {
      this._followPath(dt);
      return;
    }
    if (this._restockPhase === 'toStock') {
      this._restockPhase = 'toShelf';
      const sc = eng.SHELF3D[this._restockIdx];
      if (sc) this.moveTo(sc.x, sc.z);
    } else if (this._restockPhase === 'toShelf') {
      const si = eng.items[this._restockIdx];
      if (si) {
        si.qty = si.maxQty;
        eng.addEvt(`📦 ${this.role.role} restocked ${si.name}`);
      }
      if (this.state === 'occupied') {
        this.state = 'working';
        this._custHelp = null;
      }
      this.restoreTask();
    }
  }
}
