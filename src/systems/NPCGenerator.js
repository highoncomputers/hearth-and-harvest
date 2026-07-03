import { NPC } from '../entities/NPC.js';
import * as THREE from 'three';

const FIRST_NAMES = {
  male: ['Aldric','Baldur','Cedric','Duncan','Eadric','Finn','Gareth','Hugh','Ivar','Jorah','Kael','Leif','Merek','Niall','Orin','Percival','Ronan','Sigurd','Tristan','Ulric','Willem','Yorick'],
  female: ['Aeliana','Brigid','Catra','Della','Elara','Freyja','Greta','Helga','Isolde','Jenna','Katla','Lena','Mira','Nora','Olga','Petra','Runa','Sif','Tova','Ulla','Wren','Yrsa'],
};

const ROLES = [
  { role: 'farmer', title: 'the Farmer', dialogue: { greeting:'The soil is good this season.', trade:'Got surplus crops to trade.', quest:'Could use help in the fields.', gossip:'Heard bandits been seen near the forest.' }, desires:['hoe','wood','manure'], offers:['wheat','carrot','cabbage','berries'] },
  { role: 'blacksmith', title: 'the Blacksmith', dialogue: { greeting:'Need something forged?', trade:'Got spare materials? I can trade.', quest:'Need more iron ore for the forge.', gossip:'My bellows keep acting up in the damp.' }, desires:['iron_ore','wood','stone'], offers:['iron_sword','knife','arrow','boots_iron'] },
  { role: 'baker', title: 'the Baker', dialogue: { greeting:'Fresh bread just out of the oven!', trade:'I could use more wheat for milling.', quest:'Ran out of wheat again...', gossip:'The miller\'s been acting strange lately.' }, desires:['wheat','barley','wood'], offers:['bread','ale'] },
  { role: 'hunter', title: 'the Hunter', dialogue: { greeting:'Plenty of game in the woods.', trade:'Got fresh meat. What you got?', quest:'Wolves been getting too bold near the village.', gossip:'Saw strange tracks near the old ruins.' }, desires:['bow','arrow','knife','hide'], offers:['meat_raw','leather','bone','hide'] },
  { role: 'merchant', title: 'the Merchant', dialogue: { greeting:'Always looking for new goods.', trade:'Show me what you\'ve got.', quest:'Need an escort for my next caravan.', gossip:'Trade routes have been dangerous lately.' }, desires:['gem','cloth','flax_harvested','ale'], offers:['cloth','hide','arrow','berries'] },
  { role: 'carpenter', title: 'the Carpenter', dialogue: { greeting:'Woodworking keeps the village standing.', trade:'Need building materials?', quest:'Ran out of good timber.', gossip:'The well needs new planks, heard it creaking.' }, desires:['wood','axe','stone'], offers:['wood','bow','wood_shield'] },
  { role: 'tailor', title: 'the Tailor', dialogue: { greeting:'Nice threads you got there.', trade:'I can work with good cloth.', quest:'Need more flax for weaving.', gossip:'Saw a traveler with the finest silks...' }, desires:['flax_harvested','cloth','leather'], offers:['cloth','leather_armor','boots_leather'] },
  { role: 'guard', title: 'the Guard', dialogue: { greeting:'Keep the peace, stranger.', trade:'I trade weapons and armor.', quest:'Bandits have been getting bold.', gossip:'Captain says we\'re short on supplies.' }, desires:['iron_sword','bow','arrow','shield'], offers:['wood_shield','bone','arrow','stone'] },
  { role: 'priest', title: 'the Priest', dialogue: { greeting:'Blessings of the old gods upon you.', trade:'I accept offerings for the shrine.', quest:'The shrine needs repairs.', gossip:'The old gods are restless this season.' }, desires:['gem','ale','bread','stew'], offers:['bread','ale','berries'] },
  { role: 'bard', title: 'the Bard', dialogue: { greeting:'A tale for a coin? No coins here, but I\'ll trade.', trade:'Got anything interesting?', quest:'Need inspiration for my next song.', gossip:'Heard tell of treasure in the old ruins...' }, desires:['ale','stew','gem','berries'], offers:['berries','bone','hide','arrow'] },
];

