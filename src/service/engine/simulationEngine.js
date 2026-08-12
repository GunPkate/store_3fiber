import { Customer } from "../npc/Customer.js";
import { Employee } from "../npc/Employee.js";
import { WpGraph } from "./waypointgraph/WpGraph.js";

import {
  inObs,
  SHELF3D,
  FRIDGE3D,
  ATM3D,
  POS3D,
  EXIT3D,
  SPAWN3D,
  BREAK3D,
  STOCK3D,
  WAIT3D,
} from '../../config/storeLayout/storeLayoutLv1.js';
import { createShelfProductList } from "../../config/storeProductList/lv1/ShelfProductList.js";
import { createFridgeProductList } from "../../config/storeProductList/lv1/FridgeProductList.js";
import { createStoreProductList } from "../../config/storeProductList/lv1/StorageProductList.js";
import { createFridgeStorageProductList } from "../../config/storeProductList/lv1/FridgeStorageProductList.js";

const DAY_REAL = 720; // seconds per game day (real time, before timeSpeed)
const DAY_GAME = 1440; // game-minutes per day

/**
 * GameEngine owns ALL simulation state and runs independently of React's
 * render cycle. React components read from it inside useFrame (for smooth
 * per-frame visuals) or subscribe to its pub/sub channels (for list
 * add/remove and HUD snapshots, throttled).
 */
