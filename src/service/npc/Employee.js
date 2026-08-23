import { inObs } from "../../config/storeLayout/storeLayoutLv1";
import { Npc } from "./Npc";

export const TASK_PRI = { cashier: 100, assistCustomer: 80, restock: 60, cleaningFloor: 40, patrol: 20, idle: 0 };
export const ROLE_TASK = { cashier: 'patrol', floorStaff: 'cleaningFloor', stocker: 'restock' };

export class Employee extends Npc {
  constructor(engine, x, z, name) {
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
    this.name = name
  }
  get state() {
    return this.decision.state;
  }
  set state(newState) {
    this.decision.state = newState;
  }
  get curTask() {
    return this.task.task;
  }
  setTask(taskName) {
    this.previousTask.task = this.task.task;
    this.task.task = taskName;
    this._tTimer = 0;
    this._initTask();
  }
  restoreTask() {
    this.task.task = this.previousTask.task;
    this._initTask();
  }
  assignTask(taskName) {
    if ((TASK_PRI[taskName] ?? -1) >= (TASK_PRI[this.curTask] ?? 0)) this.setTask(taskName);
  }
  getTooltipLines() {
    return ['Employee', `Role: ${this.role.role}`, `Task: ${this.curTask}`, `State: ${this.state}`];
  }

  _initTask() {
    const engine = this.engine;
    switch (this.curTask) {
      case 'cashier':
        this.moveTo(engine.POS3D.x + (-1.5), engine.POS3D.z + 2);
        break;
      case 'idle':
        this.moveTo(engine.WAIT3D.x + Math.random() * 0.8 - 0.4, engine.WAIT3D.z + Math.random() * 0.8 - 0.4);
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
    const nextPoint = pts[this._patrolIdx % pts.length];
    this.moveTo(nextPoint.x, nextPoint.z);
    this._patrolIdx++;
  }
  _startRestock() {
    const engine = this.engine;
    let lowestQty = Infinity,
      target = 0;
    engine.items.forEach((item, index) => {
      if (item.qty < item.maxQty * 0.6 && item.qty < lowestQty) {
        lowestQty = item.qty;
        target = index;
      }
    });
    this._restockIdx = target;
    this._restockPhase = 'toStock';
    engine.addEvt(`📦 ${this.name} start restock`);
    this.moveTo(engine.STOCK3D.x, engine.STOCK3D.z);
  }
  checkStockByCustomer(cust, itemName) {
    const stockItem = this.engine.items.find((item) => item.name === itemName);
    if (!stockItem) return;
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
    const engine = this.engine;
    if (engine.posQueue.length > 0 && this.curTask !== 'cashier' && this.state !== 'occupied') {
      const hasCashier = engine.npcs.some(
        (npc) => npc.type === 'employee' && npc.curTask === 'cashier' && npc.state !== 'break'
      );
      if (!hasCashier) {
        this.assignTask('cashier');
        this._posWait = 0;
      }
    }
    if (this.curTask === 'cashier' && engine.posQueue.length === 0) {
      this._posWait += dt;
      if (this._posWait > 5) {
        this.restoreTask();
        this._posWait = 0;
      }
    } else this._posWait = 0;
  }
  _updateCashier(dt) {
    const engine = this.engine;
    if (!this.isAtTarget()) {
      this._followPath(dt);
      return;
    }
    if (engine.posQueue.length > 0) {
      const cust = engine.posQueue[0];

      if (cust.state === 'checkingout' ) {
        // engine.addEvt(`👤 Customer ${cust.statee}`);
        this._tTimer += dt;
        if (this._tTimer > 2) {
          engine.posQueue.shift();
          cust.completePurchase();
          this._tTimer = 0;
        }
      }
    }
  }
  _updateClean(dt) {
    if (this.isAtTarget()) {
      let targetX, targetZ;
      do {
        targetX = -7 + Math.random() * 14;
        targetZ = -5 + Math.random() * 11;
      } while (inObs(targetX, targetZ, 0.3));
      this.moveTo(targetX, targetZ);
    }
    this._followPath(dt);
  }
  _updatePatrol(dt) {
    if (this.isAtTarget()) this._nextPatrol();
    this._followPath(dt);
  }
  _updateRestock(dt) {
    const engine = this.engine;
    if (!this.isAtTarget()) {
      this._followPath(dt);
      return;
    }
    const toRestockItem = engine.items[this._restockIdx];
    const storageItems = engine.storageItems[this._restockIdx];
    const validateStock = this._validateStockItem(storageItems,toRestockItem)
    
    if (this._restockPhase === 'toStock') {
      const selectedShelf = engine.SHELF3D[this._restockIdx];
      if (selectedShelf && validateStock && !engine.restockQue.includes(this._restockIdx) ){
        engine.restockQue.push(this._restockIdx)
        this._restockPhase = 'toShelf';
        this.moveTo(selectedShelf.x, selectedShelf.z);
        engine.restockQue = engine.restockQue.filter( idx => idx != this._restockIdx)
      } else if(!validateStock){
        this.restoreTask();
      }
    } else if (this._restockPhase === 'toShelf') {

      if (toRestockItem && validateStock) {
        const qtyAmount = toRestockItem.maxQty
        storageItems.qty = storageItems.qty - qtyAmount
        toRestockItem.qty = qtyAmount;
        let withdraw = {
          id: toRestockItem.shelfIdx,
          fridgeId: toRestockItem.fridgeIdx,
          itemName: toRestockItem.name,
          qty: toRestockItem.qty,
          date: engine.formatTime(),
          empName: this.name,
        }
        engine.stockWithdraw.push(withdraw)
        engine.addEvt(`📦 ${this.name} withdraw ${storageItems.name} remains ${storageItems.qty}`);
        engine.addEvt(`📦 ${this.name} restocked ${toRestockItem.name} ${toRestockItem.qty}`);
      }
      if (this.state === 'occupied') {
        this.state = 'working';
        this._custHelp = null;
      }
      this.restoreTask();
    }
  }

  _validateStockItem(storageItems, toRestockItem){
    return storageItems.qty - toRestockItem.qty > 0
  }

}