import { SHELF3D, ATM3D, POS3D, EXIT3D, SPAWN3D, BREAK3D, STOCK3D, WAIT3D, createItems } from "../../config/storeLayout/storeLayoutLv1";
import { Customer } from "../npc/Customer";
import { Employee } from "../npc/Employee";
import { WpGraph } from "./waypointgraph/WpGraph";

const DAY_REAL = 720; // seconds per game day (real time, before timeSpeed)
const DAY_GAME = 1440; // game-minutes per day

export class SimulationEngine {
    constructor() {
        this.CFG = {
            customerLimit: 50,
            spawnInterval: 15,
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
        this.createNPC('employee', -1, 3.2);
    }

    getTimeHelper() {
        const m = this.gameTime % DAY_GAME;
        return { h: Math.floor(m / 60), m: Math.floor(m % 60) };
    }

    formatTime() {
        const { h, m } = this.getTimeHelper();
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }

    shiftLabel() {
        const { h } = this.getTimeHelper();
        if (h >= 6 && h < 14) return 'SHIFT DAY';
        if (h >= 14 && h < 22) return 'SHIFT NIGHT';
        if (h === 5) return 'PRE-OPEN';
        if (h >= 22) return 'CLOSING';
        return 'CLOSED';
    }

    getSnapshot() {
        // const custs = this.custInStore();
        const sq = this.items.reduce((s, i) => s + i.qty, 0);
        const mq = this.items.reduce((s, i) => s + i.maxQty, 0);
        const aw = this.served > 0 ? ((this.totalWait / this.served) * (DAY_REAL / DAY_GAME) * 60).toFixed(0) : 0;
        return {
            clock: this.formatTime(),
            day: this.day,
            shift: this.shiftLabel(),
            revenue: this.revenue,
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

    update(rawDt) {
        const dt = rawDt * this.CFG.timeSpeed;
        
        this.gameTime += dt * (DAY_GAME / DAY_REAL);
        if (this.gameTime >= this.day * DAY_GAME) {
            this.day++;
            this.addEvt(`🌅 Day ${this.day} begins`);
        }
    }

    createNPC(type, x, z) {
        const npc = type === 'customer' ? new Customer(this, x, z) : new Employee(this, x, z);
        this.npcs.push(npc);
        if (type === 'employee') this.initEmpTask(npc);
        this.notifyNpcs();
        return npc;
    }

    initEmpTask(emp) {
        const cashiers = this.npcs.filter((n) => n.type === 'employee' && n.curTask === 'cashier').length;
        if (cashiers < 1 && emp.role.role === 'cashier') {
            emp.setTask('cashier');
            return;
        }
        const ROLE_TASK = { cashier: 'patrol', floorStaff: 'cleaningFloor', stocker: 'restock' };
        emp.setTask(ROLE_TASK[emp.role.role] || 'idle');
    }

    notifyNpcs() {
        this._npcListeners.forEach((cb) => cb());
    }
}