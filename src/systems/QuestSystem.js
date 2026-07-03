import { addToInventory, consumeItems, getItemQuantity } from './Inventory.js';

let questIdCounter = 0;

const QUEST_TYPES = [
  {
    type: 'gather',
    generate: (npc, playerLevel) => {
      const targets = ['wood','stone','wheat','carrot','iron_ore','flax_harvested','leather'];
      const target = targets[Math.floor(Math.random() * targets.length)];
      const qty = 3 + Math.floor(Math.random() * 4) + Math.floor(playerLevel / 2);
      return {
        id: `quest_${++questIdCounter}`,
        type: 'gather',
        giver: npc.name,
        desc: `Bring ${qty}x ${target} to ${npc.name}`,
        targetId: target,
        targetQty: qty,
        progress: 0,
        reward: { skill: 'farming', xp: 20 + qty * 5 },
        completed: false,
      };
    },
  },
  {
    type: 'hunt',
    generate: (npc, playerLevel) => {
      const targets = ['bandit','wolf','boar'];
      const target = targets[Math.floor(Math.random() * targets.length)];
      const qty = 2 + Math.floor(Math.random() * 3);
      return {
        id: `quest_${++questIdCounter}`,
        type: 'hunt',
        giver: npc.name,
        desc: `Hunt ${qty} ${target}s near the village`,
        targetId: target,
        targetQty: qty,
        progress: 0,
        reward: { skill: 'hunting', xp: 30 + qty * 10 },
        completed: false,
      };
    },
  },
  {
    type: 'deliver',
    generate: (npc, playerLevel) => {
      const items = ['bread','ale','stew','meat_cooked'];
      const item = items[Math.floor(Math.random() * items.length)];
      const qty = 1 + Math.floor(Math.random() * 2);
      return {
        id: `quest_${++questIdCounter}`,
        type: 'deliver',
        giver: npc.name,
        desc: `Deliver ${qty}x ${item} to ${npc.name}`,
        targetId: item,
        targetQty: qty,
        progress: 0,
        reward: { skill: 'cooking', xp: 25 + qty * 8 },
        completed: false,
      };
    },
  },
];

export class QuestSystem {
  constructor(events, player) {
    this.events = events;
    this.player = player;
    this.activeQuests = [];
    this.completedQuests = [];
    this.legacyScore = 0;
  }

  generateQuest(npc) {
    const types = QUEST_TYPES.filter(t => {
      if (t.type === 'hunt') return true;
      return true;
    });
    const template = types[Math.floor(Math.random() * types.length)];
    const playerLevel = Object.values(this.player?.skills || { combat:1, hunting:1, farming:1, cooking:1, crafting:1 }).reduce((a, b) => a + b, 0) / 5;
    const quest = template.generate(npc, playerLevel);
    this.activeQuests.push(quest);
    return quest;
  }

  updateProgress(enemyKillType) {
    for (const q of this.activeQuests) {
      if (q.completed) continue;
      if (q.type === 'hunt' && enemyKillType === q.targetId) {
        q.progress = Math.min(q.targetQty, q.progress + 1);
        if (q.progress >= q.targetQty) {
          q.completed = true;
          this.events.emit('quest:completed', q);
        }
      }
    }
  }

  checkGatherQuest(inventory) {
    for (const q of this.activeQuests) {
      if (q.completed || q.type !== 'gather') continue;
      q.progress = Math.min(q.targetQty, getItemQuantity(inventory, q.targetId));
      if (q.progress >= q.targetQty) {
        q.completed = true;
        this.events.emit('quest:completed', q);
      }
    }
  }

  completeQuest(questId, inventory) {
    const q = this.activeQuests.find(q => q.id === questId);
    if (!q || !q.completed) return false;

    if (q.type === 'gather' || q.type === 'deliver') {
      if (!consumeItems(inventory, q.targetId, q.targetQty)) return false;
    }

    if (this.player && q.reward) {
      this.player.addSkillXp(q.reward.skill, q.reward.xp);
    }

    this.legacyScore += 10 + q.targetQty * 2;
    this.completedQuests.push(q);
    this.activeQuests = this.activeQuests.filter(q2 => q2.id !== questId);
    return true;
  }

  getAvailableQuest(npc) {
    return this.activeQuests.find(q => q.giver === npc.name && !q.completed);
  }

  generateNewQuest(npc) {
    const existing = this.getAvailableQuest(npc);
    if (existing) return existing;
    if (this.completedQuests.filter(q => q.giver === npc.name).length > 2) return null;
    const quest = this.generateQuest(npc);
    return quest;
  }

  getStats() {
    return {
      active: this.activeQuests.length,
      completed: this.completedQuests.length,
      legacyScore: this.legacyScore,
    };
  }

  dispose() {
    this.activeQuests = [];
    this.completedQuests = [];
  }
}
