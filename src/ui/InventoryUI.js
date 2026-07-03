import { getItemDef, getItemName, getItemIcon, addToInventory, removeFromInventory, canStack } from '../systems/Inventory.js';

export class InventoryUI {
  constructor(container, events) {
    this.container = container;
    this.events = events;
    this.panel = null;
    this.grid = null;
    this.slots = [];
    this.hotbarSlots = [];
    this.dragItem = null;
    this.dragSource = null;
    this.dragEl = null;
    this.visible = false;
    this.inventory = [];
    this.selectedSlot = -1;
  }

  init() {
    this.panel = document.createElement('div');
    this.panel.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      display: none; z-index: 500;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
    `;

    const frame = document.createElement('div');
    frame.style.cssText = `
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: min(600px, 90vw); height: min(450px, 80vh);
      background: linear-gradient(135deg, #2a1f0a 0%, #1a1208 100%);
      border: 2px solid #D4A574;
      border-radius: 8px;
      padding: 15px;
      display: flex; flex-direction: column;
    `;

    const header = document.createElement('div');
    header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;';
    const title = document.createElement('span');
    title.textContent = 'Inventory';
    title.style.cssText = 'color: #D4A574; font-size: 20px; font-weight: bold; letter-spacing: 1px;';
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'X';
    closeBtn.style.cssText = 'background: none; border: 1px solid #8B7355; color: #D4A574; font-size: 16px; cursor: pointer; padding: 2px 8px; border-radius: 3px;';
    closeBtn.addEventListener('click', () => this.hide());
    header.appendChild(title);
    header.appendChild(closeBtn);
    frame.appendChild(header);

    const tabs = document.createElement('div');
    tabs.style.cssText = 'display: flex; gap: 5px; margin-bottom: 10px;';
    const categories = ['All', 'Tools', 'Weapons', 'Food', 'Materials', 'Crops'];
    this.tabButtons = [];
    for (const cat of categories) {
      const btn = document.createElement('button');
      btn.textContent = cat;
      btn.style.cssText = `
        background: rgba(255,255,255,0.05); border: 1px solid #8B7355;
        color: #D4A574; font-size: 11px; cursor: pointer;
        padding: 4px 10px; border-radius: 3px;
        font-family: 'Georgia', serif;
      `;
      if (cat === 'All') btn.style.background = 'rgba(212,165,116,0.2)';
      btn.addEventListener('click', () => {
        this.tabButtons.forEach(b => b.style.background = 'rgba(255,255,255,0.05)');
        btn.style.background = 'rgba(212,165,116,0.2)';
        this.filterCategory = cat.toLowerCase();
        this.render(this.inventory);
      });
      tabs.appendChild(btn);
      this.tabButtons.push(btn);
    }
    frame.appendChild(tabs);
    this.filterCategory = 'all';

    this.grid = document.createElement('div');
    this.grid.style.cssText = `
      display: grid; grid-template-columns: repeat(6, 1fr);
      gap: 4px; flex: 1;
      overflow-y: auto; padding: 2px;
    `;
    frame.appendChild(this.grid);

    const footer = document.createElement('div');
    footer.style.cssText = 'display: flex; justify-content: space-between; color: #8B7355; font-size: 11px; margin-top: 8px;';
    const info = document.createElement('span');
    info.textContent = 'Drag items to move them. Tap to equip.';
    footer.appendChild(info);
    frame.appendChild(footer);

    this.panel.appendChild(frame);
    this.container.appendChild(this.panel);

    this.dragEl = document.createElement('div');
    this.dragEl.style.cssText = `
      position: fixed; pointer-events: none; z-index: 1000;
      display: none; font-size: 28px;
      text-shadow: 0 0 10px rgba(0,0,0,0.8);
    `;
    document.body.appendChild(this.dragEl);
  }

  setInventory(inv) {
    this.inventory = inv;
  }

  render(inventory) {
    this.inventory = inventory || this.inventory;
    this.grid.innerHTML = '';
    this.slots = [];

    const filtered = this.inventory.filter((item, idx) => {
      if (!item) return false;
      if (this.filterCategory === 'all') return true;
      const def = getItemDef(item.id);
      return def && def.type === this.filterCategory;
    });

    for (let i = 0; i < 30; i++) {
      const slot = document.createElement('div');
      slot.style.cssText = `
        width: 100%; aspect-ratio: 1;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(212,165,116,0.2);
        border-radius: 4px;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        font-size: 20px; cursor: pointer;
        position: relative; user-select: none;
        min-height: 44px;
      `;

      const item = this.inventory[i];
      if (item) {
        const def = getItemDef(item.id);
        if (def) {
          slot.innerHTML = `<span>${def.icon || '?'}</span>`;
          if (item.quantity > 1) {
            const qty = document.createElement('span');
            qty.textContent = item.quantity;
            qty.style.cssText = 'position: absolute; bottom: 2px; right: 4px; font-size: 10px; color: #D4A574;';
            slot.appendChild(qty);
          }
          if (item.durability !== undefined && item.maxDurability !== undefined) {
            const durPct = (item.durability / item.maxDurability) * 100;
            const durBar = document.createElement('div');
            durBar.style.cssText = `
              position: absolute; bottom: 0; left: 0; height: 2px;
              width: ${durPct}%; background: ${durPct > 30 ? '#4CAF50' : '#FF4444'};
              border-radius: 1px; transition: width 0.2s;
            `;
            slot.appendChild(durBar);
          }
          if (i === this.selectedSlot) {
            slot.style.border = '2px solid #FFD700';
          }
        }
      }

      slot.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (this.inventory[i]) {
          this.dragItem = this.inventory[i];
          this.dragSource = i;
          this.dragEl.textContent = getItemIcon(this.inventory[i].id) || '?';
          this.dragEl.style.display = 'block';
          this._moveDrag(e.clientX, e.clientY);
          slot.style.opacity = '0.5';
        } else {
          this.selectSlot(i);
        }
      });

      this.grid.appendChild(slot);
      this.slots.push(slot);
    }
  }

  selectSlot(index) {
    this.selectedSlot = index;
    this.events.emit('inventory:select', { slot: index, item: this.inventory[index] });
  }

  _moveDrag(x, y) {
    this.dragEl.style.left = (x - 15) + 'px';
    this.dragEl.style.top = (y - 15) + 'px';
  }

  _handleDrop(clientX, clientY) {
    if (this.dragItem === null || this.dragSource === null) return;
    const gridRect = this.grid.getBoundingClientRect();
    const slots = this.grid.children;
    let targetIndex = -1;
    for (let i = 0; i < slots.length; i++) {
      const rect = slots[i].getBoundingClientRect();
      if (clientX >= rect.left && clientX <= rect.right &&
          clientY >= rect.top && clientY <= rect.bottom) {
        targetIndex = i;
        break;
      }
    }
    if (targetIndex >= 0 && targetIndex < this.inventory.length) {
      if (targetIndex !== this.dragSource) {
        const targetItem = this.inventory[targetIndex];
        if (canStack(this.inventory[this.dragSource], targetItem)) {
          const maxStack = getItemDef(targetItem.id)?.maxStack || 99;
          const space = maxStack - targetItem.quantity;
          if (space > 0) {
            const moveQty = Math.min(space, this.inventory[this.dragSource].quantity);
            targetItem.quantity += moveQty;
            this.inventory[this.dragSource].quantity -= moveQty;
            if (this.inventory[this.dragSource].quantity <= 0) {
              this.inventory.splice(this.dragSource, 1);
            }
          }
        } else {
          const temp = this.inventory[this.dragSource];
          this.inventory[this.dragSource] = this.inventory[targetIndex];
          this.inventory[targetIndex] = temp;
        }
      }
    }
    this.dragItem = null;
    this.dragSource = null;
    this.dragEl.style.display = 'none';
    this.render(this.inventory);
    this.events.emit('inventory:changed', this.inventory);
  }

  show(inventory) {
    this.visible = true;
    this.inventory = inventory || this.inventory;
    this.panel.style.display = '';
    this.render(this.inventory);
    this.events.emit('inventory:opened');
  }

  hide() {
    this.visible = false;
    this.panel.style.display = 'none';
    this.events.emit('inventory:closed');
  }

  toggle(inventory) {
    if (this.visible) this.hide();
    else this.show(inventory);
  }

  isVisible() {
    return this.visible;
  }

  update(events) {
    if (!this.visible) return;
    this._moveDrag = this._moveDrag.bind(this);
    this._handleDrop = this._handleDrop.bind(this);
    const moveHandler = (e) => {
      this._moveDrag(e.clientX || e.touches?.[0]?.clientX || 0, e.clientY || e.touches?.[0]?.clientY || 0);
    };
    const upHandler = (e) => {
      this._handleDrop(e.clientX || e.changedTouches?.[0]?.clientX || 0, e.clientY || e.changedTouches?.[0]?.clientY || 0);
      window.removeEventListener('pointermove', moveHandler);
      window.removeEventListener('pointerup', upHandler);
    };
    window.addEventListener('pointermove', moveHandler);
    window.addEventListener('pointerup', upHandler);
  }

  dispose() {
    if (this.dragEl && this.dragEl.parentNode) this.dragEl.parentNode.removeChild(this.dragEl);
    if (this.panel && this.panel.parentNode) this.panel.parentNode.removeChild(this.panel);
  }
}
