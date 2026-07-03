import { FarmPlot } from '../entities/FarmPlot.js';
import { getItemDef, addToInventory, consumeItems, getItemQuantity } from './Inventory.js';

const SEED_TO_CROP = {
  wheat_seed: 'wheat',
  barley_seed: 'barley',
  cabbage_seed: 'cabbage',
  carrot_seed: 'carrot',
  flax_seed: 'flax',
  onion_set: 'onion',
};

const CROP_TO_SEED = {
  wheat: 'wheat_seed',
  barley: 'barley_seed',
  cabbage: 'cabbage_seed',
  carrot: 'carrot_seed',
  flax: 'flax_seed',
  onion: 'onion_set',
};

export class FarmingSystem {
  constructor(scene, physics, events) {
    this.scene = scene;
    this.physics = physics;
    this.events = events;
    this.plots = [];
  }

  createPlot(position) {
    const plot = new FarmPlot(this.scene, this.physics, position);
    plot.init();
    this.plots.push(plot);
    return plot;
  }

  getPlotAt(position, range = 1.2) {
    for (const plot of this.plots) {
      if (!plot.alive) continue;
      const dist = plot.position.distanceTo(position);
      if (dist < range) return plot;
    }
    return null;
  }

  tillGround(playerPos, playerInv) {
    const existing = this.getPlotAt(playerPos);
    if (existing) return { success: false, message: 'Already tilled here' };

    const hoe = playerInv.find(i => i && getItemDef(i.id)?.subtype === 'hoe' && i.durability > 0);
    if (!hoe) return { success: false, message: 'Need a hoe' };

    const plot = this.createPlot(playerPos);
    hoe.durability--;
    if (hoe.durability <= 0) {
      const idx = playerInv.indexOf(hoe);
      if (idx !== -1) playerInv.splice(idx, 1);
    }
    return { success: true, message: 'Tilled soil', plot };
  }

  plantSeed(playerPos, playerInv, seedId) {
    const plot = this.getPlotAt(playerPos);
    if (!plot) return { success: false, message: 'No tilled soil nearby' };
    if (plot.crop) return { success: false, message: 'Already planted' };
    if (!getItemQuantity(playerInv, seedId)) return { success: false, message: 'No seeds' };

    consumeItems(playerInv, seedId, 1);
    const cropId = SEED_TO_CROP[seedId] || seedId.replace('_seed', '').replace('_set', '');
    plot.plant(cropId);
    return { success: true, message: `Planted ${cropId}` };
  }

  waterPlot(playerPos, playerInv) {
    const plot = this.getPlotAt(playerPos);
    if (!plot) return { success: false, message: 'No plot nearby' };
    if (plot.waterLevel >= plot.maxWater) return { success: false, message: 'Already watered' };

    const bucket = playerInv.find(i => i && getItemDef(i.id)?.subtype === 'bucket');
    if (!bucket) return { success: false, message: 'Need a bucket' };
    if (bucket.durability !== undefined) bucket.durability--;

    plot.water(1);
    return { success: true, message: 'Watered plot', plot };
  }

  fertilizePlot(playerPos, playerInv, fertId) {
    const plot = this.getPlotAt(playerPos);
    if (!plot) return { success: false, message: 'No plot nearby' };
    if (!getItemQuantity(playerInv, fertId)) return { success: false, message: `No ${fertId}` };

    const def = getItemDef(fertId);
    const bonus = def?.fertilizer || 0.3;
    consumeItems(playerInv, fertId, 1);
    plot.soilQuality += bonus;
    plot.fertilized = true;
    return { success: true, message: 'Fertilized soil' };
  }

  harvestPlot(playerPos, playerInv) {
    const plot = this.getPlotAt(playerPos);
    if (!plot) return { success: false, message: 'No plot nearby' };
    if (!plot.isReady()) return { success: false, message: 'Crop not ready' };

    const cropId = plot.harvest();
    if (cropId) {
      addToInventory(playerInv, cropId, 2);
      const seedId = CROP_TO_SEED[cropId];
      if (seedId && Math.random() < 0.3) {
        addToInventory(playerInv, seedId, 1);
      }
    }
    return { success: true, message: `Harvested ${cropId}` };
  }

  update(delta, currentSeason) {
    for (const plot of this.plots) {
      if (plot.alive) plot.update(delta, currentSeason);
    }
  }

  getNearestPlotInfo(pos, range = 2) {
    for (const plot of this.plots) {
      if (!plot.alive) continue;
      const dist = plot.position.distanceTo(pos);
      if (dist < range) {
        return {
          plot,
          dist,
          canHarvest: plot.isReady(),
          cropPlanted: !!plot.crop,
          stage: plot.growthStage,
          waterLevel: plot.waterLevel,
          fertilized: plot.fertilized,
        };
      }
    }
    return null;
  }

  dispose() {
    for (const p of this.plots) p.dispose();
    this.plots = [];
  }
}
