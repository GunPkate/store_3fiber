import { inObs } from "../../config/storeLayout/storeLayoutLv1";
import { Npc } from "./Npc";

export const TASK_PRI = { cashier: 100, assistCustomer: 80, restock: 60, cleaningFloor: 40, patrol: 20, idle: 0 };
export const ROLE_TASK = { cashier: 'patrol', floorStaff: 'cleaningFloor', stocker: 'restock' };

export class Employee extends Npc {
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