import { Npc } from "./Npc";

export class Customer extends Npc {
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
    const shelfItem = eng.items.find((s) => s.name === item.name);
    if (!shelfItem || shelfItem.qty <= 0) {
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
    const qty = Math.min(item.qty, shelfItem.qty);
    shelfItem.qty -= qty;
    this.cart.push({ name: item.name, qty, price: shelfItem.price, total: shelfItem.price * qty });
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
      const shelfItem = eng.items.find((s) => s.name === next?.name);
      const needed = shelfItem ? shelfItem.price * next.qty : 0;
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