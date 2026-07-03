import { addToInventory, createItem, consumeItems, getItemDef, getItemQuantity, ITEM_DEFS } from './Inventory.js';

function hasItems(inv, id, qty) { return getItemQuantity(inv, id) >= qty; }

export const RECIPES = {
  // Campfire cooking
  cooked_meat: {
    name: 'Cooked Meat',
    station: 'campfire',
    skill: 'cooking',
    skillReq: 1,
    ingredients: [{ id: 'meat_raw', qty: 1 }],
    result: { id: 'meat_cooked', qty: 1 },
  },
  bread: {
    name: 'Bread',
    station: 'campfire',
    skill: 'cooking',
    skillReq: 2,
    ingredients: [{ id: 'wheat', qty: 2 }],
    result: { id: 'bread', qty: 1 },
  },
  stew: {
    name: 'Hearty Stew',
    station: 'campfire',
    skill: 'cooking',
    skillReq: 3,
    ingredients: [
      { id: 'meat_cooked', qty: 1 },
      { id: 'carrot', qty: 1 },
      { id: 'cabbage', qty: 1 },
    ],
    result: { id: 'stew', qty: 1 },
  },
  roasted_vegetables: {
    name: 'Roasted Vegetables',
    station: 'campfire',
    skill: 'cooking',
    skillReq: 1,
    ingredients: [
      { id: 'carrot', qty: 1 },
      { id: 'onion', qty: 1 },
    ],
    result: { id: 'stew', qty: 1 },
  },

  // Hearth baking
  pie: {
    name: 'Meat Pie',
    station: 'hearth',
    skill: 'cooking',
    skillReq: 4,
    ingredients: [
      { id: 'wheat', qty: 3 },
      { id: 'meat_cooked', qty: 2 },
      { id: 'cabbage', qty: 1 },
    ],
    result: { id: 'stew', qty: 2 },
  },
  ale: {
    name: 'Ale',
    station: 'hearth',
    skill: 'cooking',
    skillReq: 2,
    ingredients: [{ id: 'barley', qty: 3 }],
    result: { id: 'ale', qty: 1 },
  },

  // Workbench
  wood_axe: {
    name: 'Craft Wooden Axe',
    station: 'workbench',
    skill: 'crafting',
    skillReq: 1,
    ingredients: [
      { id: 'wood', qty: 3 },
      { id: 'stone', qty: 1 },
    ],
    result: { id: 'wood_axe', qty: 1 },
  },
  wood_hoe: {
    name: 'Craft Wooden Hoe',
    station: 'workbench',
    skill: 'crafting',
    skillReq: 1,
    ingredients: [
      { id: 'wood', qty: 2 },
      { id: 'stone', qty: 1 },
    ],
    result: { id: 'wood_hoe', qty: 1 },
  },
  wood_pickaxe: {
    name: 'Craft Wooden Pickaxe',
    station: 'workbench',
    skill: 'crafting',
    skillReq: 1,
    ingredients: [
      { id: 'wood', qty: 3 },
      { id: 'stone', qty: 2 },
    ],
    result: { id: 'wood_pickaxe', qty: 1 },
  },
  bow: {
    name: 'Craft Hunting Bow',
    station: 'workbench',
    skill: 'crafting',
    skillReq: 2,
    ingredients: [
      { id: 'wood', qty: 4 },
      { id: 'cloth', qty: 1 },
    ],
    result: { id: 'bow', qty: 1 },
  },
  wood_shield: {
    name: 'Craft Wooden Shield',
    station: 'workbench',
    skill: 'crafting',
    skillReq: 2,
    ingredients: [
      { id: 'wood', qty: 5 },
      { id: 'leather', qty: 2 },
    ],
    result: { id: 'wood_shield', qty: 1 },
  },
  arrow: {
    name: 'Craft Arrows',
    station: 'workbench',
    skill: 'crafting',
    skillReq: 1,
    ingredients: [
      { id: 'wood', qty: 1 },
      { id: 'stone', qty: 1 },
    ],
    result: { id: 'arrow', qty: 10 },
  },

  // Anvil
  iron_sword: {
    name: 'Forge Iron Sword',
    station: 'anvil',
    skill: 'crafting',
    skillReq: 3,
    ingredients: [
      { id: 'iron_ore', qty: 4 },
      { id: 'wood', qty: 1 },
    ],
    result: { id: 'iron_sword', qty: 1 },
  },
  chain_armor: {
    name: 'Forge Chainmail',
    station: 'anvil',
    skill: 'crafting',
    skillReq: 4,
    ingredients: [{ id: 'iron_ore', qty: 8 }],
    result: { id: 'chain_armor', qty: 1 },
  },
  plate_armor: {
    name: 'Forge Plate Armor',
    station: 'anvil',
    skill: 'crafting',
    skillReq: 5,
    ingredients: [{ id: 'iron_ore', qty: 16 }],
    result: { id: 'plate_armor', qty: 1 },
  },
  helm_iron: {
    name: 'Forge Iron Helm',
    station: 'anvil',
    skill: 'crafting',
    skillReq: 3,
    ingredients: [{ id: 'iron_ore', qty: 3 }],
    result: { id: 'helm_iron', qty: 1 },
  },
  boots_iron: {
    name: 'Forge Iron Boots',
    station: 'anvil',
    skill: 'crafting',
    skillReq: 3,
    ingredients: [{ id: 'iron_ore', qty: 3 }],
    result: { id: 'boots_iron', qty: 1 },
  },

  // Sawmill
  wood: {
    name: 'Process Wood',
    station: 'sawmill',
    skill: 'crafting',
    skillReq: 1,
    ingredients: [{ id: 'wood', qty: 1 }],
    result: { id: 'wood', qty: 2 },
  },

  // Loom
  cloth: {
    name: 'Weave Cloth',
    station: 'loom',
    skill: 'crafting',
    skillReq: 2,
    ingredients: [{ id: 'flax_harvested', qty: 3 }],
    result: { id: 'cloth', qty: 1 },
  },
  leather_armor: {
    name: 'Sew Leather Armor',
    station: 'loom',
    skill: 'crafting',
    skillReq: 3,
    ingredients: [
      { id: 'leather', qty: 4 },
      { id: 'cloth', qty: 2 },
    ],
    result: { id: 'leather_armor', qty: 1 },
  },

  // Kiln
  clay_bricks: {
    name: 'Fire Clay Bricks',
    station: 'kiln',
    skill: 'crafting',
    skillReq: 2,
    ingredients: [{ id: 'clay', qty: 3 }],
    result: { id: 'stone', qty: 2 },
  },

  // Still
  ale_still: {
    name: 'Brew Ale',
    station: 'still',
    skill: 'cooking',
    skillReq: 3,
    ingredients: [{ id: 'barley', qty: 4 }],
    result: { id: 'ale', qty: 2 },
  },
};

