import * as THREE from 'three';
import { Entity } from './Entity.js';

export class ResourceNode extends Entity {
  constructor(scene, physics, type, position) {
    super(scene, physics);
    this.entityType = 'resource';
    this.resourceType = type;
    this.alive = true;
    this.harvested = false;
    this.respawnTimer = 0;
    this.respawnTime = 60;
    this.harvestCount = 0;
    this.maxHarvests = 3;
    this.originalPosition = new THREE.Vector3().copy(position);
    this.addTag('resource');
    this.addTag(type);

    switch (type) {
      case 'tree':
        this.resourceId = 'wood';
        this.harvestTime = 2;
        this.health = 30;
        this.harvestCount = 4;
        break;
      case 'rock':
        this.resourceId = 'stone';
        this.harvestTime = 3;
        this.health = 50;
        this.harvestCount = 3;
        break;
      case 'iron_ore':
        this.resourceId = 'iron_ore';
        this.harvestTime = 4;
        this.health = 80;
        this.harvestCount = 2;
        break;
      case 'bush':
        this.resourceId = 'berries';
        this.harvestTime = 1;
        this.health = 10;
        this.harvestCount = 2;
        break;
      case 'clay':
        this.resourceId = 'clay';
        this.harvestTime = 2;
        this.health = 20;
        this.harvestCount = 5;
        break;
      case 'flax':
        this.resourceId = 'flax';
        this.harvestTime = 1.5;
        this.health = 5;
        this.harvestCount = 2;
        break;
    }
  }

  init() {
    this._buildMesh();
    this.scene.add(this.mesh);
    this.body = this.physics.createBox(0, { x: 0.5, y: 0.5, z: 0.5 }, this.originalPosition);
    this.body.type = 2;
  }

  _buildMesh() {
    switch (this.resourceType) {
      case 'tree': this._buildTree(); break;
      case 'rock': this._buildRock(); break;
      case 'iron_ore': this._buildIronOre(); break;
      case 'bush': this._buildBush(); break;
      case 'clay': this._buildClay(); break;
      case 'flax': this._buildFlax(); break;
    }
    this.mesh.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
      }
    });
  }

  _buildTree() {
    const h = 2 + Math.random() * 2.5;
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5D3A1A, roughness: 0.9 });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.15, h, 6), trunkMat);
    trunk.position.y = h / 2;
    this.mesh.add(trunk);

    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2D5A27, roughness: 0.8 });
    const crownSize = 0.8 + Math.random() * 1.2;
    const crown = new THREE.Mesh(new THREE.SphereGeometry(crownSize, 6, 6), leafMat);
    crown.position.y = h + crownSize * 0.4;
    this.mesh.add(crown);
  }

  _buildRock() {
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x6A6A6A, roughness: 0.95 });
    const size = 0.4 + Math.random() * 0.6;
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(size, 0), rockMat);
    rock.position.y = size * 0.3;
    rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    this.mesh.add(rock);
  }

  _buildIronOre() {
    const mat = new THREE.MeshStandardMaterial({ color: 0x8A6A4A, roughness: 0.8, metalness: 0.3 });
    const size = 0.3 + Math.random() * 0.4;
    const mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(size, 0), mat);
    mesh.position.y = size * 0.3;
    this.mesh.add(mesh);

    const oreMat = new THREE.MeshStandardMaterial({ color: 0xCC8844, roughness: 0.6, metalness: 0.5 });
    const ore = new THREE.Mesh(new THREE.SphereGeometry(size * 0.4, 5, 5), oreMat);
    ore.position.set(Math.random() * 0.2, size * 0.5, Math.random() * 0.2);
    this.mesh.add(ore);
  }

  _buildBush() {
    const mat = new THREE.MeshStandardMaterial({ color: 0x3A6A2A, roughness: 0.9 });
    const size = 0.3 + Math.random() * 0.3;
    const bush = new THREE.Mesh(new THREE.SphereGeometry(size, 6, 5), mat);
    bush.scale.y = 0.6;
    bush.position.y = size * 0.3;
    this.mesh.add(bush);

    const berryMat = new THREE.MeshStandardMaterial({ color: 0xCC3333, roughness: 0.5 });
    for (let i = 0; i < 3; i++) {
      const berry = new THREE.Mesh(new THREE.SphereGeometry(0.04, 4, 4), berryMat);
      berry.position.set((Math.random() - 0.5) * size, size * 0.5, (Math.random() - 0.5) * size);
      this.mesh.add(berry);
    }
  }

  _buildClay() {
    const mat = new THREE.MeshStandardMaterial({ color: 0x8A6A4A, roughness: 0.95 });
    const clay = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.5), mat);
    clay.position.y = 0.1;
    clay.rotation.y = Math.random() * Math.PI;
    this.mesh.add(clay);
  }

  _buildFlax() {
    const mat = new THREE.MeshStandardMaterial({ color: 0x7A9A4A, roughness: 0.8 });
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.5, 4), mat);
    stem.position.y = 0.25;
    this.mesh.add(stem);
    const top = new THREE.Mesh(new THREE.SphereGeometry(0.06, 4, 3), mat);
    top.position.y = 0.55;
    top.scale.y = 0.3;
    this.mesh.add(top);
  }

  onHarvested() {
    this.harvestCount--;
    if (this.harvestCount <= 0) {
      this.harvested = true;
      this.mesh.visible = false;
      this.body.position.y = -10;
      this.respawnTimer = this.respawnTime;
    }
  }

  update(delta) {
    if (this.harvested) {
      this.respawnTimer -= delta;
      if (this.respawnTimer <= 0) {
        this.harvested = false;
        this.harvestCount = this.respawnTime === 60 ? 4 : this.respawnTime === 120 ? 2 : 3;
        this.mesh.visible = true;
        this.body.position.copy(this.originalPosition);
        this.body.wakeUp();
      }
    }
  }

  getDropItem() {
    return { id: this.resourceId, quantity: 1 + Math.floor(Math.random() * 2) };
  }

  dispose() {
    super.dispose();
  }
}
