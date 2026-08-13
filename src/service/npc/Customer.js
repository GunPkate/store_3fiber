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
    const storeItems = engine.items;
    const wantedItemCount = 1 + Math.floor(Math.random() * 4);
    const shuffledItems = [...storeItems].sort(() => Math.random() - 0.5).slice(0, wantedItemCount);
    this.wantedItem = {
      npcId: this.id,
      item: shuffledItems.map((storeItem) => ({ name: storeItem.name, qty: 1 + Math.floor(Math.random() * 4) })),
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
  set state(newState) {
    this.decision.state = newState;
  }
  curItem() {
    return this.wantedItem.item[this._itemIdx] || null;
  }
  shelfFor(name) {
    const itemIndex = this.engine.items.findIndex((item) => item.name === name);
    return itemIndex >= 0 ? this.engine.SHELF3D[itemIndex] : null;
  }
  getTooltipLines() {
    return [
      'Customer',
      `State: ${this.state}`,
      `Cash: $${this.capital.cash | 0}`,
      `Cart: ${this.cart.length} items`,
      `Wants: ${this.wantedItem.item.map((wanted) => wanted.name).join(', ')}`,
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
    const engine = this.engine;
    const item = this.curItem();
    if (!item) {
      this.state = 'checkingout';
      this.moveTo(engine.POS3D.x, engine.POS3D.z);
      if (!this._posJoin) this._posJoin = engine.gameTime;
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
    const shelfItem = engine.items.find((storeItem) => storeItem.name === item.name);
    if (!shelfItem || shelfItem.qty <= 0) {
      if (Math.random() > 0.5) {
        const availableEmployee = engine.findAvailEmp();
        if (availableEmployee) {
          availableEmployee.checkStockByCustomer(this, item.name);
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
    const engine = this.engine;
    this.wander(dt, this.x, this.z, 0.8);
    this._thinkTimer -= dt;
    if (this._thinkTimer > 0) return;
    if (this._itemIdx < this.wantedItem.item.length) {
      const next = this.wantedItem.item[this._itemIdx];
      const shelfItem = engine.items.find((storeItem) => storeItem.name === next?.name);
      const needed = shelfItem ? shelfItem.price * next.qty : 0;
      if (needed > 0 && this.capital.cash < needed) {
        this.state = 'withdrawing';
        this.moveTo(engine.ATM3D.x, engine.ATM3D.z);
      } else {
        const shelf = this.shelfFor(next.name);
        if (shelf) this.moveTo(shelf.x, shelf.z);
        this.state = 'buying';
      }
    } else {
      const total = this.cart.reduce((sum, cartItem) => sum + cartItem.total, 0);
      if (this.capital.cash < total) {
        this.state = 'withdrawing';
        this.moveTo(engine.ATM3D.x, engine.ATM3D.z);
      } else {
        this.state = 'checkingout';
        this.moveTo(engine.POS3D.x, engine.POS3D.z);
        if (!this._posJoin) this._posJoin = engine.gameTime;
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
        const withdrawAmount = Math.min(acc.amount, (300 + Math.random() * 500) | 0);
        acc.amount -= withdrawAmount;
        this.capital.cash += withdrawAmount;
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
    const engine = this.engine;
    const total = this.cart.reduce((sum, cartItem) => sum + cartItem.total, 0);
    this.capital.cash -= total;
    engine.revenue += total;
    engine.served++;
    if (this._posJoin) engine.totalWait += engine.gameTime - this._posJoin;
    this.state = 'done';
    this.moveTo(engine.EXIT3D.x, engine.EXIT3D.z);
    engine.addEvt(`💳 Customer paid $${total.toFixed(2)}`);
  }
}