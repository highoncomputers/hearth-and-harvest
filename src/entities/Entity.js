import * as THREE from 'three';

export class Entity {
  constructor(scene, physics) {
    this.scene = scene;
    this.physics = physics;
    this.mesh = new THREE.Group();
    this.body = null;
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.alive = true;
    this.health = 100;
    this.maxHealth = 100;
    this.entityType = 'base';
    this.tags = [];
  }

  init() {}

  setPosition(x, y, z) {
    this.position.set(x, y, z);
    this.mesh.position.set(x, y, z);
    if (this.body) {
      this.body.position.set(x, y, z);
      this.body.wakeUp();
    }
  }

  takeDamage(amount, source) {
    if (!this.alive) return;
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.die(source);
    }
  }

  die(source) {
    this.alive = false;
  }

  update(delta) {
    if (this.body && this.mesh) {
      this.mesh.position.copy(this.body.position);
      this.mesh.quaternion.copy(this.body.quaternion);
    }
  }

  addTag(tag) {
    if (!this.tags.includes(tag)) this.tags.push(tag);
  }

  hasTag(tag) {
    return this.tags.includes(tag);
  }

  dispose() {
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.traverse((child) => {
        if (child.isMesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }
    if (this.body && this.physics && this.physics.world) {
      this.physics.world.removeBody(this.body);
    }
  }
}
