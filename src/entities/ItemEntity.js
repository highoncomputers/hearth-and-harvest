import * as THREE from 'three';
import { Entity } from './Entity.js';
import { getItemDef, getItemIcon } from '../systems/Inventory.js';

export class ItemEntity extends Entity {
  constructor(scene, physics, itemId, quantity, position) {
    super(scene, physics);
    this.entityType = 'item';
    this.itemId = itemId;
    this.quantity = quantity;
    this.pickupRange = 2;
    this.lifetime = 120;
    this.age = 0;
    this.bobOffset = Math.random() * Math.PI * 2;
    this.setPosition(position.x, position.y, position.z);
    this.addTag('pickup');
  }

  init() {
    this._buildMesh();
    this.scene.add(this.mesh);

    this.body = this.physics.createSphere(0.5, 0.2, this.mesh.position);
    this.body.collisionFilterGroup = 0;
    this.body.collisionFilterMask = 0;
    this.body.type = 2;
    this.body.position.copy(this.mesh.position);
  }

  _buildMesh() {
    const def = getItemDef(this.itemId);
    const color = def ? this._getColorForType(def.type) : 0xFFFFFF;

    const mat = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.7,
      metalness: 0.1,
      emissive: color,
      emissiveIntensity: 0.05,
    });

    const geo = new THREE.BoxGeometry(0.2, 0.1, 0.2);
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.copy(this.originalPosition);
    this.mesh.position.y += 0.2;

    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xFFD700, transparent: true, opacity: 0.15 }),
    );
    this.mesh.add(glow);
  }

  _getColorForType(type) {
    const colors = {
      tool: 0x8B7355,
      weapon: 0xCC4444,
      armor: 0x4488CC,
      food: 0xCC8844,
      material: 0xAAAAAA,
      crop: 0x88AA44,
      valuable: 0xFFD700,
      ammo: 0x886644,
    };
    return colors[type] || 0xFFFFFF;
  }

  canPickup(playerPos) {
    const dist = this.mesh.position.distanceTo(playerPos);
    return dist <= this.pickupRange;
  }

  update(delta) {
    this.age += delta;
    if (this.age >= this.lifetime) {
      this.alive = false;
      return;
    }

    const bob = Math.sin(this.age * 3 + this.bobOffset) * 0.1;
    this.mesh.position.y = this.originalPosition.y + 0.2 + bob;
    this.mesh.rotation.y += delta * 2;

    this.mesh.scale.setScalar(1 + Math.sin(this.age * 4 + this.bobOffset) * 0.05);

    if (this.body) {
      this.body.position.copy(this.mesh.position);
    }
  }

  getDropItem() {
    return { id: this.itemId, quantity: this.quantity };
  }

  dispose() {
    super.dispose();
  }
}
