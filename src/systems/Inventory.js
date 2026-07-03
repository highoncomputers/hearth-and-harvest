export const ITEM_DEFS = {
  // Tools
  wood_axe: { name: 'Wooden Axe', type: 'tool', subtype: 'axe', tier: 1, durability: 100, maxDurability: 100, icon: '\u{1F6E1}', stackable: false, desc: 'A crude wooden axe', damage: 12 },
  wood_hoe: { name: 'Wooden Hoe', type: 'tool', subtype: 'hoe', tier: 1, durability: 80, maxDurability: 80, icon: '\u26CF', stackable: false, desc: 'A wooden hoe for tilling', damage: 3 },
  wood_pickaxe: { name: 'Wooden Pickaxe', type: 'tool', subtype: 'pickaxe', tier: 1, durability: 100, maxDurability: 100, icon: '\u26CF', stackable: false, desc: 'A wooden pickaxe', damage: 10 },
  stone_sword: { name: 'Stone Sword', type: 'weapon', subtype: 'sword', tier: 1, durability: 120, maxDurability: 120, icon: '\u2694', stackable: false, desc: 'A sharpened stone blade', damage: 18 },
  iron_sword: { name: 'Iron Sword', type: 'weapon', subtype: 'sword', tier: 2, durability: 250, maxDurability: 250, icon: '\u2694', stackable: false, desc: 'A forged iron blade', damage: 32 },
  wood_shield: { name: 'Wooden Shield', type: 'armor', subtype: 'shield', tier: 1, durability: 150, maxDurability: 150, icon: '\u{1F6E1}', stackable: false, desc: 'Sturdy wooden shield', defense: 30 },
  bow: { name: 'Hunting Bow', type: 'weapon', subtype: 'bow', tier: 1, durability: 100, maxDurability: 100, icon: '\u{1F3F9}', stackable: false, desc: 'A simple hunting bow', damage: 14 },
  knife: { name: 'Bone Knife', type: 'tool', subtype: 'knife', tier: 1, durability: 60, maxDurability: 60, icon: '\u{1F5E1}', stackable: false, desc: 'A sharp bone knife', damage: 8 },

  // Materials
  wood: { name: 'Wood', type: 'material', subtype: 'wood', icon: '\u{1FAB5}', stackable: true, maxStack: 99, desc: 'Basic building material' },
  stone: { name: 'Stone', type: 'material', subtype: 'stone', icon: '\u{1FAA8}', stackable: true, maxStack: 99, desc: 'Hard stone for crafting' },
  iron_ore: { name: 'Iron Ore', type: 'material', subtype: 'ore', icon: '\u{1F3DB}', stackable: true, maxStack: 99, desc: 'Raw iron ore' },
  clay: { name: 'Clay', type: 'material', subtype: 'clay', icon: '\u{1F3E0}', stackable: true, maxStack: 99, desc: 'Moldable clay' },
  flax: { name: 'Flax', type: 'material', subtype: 'flax', icon: '\u{1F33F}', stackable: true, maxStack: 99, desc: 'Fibrous flax plant' },
  cloth: { name: 'Cloth', type: 'material', subtype: 'cloth', icon: '\u{1F9F5}', stackable: true, maxStack: 99, desc: 'Woven cloth' },
  leather: { name: 'Leather', type: 'material', subtype: 'leather', icon: '\u{1F9F4}', stackable: true, maxStack: 99, desc: 'Tanned animal hide' },

  // Food
  bread: { name: 'Bread', type: 'food', subtype: 'bread', icon: '\u{1F35E}', stackable: true, maxStack: 20, desc: 'Hearty wheat bread', hunger: 25, health: 5 },
  meat_raw: { name: 'Raw Meat', type: 'food', subtype: 'meat', icon: '\u{1F356}', stackable: true, maxStack: 20, desc: 'Raw animal meat', hunger: 10 },
  meat_cooked: { name: 'Cooked Meat', type: 'food', subtype: 'meat', icon: '\u{1F357}', stackable: true, maxStack: 20, desc: 'Roasted meat', hunger: 35, health: 8 },
  stew: { name: 'Hearty Stew', type: 'food', subtype: 'stew', icon: '\u{1F372}', stackable: true, maxStack: 10, desc: 'Filling vegetable stew', hunger: 45, health: 15, warmth: 10 },
  ale: { name: 'Ale', type: 'food', subtype: 'drink', icon: '\u{1F37A}', stackable: true, maxStack: 10, desc: 'Refreshing ale', thirst: 30, health: 5 },
  berries: { name: 'Wild Berries', type: 'food', subtype: 'berries', icon: '\u{1FAD0}', stackable: true, maxStack: 30, desc: 'Sweet wild berries', hunger: 8, thirst: 5 },

  // Crops
  wheat: { name: 'Wheat', type: 'crop', subtype: 'grain', icon: '\u{1F33E}', stackable: true, maxStack: 99, desc: 'Harvested wheat' },
  barley: { name: 'Barley', type: 'crop', subtype: 'grain', icon: '\u{1F33E}', stackable: true, maxStack: 99, desc: 'Harvested barley stalks' },
  cabbage: { name: 'Cabbage', type: 'crop', subtype: 'vegetable', icon: '\u{1F96C}', stackable: true, maxStack: 99, desc: 'Fresh cabbage' },
  carrot: { name: 'Carrot', type: 'crop', subtype: 'vegetable', icon: '\u{1F955}', stackable: true, maxStack: 99, desc: 'Fresh carrot' },
  onion: { name: 'Onion', type: 'crop', subtype: 'vegetable', icon: '\u{1F9C5}', stackable: true, maxStack: 99, desc: 'Fresh onion' },
  flax_harvested: { name: 'Flax Fibers', type: 'crop', subtype: 'fiber', icon: '\u{1F33F}', stackable: true, maxStack: 99, desc: 'Processed flax fibers' },

  // Valuables
  gem: { name: 'Gemstone', type: 'valuable', subtype: 'gem', icon: '\u{1F48E}', stackable: true, maxStack: 10, desc: 'A glittering gemstone' },
  bone: { name: 'Bone', type: 'material', subtype: 'bone', icon: '\u{1F9B4}', stackable: true, maxStack: 99, desc: 'Animal bone for crafting' },
  hide: { name: 'Animal Hide', type: 'material', subtype: 'hide', icon: '\u{1F9F4}', stackable: true, maxStack: 99, desc: 'Raw animal hide' },
  arrow: { name: 'Arrow', type: 'ammo', subtype: 'arrow', icon: '\u{27B3}', stackable: true, maxStack: 50, desc: 'Bow ammunition' },

  // Armor
  leather_armor: { name: 'Leather Armor', type: 'armor', subtype: 'body', tier: 1, durability: 200, maxDurability: 200, icon: '\u{1F9E5}', stackable: false, desc: 'Tough leather tunic', defense: 15 },
  chain_armor: { name: 'Chainmail', type: 'armor', subtype: 'body', tier: 2, durability: 350, maxDurability: 350, icon: '\u{1F9E5}', stackable: false, desc: 'Interlocking iron rings', defense: 30 },
  plate_armor: { name: 'Plate Armor', type: 'armor', subtype: 'body', tier: 3, durability: 500, maxDurability: 500, icon: '\u{1F9E5}', stackable: false, desc: 'Full steel plate', defense: 50 },
  helm_leather: { name: 'Leather Cap', type: 'armor', subtype: 'head', tier: 1, durability: 100, maxDurability: 100, icon: '\u{1F3A9}', stackable: false, desc: 'Simple leather cap', defense: 5 },
  helm_iron: { name: 'Iron Helm', type: 'armor', subtype: 'head', tier: 2, durability: 200, maxDurability: 200, icon: '\u{1F3A9}', stackable: false, desc: 'Iron skullcap', defense: 12 },
  boots_leather: { name: 'Leather Boots', type: 'armor', subtype: 'feet', tier: 1, durability: 120, maxDurability: 120, icon: '\u{1F97E}', stackable: false, desc: 'Sturdy leather boots', defense: 5 },
  boots_iron: { name: 'Iron Boots', type: 'armor', subtype: 'feet', tier: 2, durability: 250, maxDurability: 250, icon: '\u{1F97E}', stackable: false, desc: 'Reinforced iron boots', defense: 10 },
};

