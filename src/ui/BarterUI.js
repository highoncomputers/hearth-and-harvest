import { getItemDef, getItemQuantity, consumeItems, addToInventory } from '../systems/Inventory.js';

export class BarterUI {
  constructor(container, events) {
    this.container = container;
    this.events = events;
    this.element = null;
    this.npcInfoEl = null;
    this.wantsEl = null;
    this.offersEl = null;
    this.visible = false;
    this.currentNPC = null;
    this.playerInventory = [];
  }

  init() {
    this.element = document.createElement('div');
    this.element.style.cssText = `
      position: fixed; top: 10%; left: 50%; transform: translateX(-50%);
      width: min(400px, 85vw); max-height: 70vh;
      background: rgba(8,8,8,0.92); border: 1px solid #8B7355;
      border-radius: 8px; padding: 14px; z-index: 5000;
      font-family: Georgia, serif; display: none;
      overflow-y: auto;
    `;

    const header = document.createElement('div');
    header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; border-bottom: 1px solid #443322; margin-bottom: 10px;';

    this.npcInfoEl = document.createElement('div');
    this.npcInfoEl.style.cssText = 'font-size: 16px; font-weight: bold; color: #D4A574;';
    header.appendChild(this.npcInfoEl);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'X';
    closeBtn.style.cssText = 'background: none; border: 1px solid #8B7355; color: #D4A574; font-size: 14px; cursor: pointer; padding: 2px 8px; border-radius: 4px;';
    closeBtn.onclick = () => this.hide();
    header.appendChild(closeBtn);
    this.element.appendChild(header);

    const layout = document.createElement('div');
    layout.style.cssText = 'display: flex; flex-direction: column; gap: 12px;';

    this.wantsEl = document.createElement('div');
    this.wantsEl.style.cssText = 'padding: 8px; background: rgba(139,50,50,0.1); border: 1px solid #5A2A2A; border-radius: 4px;';
    layout.appendChild(this.wantsEl);

    this.offersEl = document.createElement('div');
    this.offersEl.style.cssText = 'padding: 8px; background: rgba(50,139,50,0.1); border: 1px solid #2A5A2A; border-radius: 4px;';
    layout.appendChild(this.offersEl);

    this.element.appendChild(layout);
    this.container.appendChild(this.element);
  }

  show(npc, inventory) {
    this.currentNPC = npc;
    this.playerInventory = inventory;
    this.npcInfoEl.textContent = `${npc.name} ${npc.title} — Barter`;
    this.visible = true;
    this.element.style.display = 'block';
    this._render();
  }

  hide() {
    this.visible = false;
    this.element.style.display = 'none';
    this.currentNPC = null;
  }

  isVisible() { return this.visible; }

  _render() {
    const npc = this.currentNPC;
    if (!npc) return;

    this.wantsEl.innerHTML = '<div style="color:#C47A5A;font-size:12px;margin-bottom:4px;text-transform:uppercase;letter-spacing:2px;">— Wants —</div>';
    for (const want of npc.desires) {
      const def = getItemDef(want.id);
      const have = getItemQuantity(this.playerInventory, want.id);
      const canFulfill = have >= want.qtyNeeded;
      const row = document.createElement('div');
      row.style.cssText = `display:flex;justify-content:space-between;align-items:center;padding:4px 0;opacity:${canFulfill ? 1 : 0.5};`;
      row.innerHTML = `
        <span style="font-size:13px;color:#C4A574;">${def?.icon || ''} ${def?.name || want.id} x${want.qtyNeeded}</span>
        <span style="font-size:11px;color:#8B7355;">You have: ${have}</span>
      `;
      this.wantsEl.appendChild(row);
    }

    this.offersEl.innerHTML = '<div style="color:#5AC47A;font-size:12px;margin-bottom:4px;text-transform:uppercase;letter-spacing:2px;">— Offers —</div>';
    for (const offer of npc.offers) {
      const def = getItemDef(offer.id);
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:4px 0;';

      const tradeBtn = document.createElement('div');
      tradeBtn.textContent = `[Trade]`;
      tradeBtn.style.cssText = `
        padding:4px 10px;border:1px solid #2A5A2A;border-radius:4px;cursor:pointer;
        font-size:11px;color:#5AC47A;background:rgba(50,139,50,0.15);
      `;
      tradeBtn.onmouseenter = () => { tradeBtn.style.background = 'rgba(50,139,50,0.35)'; };
      tradeBtn.onmouseleave = () => { tradeBtn.style.background = 'rgba(50,139,50,0.15)'; };

      const allFulfilled = npc.desires.every(w => getItemQuantity(this.playerInventory, w.id) >= w.qtyNeeded);
      tradeBtn.style.opacity = allFulfilled ? '1' : '0.4';

      tradeBtn.onclick = () => {
        if (!allFulfilled) return;
        for (const w of npc.desires) {
          consumeItems(this.playerInventory, w.id, w.qtyNeeded);
        }
        addToInventory(this.playerInventory, offer.id, offer.qty);
        npc.relation = Math.min(100, (npc.relation || 20) + 5);
        this.events.emit('inventory:changed', this.playerInventory);
        this.events.emit('player:message', { text: `Traded with ${npc.name}` });
        this._render();
      };

      row.innerHTML = `
        <span style="font-size:13px;color:#C4A574;">${def?.icon || ''} ${def?.name || offer.id} x${offer.qty}</span>
      `;
      row.appendChild(tradeBtn);
      this.offersEl.appendChild(row);
    }

    const relationEl = document.createElement('div');
    relationEl.style.cssText = 'margin-top:10px;padding-top:8px;border-top:1px solid #443322;font-size:11px;color:#8B7355;text-align:center;';
    relationEl.textContent = `Relationship: ${npc.relation}/100`;
    this.offersEl.appendChild(relationEl);
  }

  dispose() {
    if (this.element && this.element.parentNode) this.element.parentNode.removeChild(this.element);
  }
}
