import { CONFIG } from '../config.js';
import { ResourceNode } from '../entities/ResourceNode.js';
import { Bandit } from '../entities/Bandit.js';
import { Wolf } from '../entities/Wolf.js';
import { Boar } from '../entities/Boar.js';
import * as THREE from 'three';

export class ZoneManager {
  constructor(scene, physics, events, terrain) {
    this.scene = scene;
    this.physics = physics;
    this.events = events;
    this.terrain = terrain;
    this.currentZoneId = 'village';
    this.resources = [];
    this.enemies = [];
    this.propGroups = [];
    this.zoneGates = [];
    this.transitioning = false;
  }

  getZoneConfig(zoneId) {
    const entry = Object.values(CONFIG.ZONES).find(z => z.id === zoneId);
    return entry || CONFIG.ZONES.VILLAGE;
  }

  getZoneSpawns(zoneId) {
    switch (zoneId) {
      case 'village':
        return {
          resources: ['tree', 'tree', 'rock', 'bush', 'clay'],
          resourceCount: 15,
          enemies: [],
          enemyCount: 0,
          trees: 20,
          rocks: 5,
        };
      case 'forest':
        return {
          resources: ['tree', 'tree', 'tree', 'bush', 'flax'],
          resourceCount: 25,
          enemies: ['wolf', 'wolf', 'boar'],
          enemyCount: 6,
          trees: 60,
          rocks: 5,
        };
      case 'riverlands':
        return {
          resources: ['clay', 'clay', 'bush', 'rock', 'flax'],
          resourceCount: 18,
          enemies: ['wolf', 'boar'],
          enemyCount: 4,
          trees: 15,
          rocks: 10,
        };
      case 'farmlands':
        return {
          resources: ['bush', 'bush', 'flax', 'tree'],
          resourceCount: 12,
          enemies: ['boar'],
          enemyCount: 2,
          trees: 5,
          rocks: 3,
        };
      case 'mine':
        return {
          resources: ['iron_ore', 'iron_ore', 'rock', 'rock', 'clay'],
          resourceCount: 20,
          enemies: ['bandit'],
          enemyCount: 5,
          trees: 3,
          rocks: 20,
        };
      case 'banditcamp':
        return {
          resources: ['tree', 'rock', 'bush'],
          resourceCount: 8,
          enemies: ['bandit', 'bandit', 'wolf'],
          enemyCount: 8,
          trees: 8,
          rocks: 5,
        };
      case 'ruins':
        return {
          resources: ['rock', 'rock', 'iron_ore', 'bush'],
          resourceCount: 10,
          enemies: ['bandit', 'bandit', 'bandit', 'wolf'],
          enemyCount: 7,
          trees: 5,
          rocks: 15,
        };
      default:
        return this.getZoneSpawns('village');
    }
  }

  transitionTo(zoneId, loadingScreen, onReady) {
    if (this.transitioning || zoneId === this.currentZoneId) return;
    this.transitioning = true;
    const zone = this.getZoneConfig(zoneId);

    loadingScreen.show();
    loadingScreen.setMessage(`Traveling to ${zone.name}...`);
    loadingScreen.setProgress(0);

    setTimeout(() => {
      this._clearZone();
      loadingScreen.setProgress(0.3);
      loadingScreen.setMessage(`Generating ${zone.name} terrain...`);
    }, 150);

    setTimeout(() => {
      this.terrain.seed = Math.random() * 1000 + (CONFIG.ZONES[zoneId.toUpperCase()]?.color || 0);
      this.terrain.generate();
      loadingScreen.setProgress(0.5);
      loadingScreen.setMessage('Placing resources...');
    }, 350);

    setTimeout(() => {
      this._populateZone(zoneId);
      loadingScreen.setProgress(0.8);
      loadingScreen.setMessage('Spawning inhabitants...');
    }, 550);

    setTimeout(() => {
      this.currentZoneId = zoneId;
      this.events.emit('zone:changed', { zone: zoneId, zoneName: zone.name });
      loadingScreen.setProgress(1);
      loadingScreen.setMessage(`Welcome to ${zone.name}`);

      if (onReady) onReady();

      this.transitioning = false;
      setTimeout(() => loadingScreen.hide(), 500);
    }, 900);
  }

  _clearZone() {
    for (const r of this.resources) {
      if (r.dispose) r.dispose();
    }
    this.resources = [];

    for (const e of this.enemies) {
      if (e.dispose) e.dispose();
    }
    this.enemies = [];

    for (const g of this.propGroups) {
      if (g.parent) g.parent.remove(g);
      g.traverse((child) => {
        if (child.isMesh) {
          child.geometry.dispose();
          child.material.dispose();
        }
      });
    }
    this.propGroups = [];

    for (const g of this.zoneGates) {
      if (g.mesh) {
        this.scene.remove(g.mesh);
        g.mesh.traverse((c) => { if (c.isMesh) { c.geometry.dispose(); c.material.dispose(); } });
      }
      if (g.physicsBody) {
        this.physics.removeBody(g.physicsBody);
      }
    }
    this.zoneGates = [];
  }