export class SimulationEngine {
    constructor() {
        this.CFG = {
            customerLimit: 50,
            spawnInterval: 15,
            showWP: false,
            showPaths: true,
            timeSpeed: 1,
        };

        this.fridgeItems = createFridgeProductList();
        this.items = [...createShelfProductList(), ...this.fridgeItems];   // merged pool
        this.storageItems = [...createStoreProductList(), ...createFridgeStorageProductList()]; // merged storage, same order

        this.stockWithdraw = []
        this.restockQue = []
        this.SHELF3D = [...SHELF3D, ...FRIDGE3D];
        this.FRIDGE3D = FRIDGE3D;
        this.ATM3D = ATM3D;
        this.POS3D = POS3D;
        this.EXIT3D = EXIT3D;
        this.SPAWN3D = SPAWN3D;
        this.BREAK3D = BREAK3D;
        this.STOCK3D = STOCK3D;
        this.WAIT3D = WAIT3D;

        this.graph = new WpGraph(
            [
                ['atm', ATM3D],
                ['pos', POS3D],
                ['exit', EXIT3D],
                ['spawn', SPAWN3D],
                ['break', BREAK3D],
                ['stock', STOCK3D],
                ['waiting', WAIT3D],
            ],
            SHELF3D,
            FRIDGE3D
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

        this.createNPC('employee', -1, 3.2, 'Watson');
        this.createNPC('employee', 1, 3.2, 'Emma');
        this.createNPC('employee', -3, 0.5, 'Emily');
        this.addEvt('🏪 Store initialized');
    }

    getTimeHelper() {
        const minutesOfDay = this.gameTime % DAY_GAME;
        return { hours: Math.floor(minutesOfDay / 60), minutes: Math.floor(minutesOfDay % 60) };
    }

    formatTime() {
        const { hours, minutes } = this.getTimeHelper();
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    shiftLabel() {
        const { hours } = this.getTimeHelper();
        if (hours >= 6 && hours < 14) return 'SHIFT DAY';
        if (hours >= 14 && hours < 22) return 'SHIFT NIGHT';
        if (hours === 5) return 'PRE-OPEN';
        if (hours >= 22) return 'CLOSING';
        return 'CLOSED';
    }

    isOpen() {
        const { hours } = this.getTimeHelper();
        return hours >= 6 && hours < 22;
    }

    addEvt(msg) {
        this.evts.unshift(`${this.formatTime()} ${msg}`);
        if (this.evts.length > 10) this.evts.pop();
    }

  // ── NPC management ──────────────────────────────────────
  findAvailEmp() {
    return this.npcs.find((npc) => npc.type === 'employee' && npc.state !== 'occupied' && npc.state !== 'break');
  }
  
  // ── waypoint tool actions ───────────────────────────────
  addWaypoint(x, z, type = 'generic') {
    if (inObs(x, z, 0.15)) return null;
    const node = this.graph.addNode(x, z, type);
    if (node) {
      this.addEvt('📍 Waypoint added');
      this.notifyGraphChange();
    } else {
      this.addEvt('⚠️ Blocked by obstacle');
    }
    return node;
  }
  removeWaypoint(id) {
    this.graph.removeNode(id);
    this.addEvt('🗑 WP removed');
    this.notifyGraphChange();
  }
  linkWaypoints(nodeA, nodeB) {
    this.graph.linkNodes(nodeA, nodeB);
    this.addEvt('🔗 Linked');
    this.notifyGraphChange();
  }
  setWaypointType(id, type) {
    const node = this.graph.getNode(id);
    if (node) {
      node.type = type;
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
    const customer = this.createNPC('customer', x, z);
    const item = customer.curItem();
    if (item) {
      const shelf = customer.shelfFor(item.name);
      if (shelf) customer.moveTo(shelf.x, shelf.z);
    }
    this.addEvt('👤 Customer spawned');
    return customer;
  }
  spawnEmployeeAt(x, z) {
    if (inObs(x, z, 0.2)) return null;
    const employee = this.createNPC('employee', x, z);
    this.addEvt('👷 Employee spawned');
    return employee;
  }

    getSnapshot() {
        const custs = this.custInStore();
        const stockQty = this.items.reduce((sum, item) => sum + item.qty, 0);
        const maxQty = this.items.reduce((sum, item) => sum + item.maxQty, 0);
        const avgWaitSeconds = this.served > 0 ? ((this.totalWait / this.served) * (DAY_REAL / DAY_GAME) * 60).toFixed(0) : 0;
        return {
            clock: this.formatTime(),
            day: this.day,
            shift: this.shiftLabel(),
            revenue: this.revenue,
            custCount: custs,
            posCount: this.posQueue.length,
            served: this.served,
            stockPct: maxQty > 0 ? Math.floor((stockQty / maxQty) * 100) : 0,
            avgWait: avgWaitSeconds,
            customerLimit: this.CFG.customerLimit,
            employees: this.npcs
                .filter((npc) => npc.type === 'employee')
                .map((employee) => ({ id: employee.id, role: employee.role.role, task: employee.curTask, state: employee.state })),
            events: this.evts.slice(0, 6),
            storageItems: this.storageItems.map((item) => ({ ...item })),
            shelfItems: this.items.map((item) => ({ ...item })),
        };
    }

    update(rawDt) {
        const dt = rawDt * this.CFG.timeSpeed;
        
        this.gameTime += dt * (DAY_GAME / DAY_REAL);
        if (this.gameTime >= this.day * DAY_GAME) {
            this.day++;
            this.addEvt(`🌅 Day ${this.day} begins`);
        }
        
        this.updateSpawn(rawDt); // raw dt avoids speed-multiplied spawn bursts
        this.npcs.forEach((npc) => npc.update(dt));
        this.updatePOS();
        
        if (this.npcsToRemove.length) {
            this.npcsToRemove.forEach((id) => this.removeNPC(id));
            this.npcsToRemove = [];
        }
        
        // auto restock check every 2 game hours
        if (Math.floor(this.gameTime) % 120 === 1) {
            this.npcs
            .filter((npc) => npc.type === 'employee' && npc.role.role === 'stocker' && npc.curTask !== 'restock')
            .forEach((employee) => {
                if (this.items.some((item) => item.qty < item.maxQty * 0.4)) employee.assignTask('restock');
            });
        }
    }

    custInStore() {
        return this.npcs.filter((npc) => npc.type === 'customer' && npc.state !== 'done').length;
    }

    createNPC(type, x, z, name) {
        const npc = type === 'customer' ? new Customer(this, x, z) : new Employee(this, x, z, name);
        this.npcs.push(npc);
        if (type === 'employee') this.initEmpTask(npc);
        this.notifyNpcs();
        return npc;
    }

    initEmpTask(emp) {
        const cashiers = this.npcs.filter((npc) => npc.type === 'employee' && npc.curTask === 'cashier').length;
        if (cashiers < 1 && emp.role.role === 'cashier') {
            emp.setTask('cashier');
            return;
        }
        const ROLE_TASK = { cashier: 'patrol', floorStaff: 'cleaningFloor', stocker: 'restock' };
        emp.setTask(ROLE_TASK[emp.role.role] || 'idle');
    }

    removeNPC(id) {
        const npc = this.npcs.find((existingNpc) => existingNpc.id === id);
        if (!npc) return;
        this.posQueue = this.posQueue.filter((customer) => customer.id !== id);
        // npc.dispose();
        this.npcs = this.npcs.filter((existingNpc) => existingNpc.id !== id);
        this.notifyNpcs();
    }
    
    updatePOS() {
         this.npcs.forEach((npc) => {
             if (npc.type === 'customer' && npc.state === 'checkingout' && npc.isAtTarget() && !this.posQueue.includes(npc)) {
                 this.posQueue.push(npc);
                }
            });
            this.posQueue.forEach((customer, idx) => {
                const targetX = this.POS3D.x - 2 + idx * 1.1,
                targetZ = this.POS3D.z + 0.8;
                if (Math.hypot(customer.x - targetX, customer.z - targetZ) > 0.3) customer.moveTo(targetX, targetZ);
            });
    }
            
    updateSpawn(dt) {
        if (!this.isOpen()) return;
        if (this.custInStore() >= this.CFG.customerLimit) return;
        this.custSpawnTimer += dt * (DAY_GAME / DAY_REAL); // advance in game-seconds
        if (this.custSpawnTimer >= this.CFG.spawnInterval) {
            this.custSpawnTimer = 0;
            const customer = this.createNPC(
                'customer',
                this.SPAWN3D.x + (Math.random() * 0.6 - 0.3),
                this.SPAWN3D.z,
                ''
            );
            const item = customer.curItem();
            if (item) {
                const shelf = customer.shelfFor(item.name);
                if (shelf) customer.moveTo(shelf.x, shelf.z);
            }
            this.addEvt('👤 Customer entered');
        }
    }

  // ── HUD snapshot (call at a throttled rate, not every frame) ──
    notifyGraphChange() {
      this._graphListeners.forEach((callback) => callback());
    }

    onNpcsChange(callback) {
        this._npcListeners.add(callback);
        return () => this._npcListeners.delete(callback);
    }

    onGraphChange(callback) {
        this._graphListeners.add(callback);
        return () => this._graphListeners.delete(callback);
    }

    notifyNpcs() {
        this._npcListeners.forEach((callback) => callback());
    }
}

export { DAY_REAL, DAY_GAME };