function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generateAppearance() {
  const skinTones = [0xD4A574, 0xC49A6C, 0xE0B892, 0xBE8C5A, 0xA0744A];
  const hairColors = [0x1A0A00, 0x2A1A0A, 0x4A2A1A, 0x6A3A1A, 0x8B5A2A, 0xA0764A, 0xCC8844];
  const clothesColors = [0x5A4A3A, 0x3A5A3A, 0x4A3A5A, 0x5A3A3A, 0x3A4A5A, 0x5A5A3A, 0x6A4A2A, 0x2A5A4A];
  return {
    skin: randomFrom(skinTones),
    hair: randomFrom(hairColors),
    clothes: randomFrom(clothesColors),
  };
}

const ITEM_POOLS = {
  wheat: 'wheat_seed', carrot: 'carrot_seed', cabbage: 'cabbage_seed',
  wood: 'wood', stone: 'stone', iron_ore: 'iron_ore',
  berries: 'berries', arrow: 'arrow', bone: 'bone', hide: 'hide',
  leather: 'leather', cloth: 'cloth', flax_harvested: 'flax_harvested',
  meat_raw: 'meat_raw', bread: 'bread', ale: 'ale', stew: 'stew',
  hoe: 'wood_hoe', knife: 'knife', axe: 'wood_axe',
  bow: 'bow', iron_sword: 'iron_sword', wood_shield: 'wood_shield',
  shield: 'wood_shield', manure: 'manure',
  boots_iron: 'boots_iron', boots_leather: 'boots_leather',
  leather_armor: 'leather_armor', gem: 'gem',
};

function mapItems(names) {
  return names.map(n => ITEM_POOLS[n] || n).filter(Boolean);
}

function generateDesiresOffers(roleData) {
  const desires = mapItems(roleData.desires);
  const offers = mapItems(roleData.offers);
  return {
    desires: desires.slice(0, 3).map(id => ({ id, qtyNeeded: 1 + Math.floor(Math.random() * 3), qtyOffered: 1 + Math.floor(Math.random() * 3) })),
    offers: offers.slice(0, 3).map(id => ({ id, qty: 1 + Math.floor(Math.random() * 3) })),
  };
}

export function generateNPCs(scene, physics, events, terrain, count = 6) {
  const npcs = [];
  const usedPositions = [];

  for (let i = 0; i < count; i++) {
    const isMale = Math.random() < 0.6;
    const namePool = isMale ? FIRST_NAMES.male : FIRST_NAMES.female;
    const firstName = randomFrom(namePool);
    const roleData = ROLES[i % ROLES.length];
    const lastName = randomFrom(['Ashford','Blackwood','Croft','Durham','Everly','Fairfax','Greymoor','Holloway','Ivywood','Kingsley','Lancaster','Moorland','Northwood','Oakley','Pendleton','Ravenshaw','Sterling','Thornfield','Waverly','Wolfsbane']);

    let x, z, y, attempts = 0;
    do {
      x = (Math.random() - 0.5) * 20;
      z = (Math.random() - 0.5) * 20;
      y = terrain.getHeightAt(x, z);
      attempts++;
    } while ((y < 0.5 || y > 5 || usedPositions.some(p => p.distanceTo(new THREE.Vector3(x, y, z)) < 3)) && attempts < 20);

    const homePos = new THREE.Vector3(x, y, z);
    usedPositions.push(homePos.clone());

    const trade = generateDesiresOffers(roleData);
    const npc = new NPC(scene, physics, {
      name: `${firstName} ${lastName}`,
      role: roleData.role,
      title: roleData.title,
      relation: 15 + Math.floor(Math.random() * 20),
      homePos,
      appearance: generateAppearance(),
      dialogue: roleData.dialogue,
      desires: trade.desires,
      offers: trade.offers,
      questAvailable: Math.random() < 0.4,
    }, events);

    npc.init();
    npc.setWaypointsFromRole(roleData.role, homePos, terrain);
    npcs.push(npc);
  }
  return npcs;
}