  _populateZone(zoneId) {
    const spawns = this.getZoneSpawns(zoneId);
    const terrain = this.terrain;

    for (let i = 0; i < spawns.resourceCount; i++) {
      const type = spawns.resources[Math.floor(Math.random() * spawns.resources.length)];
      const x = (Math.random() - 0.5) * 80;
      const z = (Math.random() - 0.5) * 80;
      const y = terrain.getHeightAt(x, z);
      if (y < 0.5 || y > 6) continue;
      const node = new ResourceNode(this.scene, this.physics, type, new THREE.Vector3(x, y, z));
      node.init();
      this.resources.push(node);
    }

    for (let i = 0; i < spawns.enemyCount; i++) {
      const type = spawns.enemies[Math.floor(Math.random() * spawns.enemies.length)];
      const x = (Math.random() - 0.5) * 80;
      const z = (Math.random() - 0.5) * 80;
      const y = terrain.getHeightAt(x, z);
      if (y < 0.5 || y > 6) continue;
      let enemy;
      if (type === 'bandit') {
        enemy = new Bandit(this.scene, this.physics, this.events, 1 + Math.floor(Math.random() * 2));
      } else if (type === 'wolf') {
        enemy = new Wolf(this.scene, this.physics, this.events);
      } else {
        enemy = new Boar(this.scene, this.physics, this.events);
      }
      enemy.setPosition(x, y, z);
      enemy.init();
      this.enemies.push(enemy);
    }

    const treeGroup = terrain.generateTrees(spawns.trees);
    if (treeGroup) this.propGroups.push(treeGroup);

    const rockGroup = terrain.generateRocks(spawns.rocks);
    if (rockGroup) this.propGroups.push(rockGroup);

    this._buildZoneGates(zoneId);
  }

  _buildZoneGates(zoneId) {
    const gates = CONFIG.ZONE_GATES;
    for (const gateDef of gates) {
      if (gateDef.from !== zoneId) continue;
      const gateMat = new THREE.MeshStandardMaterial({
        color: 0xFFD700, transparent: true, opacity: 0.3,
        emissive: 0xFFD700, emissiveIntensity: 0.2,
      });
      const archMat = new THREE.MeshStandardMaterial({
        color: 0x8B7355, roughness: 0.9,
      });
      const group = new THREE.Group();

      const pillarGeo = new THREE.BoxGeometry(0.3, 3, 0.3);
      const leftPillar = new THREE.Mesh(pillarGeo, archMat);
      leftPillar.position.set(gateDef.x - 1.5, 1.5, gateDef.z);
      group.add(leftPillar);

      const rightPillar = new THREE.Mesh(pillarGeo, archMat);
      rightPillar.position.set(gateDef.x + 1.5, 1.5, gateDef.z);
      group.add(rightPillar);

      const crossGeo = new THREE.BoxGeometry(3.3, 0.2, 0.3);
      const cross = new THREE.Mesh(crossGeo, archMat);
      cross.position.set(gateDef.x, 3, gateDef.z);
      group.add(cross);

      const glow = new THREE.Mesh(new THREE.PlaneGeometry(3, 3.5), gateMat);
      glow.position.set(gateDef.x, 1.5, gateDef.z);
      group.add(glow);

      this.scene.add(group);
      this.propGroups.push(group);

      const zoneTo = this.getZoneConfig(gateDef.to);
      const label = document.createElement('div');
      label.textContent = `To ${zoneTo.name}`;
      label.style.cssText = `
        position: fixed; color: #FFD700; font-size: 12px;
        font-family: Georgia, serif; text-shadow: 0 0 10px rgba(0,0,0,0.9);
        pointer-events: none; z-index: 50;
        opacity: 0; transition: opacity 0.3s;
      `;
      document.body.appendChild(label);

      this.zoneGates.push({
        def: gateDef,
        label,
        triggerPos: new THREE.Vector3(gateDef.x, 0, gateDef.z),
        destPos: new THREE.Vector3(gateDef.destX, 0, gateDef.destZ),
        isNear: false,
      });
    }
  }

  updateGates(playerPos, loadingScreen) {
    for (const gate of this.zoneGates) {
      const dist = playerPos.distanceTo(gate.triggerPos);
      if (!gate.label) continue;

      if (dist < 3) {
        gate.isNear = true;
        const screenPos = this._worldToScreen(gate.triggerPos.x, gate.triggerPos.y + 1, gate.triggerPos.z);
        if (screenPos) {
          gate.label.style.left = screenPos.x + 'px';
          gate.label.style.top = screenPos.y + 'px';
          gate.label.style.opacity = '1';
          gate.label.textContent = `[E] Travel to ${this.getZoneConfig(gate.def.to).name}`;
        }
        if (dist < 2.5) {
          this._checkGateActivation(gate, loadingScreen);
        }
      } else {
        gate.isNear = false;
        gate.label.style.opacity = '0';
      }
    }
  }

  _checkGateActivation(gate, loadingScreen) {
    this._gateActivationPending = gate;
  }

  activatePendingGate(loadingScreen, teleportFn) {
    if (this._gateActivationPending) {
      const gate = this._gateActivationPending;
      this._gateActivationPending = null;
      this.transitionTo(gate.def.to, loadingScreen, () => {
        const dest = gate.destPos.clone();
        const height = this.terrain.getHeightAt(dest.x, dest.z);
        dest.y = Math.max(height, 0.5) + 2;
        teleportFn(dest);
      });
      return true;
    }
    return false;
  }

  isAtAnyGate() {
    return !!this._gateActivationPending;
  }

  _worldToScreen(x, y, z) {
    return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  }

  getEnemies() {
    return this.enemies;
  }

  dispose() {
    this._clearZone();
  }
}