export const STATION_TYPES = {
  campfire: { name: 'Campfire', color: 0xFF6600 },
  hearth: { name: 'Hearth', color: 0xCC4400 },
  workbench: { name: 'Workbench', color: 0x8B7355 },
  anvil: { name: 'Anvil', color: 0x444444 },
  sawmill: { name: 'Sawmill', color: 0x6B4226 },
  loom: { name: 'Loom', color: 0x8B7D6B },
  kiln: { name: 'Kiln', color: 0x663300 },
  still: { name: 'Still', color: 0x8B6914 },
};

export function getRecipesForStation(stationType) {
  return Object.entries(RECIPES)
    .filter(([, r]) => r.station === stationType)
    .map(([id, r]) => ({ id, ...r }));
}

export function canCraft(recipe, inventory, skills) {
  if (skills[recipe.skill] < recipe.skillReq) return false;
  for (const ing of recipe.ingredients) {
    if (!hasItems(inventory, ing.id, ing.qty)) return false;
  }
  return true;
}

export function craft(recipe, inventory, skills) {
  if (!canCraft(recipe, inventory, skills)) return false;
  for (const ing of recipe.ingredients) {
    consumeItems(inventory, ing.id, ing.qty);
  }
  addToInventory(inventory, recipe.result.id, recipe.result.qty);
  return true;
}

export function getRepairCost(item) {
  if (!item || item.durability === undefined || item.maxDurability === undefined) return null;
  const def = getItemDef(item.id);
  if (!def) return null;
  const missing = item.maxDurability - item.durability;
  if (missing <= 0) return null;
  const cost = Math.ceil(missing / 50);
  return [
    { id: 'wood', qty: Math.ceil(cost * 0.5) },
    { id: 'iron_ore', qty: Math.ceil(cost * 0.3) },
  ];
}

export function repairItem(item, inventory) {
  const cost = getRepairCost(item);
  if (!cost) return false;
  for (const ing of cost) {
    if (!hasItems(inventory, ing.id, ing.qty)) return false;
  }
  for (const ing of cost) {
    consumeItems(inventory, ing.id, ing.qty);
  }
  item.durability = item.maxDurability;
  return true;
}
