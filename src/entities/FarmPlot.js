import * as THREE from 'three';
import { CONFIG } from '../config.js';

const CROP_STAGE_MATS = {
  0: { color: 0x8B4513, size: 0.05, yOff: 0.02, label: 'tilled' },
  1: { color: 0xCD853F, size: 0.08, yOff: 0.04, label: 'seed' },
  2: { color: 0x6B8E23, size: 0.15, yOff: 0.08, label: 'sprout' },
  3: { color: 0x556B2F, size: 0.3, yOff: 0.15, label: 'growing' },
  4: { color: 0x9ACD32, size: 0.5, yOff: 0.25, label: 'mature' },
  5: { color: 0xDAA520, size: 0.7, yOff: 0.35, label: 'ready' },
};

export class FarmPlot {
  constructor(scene, physics, position) {
    this.scene = scene;
    this.physics = physics;
    this.position = position.clone();
    this.alive = true;

    this.crop = null;
    this.growthStage = 0;
    this.growthProgress = 0;
    this.waterLevel = 0;
    this.soilQuality = 1.0;
    this.fertilized = false;
    this.maxWater = 3;

    this.mesh = null;
    this.cropMesh = null;
    this.body = null;
  }

  init() {
    const soilMat = new THREE.MeshStandardMaterial({
      color: 0x5C4033, roughness: 0.95, metalness: 0.0,
    });
    const geo = new THREE.CircleGeometry(0.6, 12);
    geo.rotateX(-Math.PI / 2);
    this.mesh = new THREE.Mesh(geo, soilMat);
    this.mesh.position.copy(this.position);
    this.mesh.position.y += 0.02;
    this.mesh.receiveShadow = true;
    this.scene.add(this.mesh);
  }

  plant(cropId) {
    if (this.crop) return false;
    this.crop = cropId;
    this.growthStage = 1;
    this.growthProgress = 0;
    this._updateCropVisual();
    return true;
  }

  water(amount = 1) {
    if (this.waterLevel >= this.maxWater) return false;
    this.waterLevel = Math.min(this.maxWater, this.waterLevel + amount);

    if (this.crop && this.waterLevel > 0) {
      const wetMat = new THREE.MeshStandardMaterial({
        color: 0x3C2E22, roughness: 0.9, metalness: 0.1,
      });
      this.mesh.material = wetMat;
    }
    return true;
  }

  fertilize() {
    if (this.fertilized) return false;
    this.fertilized = true;
    this.soilQuality = Math.min(2.0, this.soilQuality + 0.5);
    return true;
  }

  update(delta, currentSeason) {
    if (!this.alive || !this.crop) return;

    const cropDef = CONFIG.CROPS[this.crop.toUpperCase()];
    if (!cropDef) return;

    const inSeason = cropDef.seasons.includes(currentSeason);
    const waterBonus = this.waterLevel > 0 ? 1.5 : 0.5;
    const soilBonus = this.soilQuality;
    const fertBonus = this.fertilized ? 1.3 : 1.0;
    const seasonPenalty = inSeason ? 1.0 : 0.2;

    const growRate = 0.2 * waterBonus * soilBonus * fertBonus * seasonPenalty;
    this.growthProgress += growRate * delta;

    if (this.waterLevel > 0) {
      this.waterLevel -= 0.005 * delta;
      if (this.waterLevel < 0) this.waterLevel = 0;
    }

    const stageThresholds = [0, 0.1, 0.3, 0.5, 0.75, 1.0];
    let newStage = 0;
    for (let s = stageThresholds.length - 1; s >= 0; s--) {
      if (this.growthProgress >= stageThresholds[s]) { newStage = s; break; }
    }

    if (newStage !== this.growthStage) {
      this.growthStage = newStage;
      this._updateCropVisual();
    }
  }

  isReady() {
    return this.crop && this.growthStage >= 5;
  }

  harvest() {
    if (!this.isReady()) return null;
    const result = this.crop;
    this.crop = null;
    this.growthStage = 0;
    this.growthProgress = 0;
    this.waterLevel = 0;
    this.fertilized = false;
    if (this.cropMesh) {
      this.scene.remove(this.cropMesh);
      this.cropMesh.traverse((c) => { if (c.isMesh) { c.geometry.dispose(); c.material.dispose(); } });
      this.cropMesh = null;
    }
    const dryMat = new THREE.MeshStandardMaterial({
      color: 0x5C4033, roughness: 0.95, metalness: 0.0,
    });
    this.mesh.material = dryMat;
    return result;
  }

  _updateCropVisual() {
    if (this.cropMesh) {
      this.scene.remove(this.cropMesh);
      this.cropMesh.traverse((c) => { if (c.isMesh) { c.geometry.dispose(); c.material.dispose(); } });
      this.cropMesh = null;
    }
    if (!this.crop || this.growthStage <= 0) return;

    const stage = CROP_STAGE_MATS[this.growthStage] || CROP_STAGE_MATS[5];
    const group = new THREE.Group();

    if (this.growthStage >= 1) {
      const mat = new THREE.MeshStandardMaterial({ color: stage.color, roughness: 0.8 });
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, stage.size, 4), mat);
      stem.position.y = stage.yOff;
      group.add(stem);
    }
    if (this.growthStage >= 3) {
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x228B22, roughness: 0.9 });
      for (let i = 0; i < 3; i++) {
        const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.01, 0.15), leafMat);
        leaf.position.set(0, stage.yOff * 1.2, 0);
        leaf.rotation.y = (i / 3) * Math.PI * 2;
        leaf.rotation.x = 0.3;
        group.add(leaf);
      }
    }
    if (this.growthStage >= 4) {
      const headMat = new THREE.MeshStandardMaterial({
        color: this.growthStage >= 5 ? 0xDAA520 : 0x9ACD32, roughness: 0.7,
      });
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.08, 5, 5), headMat);
      head.position.y = stage.yOff + 0.1;
      group.add(head);
    }

    group.position.copy(this.position);
    this.cropMesh = group;
    this.scene.add(group);
  }

  dispose() {
    this.alive = false;
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
      this.mesh = null;
    }
    if (this.cropMesh) {
      this.scene.remove(this.cropMesh);
      this.cropMesh.traverse((c) => { if (c.isMesh) { c.geometry.dispose(); c.material.dispose(); } });
      this.cropMesh = null;
    }
  }
}