export const STORAGE_KEY = 'inventory';

export function createItem(id, quantity = 1) {
  const def = ITEM_DEFS[id];
  if (!def) return null;
  const item = { id, quantity };
  if (!def.stackable) item.quantity = 1;
  if (def.durability !== undefined) item.durability = def.durability;
  if (def.maxDurability !== undefined) item.maxDurability = def.maxDurability;
  return item;
}

export function getItemDef(id) {
  return ITEM_DEFS[id];
}

export function getItemName(id) {
  const def = ITEM_DEFS[id];
  return def ? def.name : 'Unknown';
}

export function getItemIcon(id) {
  const def = ITEM_DEFS[id];
  return def ? def.icon : '?';
}

export function canStack(item1, item2) {
  if (!item1 || !item2) return false;
  const def = ITEM_DEFS[item1.id];
  if (!def || !def.stackable) return false;
  return item1.id === item2.id;
}

export function addToInventory(inventory, itemId, quantity = 1) {
  const def = ITEM_DEFS[itemId];
  if (!def) return quantity;
  const remaining = quantity;

  if (def.stackable) {
    for (let i = 0; i < inventory.length; i++) {
      const slot = inventory[i];
      if (slot && slot.id === itemId && slot.quantity < (def.maxStack || 99)) {
        const space = (def.maxStack || 99) - slot.quantity;
        const add = Math.min(space, remaining);
        slot.quantity += add;
        if (add >= remaining) return 0;
        return remaining - add;
      }
    }
  }

  if (inventory.length < 30) {
    const item = createItem(itemId, quantity);
    inventory.push(item);
    return 0;
  }

  return remaining;
}

export function removeFromInventory(inventory, index, quantity = 1) {
  if (index < 0 || index >= inventory.length) return null;
  const item = inventory[index];
  if (!item) return null;

  if (item.quantity <= quantity) {
    return inventory.splice(index, 1)[0];
  }
  item.quantity -= quantity;
  return { ...item, quantity };
}

export function getItemQuantity(inventory, itemId) {
  let total = 0;
  for (const item of inventory) {
    if (item && item.id === itemId) {
      total += item.quantity;
    }
  }
  return total;
}

export function hasItems(inventory, itemId, quantity) {
  return getItemQuantity(inventory, itemId) >= quantity;
}

export function consumeItems(inventory, itemId, quantity) {
  let remaining = quantity;
  for (let i = inventory.length - 1; i >= 0 && remaining > 0; i--) {
    if (inventory[i] && inventory[i].id === itemId) {
      if (inventory[i].quantity <= remaining) {
        remaining -= inventory[i].quantity;
        inventory.splice(i, 1);
      } else {
        inventory[i].quantity -= remaining;
        remaining = 0;
      }
    }
  }
  return remaining === 0;
}

export function getItemDamage(item) {
  const def = ITEM_DEFS[item?.id];
  return def?.damage || 0;
}

export function getItemDefense(item) {
  const def = ITEM_DEFS[item?.id];
  return def?.defense || 0;
}

export function reduceDurability(item, amount = 1) {
  if (!item || item.durability === undefined) return;
  item.durability -= amount;
  if (item.durability <= 0) return true;
  return false;
}
