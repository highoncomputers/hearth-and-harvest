import { RECIPES, getRecipesForStation, canCraft, craft, getRepairCost, repairItem } from '../systems/Crafting.js';
import { getItemDef, getItemQuantity, ITEM_DEFS } from '../systems/Inventory.js';

export class CraftingUI {
  constructor(container, events) {
    this.container = container;
    this.events = events;
    this.element = null;
    this.listEl = null;
    this.titleEl = null;
    this.visible = false;
    this.currentStation = null;
    this.currentRecipes = [];
    this.playerInventory = [];
    this.playerSkills = {};
    this._onCraft = null;
  }

  init() {
    this.element = document.createElement('div');
    this.element.style.cssText = `
      position: fixed; top: 10%; left: 50%; transform: translateX(-50%);
      width: min(400px, 90vw); max-height: 75vh;
      background: rgba(10,10,10,0.92); border: 1px solid #8B7355;
      border-radius: 8px; padding: 12px; z-index: 5000;
      font-family: Georgia, serif; color: #D4A574;
      display: none; overflow-y: auto;
    `;

    const header = document.createElement('div');
    header.style.cssText = `
      display: flex; justify-content: space-between; align-items: center;
      padding-bottom: 8px; border-bottom: 1px solid #443322; margin-bottom: 8px;
    `;
    this.titleEl = document.createElement('div');
    this.titleEl.style.cssText = 'font-size: 18px; font-weight: bold; text-shadow: 0 0 10px rgba(212,165,116,0.3);';
    header.appendChild(this.titleEl);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'X';
    closeBtn.style.cssText = `
      background: none; border: 1px solid #8B7355; color: #D4A574;
      font-size: 14px; cursor: pointer; padding: 2px 8px; border-radius: 4px;
    `;
    closeBtn.onclick = () => this.hide();
    header.appendChild(closeBtn);
    this.element.appendChild(header);

    this.listEl = document.createElement('div');
    this.listEl.style.cssText = 'display: flex; flex-direction: column; gap: 6px;';
    this.element.appendChild(this.listEl);

    this.container.appendChild(this.element);
  }

  show(stationType, inventory, skills, onCraft) {
    this.currentStation = stationType;
    this.playerInventory = inventory;
    this.playerSkills = skills;
    this._onCraft = onCraft;

    const stationDefs = {
      campfire: 'Campfire', hearth: 'Hearth', workbench: 'Workbench',
      anvil: 'Anvil', sawmill: 'Sawmill', loom: 'Loom', kiln: 'Kiln', still: 'Still',
    };
    this.titleEl.textContent = stationDefs[stationType] || stationType;

    this.currentRecipes = getRecipesForStation(stationType);
    this._renderRecipes();

    this.visible = true;
    this.element.style.display = 'block';
  }

  hide() {
    this.visible = false;
    this.element.style.display = 'none';
    this.currentStation = null;
  }

  isVisible() { return this.visible; }

  _renderRecipes() {
    this.listEl.innerHTML = '';

    const repairItems = this.currentStation === 'anvil'
      ? this.playerInventory.filter(i => i && i.durability !== undefined && i.durability < i.maxDurability)
      : [];

    if (repairItems.length > 0) {
      const section = document.createElement('div');
      section.style.cssText = 'margin-bottom: 8px;';
      const title = document.createElement('div');
      title.textContent = '-- Repair --';
      title.style.cssText = 'color: #8B7355; font-size: 11px; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 2px;';
      section.appendChild(title);

      for (const item of repairItems) {
        const def = getItemDef(item.id);
        const cost = getRepairCost(item);
        if (!cost) continue;
        const card = this._createCard(
          `Repair ${def?.name || item.id}`,
          cost.map(c => `${c.qty}x ${getItemDef(c.id)?.name || c.id}`).join(', '),
          () => {
            if (repairItem(item, this.playerInventory)) {
              this.events.emit('inventory:changed', this.playerInventory);
              if (this._onCraft) this._onCraft();
              this._renderRecipes();
            }
          },
          cost.every(c => getItemQuantity(this.playerInventory, c.id) >= c.qty),
          false
        );
        section.appendChild(card);
      }
      this.listEl.appendChild(section);
    }

    const section = document.createElement('div');
    const title = document.createElement('div');
    title.textContent = '-- Craft --';
    title.style.cssText = 'color: #8B7355; font-size: 11px; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 2px;';
    section.appendChild(title);

    for (const recipe of this.currentRecipes) {
      const canMake = canCraft(recipe, this.playerInventory, this.playerSkills);
      const def = getItemDef(recipe.result.id);
      const ingStr = recipe.ingredients.map(i => `${i.qty}x ${getItemDef(i.id)?.name || i.id}`).join(', ');
      const skillReq = `(Skill: ${recipe.skill} ${recipe.skillReq})`;

      const card = this._createCard(
        `${recipe.name} ${skillReq}`,
        `Need: ${ingStr}  →  ${recipe.result.qty}x ${def?.name || recipe.result.id}`,
        () => {
          if (craft(recipe, this.playerInventory, this.playerSkills)) {
            this.events.emit('inventory:changed', this.playerInventory);
            if (this._onCraft) this._onCraft();
            this._renderRecipes();
          }
        },
        canMake,
        true
      );
      section.appendChild(card);
    }

    if (this.currentRecipes.length === 0 && repairItems.length === 0) {
      const empty = document.createElement('div');
      empty.textContent = 'No recipes available at this station.';
      empty.style.cssText = 'color: #665544; font-size: 12px; text-align: center; padding: 20px;';
      section.appendChild(empty);
    }

    this.listEl.appendChild(section);
  }

  _createCard(label, desc, onClick, enabled, isCraft) {
    const card = document.createElement('div');
    card.style.cssText = `
      padding: 8px 10px; border: 1px solid ${enabled ? '#554433' : '#332211'};
      border-radius: 4px; cursor: ${enabled ? 'pointer' : 'default'};
      opacity: ${enabled ? 1 : 0.4};
      background: ${enabled ? 'rgba(139,115,85,0.1)' : 'transparent'};
      transition: background 0.15s;
    `;
    if (enabled) {
      card.onmouseenter = () => { card.style.background = 'rgba(139,115,85,0.25)'; };
      card.onmouseleave = () => { card.style.background = 'rgba(139,115,85,0.1)'; };
      card.onclick = onClick;
    }

    const labelEl = document.createElement('div');
    labelEl.textContent = label;
    labelEl.style.cssText = 'font-size: 13px; font-weight: bold; color: #D4A574;';
    card.appendChild(labelEl);

    const descEl = document.createElement('div');
    descEl.textContent = desc;
    descEl.style.cssText = 'font-size: 10px; color: #8B7355; margin-top: 2px;';
    card.appendChild(descEl);

    return card;
  }

  dispose() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
