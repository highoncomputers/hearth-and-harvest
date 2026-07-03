import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { getItemDef } from '../systems/Inventory.js';

export class ArrowEntity {
  constructor(scene, physics, origin, direction, damage, source) {
    this.scene = scene;
    this.physics = physics;
    this.origin = origin.clone();
    this.direction = direction.clone().normalize();
    this.damage = damage;
    this.source = source;
    this.alive = true;
    this.age = 0;
    this.maxLife = 3;
    this.speed = CONFIG.COMBAT.ARROW_SPEED;
    this.hit = false;
    this.mesh = null;
    this.body = null;
  }

  init() {
    const mat = new THREE.MeshStandardMaterial({ color: 0x8B6B4A, roughness: 0.8 });
    const tipMat = new THREE.MeshStandardMaterial({ color: 0xCCCCCC, metalness: 0.6, roughness: 0.3 });
    const group = new THREE.Group();

    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 4), mat);
    shaft.rotation.x = Math.PI / 2;
    shaft.position.z = 0.25;
    group.add(shaft);

    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.08, 4), tipMat);
    tip.rotation.x = Math.PI / 2;
    tip.position.z = 0.55;
    group.add(tip);

    const fletchMat = new THREE.MeshStandardMaterial({ color: 0xCC3333, roughness: 0.9 });
    const fletch = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.01, 0.04), fletchMat);
    fletch.position.z = -0.05;
    group.add(fletch);

    group.position.copy(this.origin);
    group.position.y += 0.5;
    const lookTarget = this.origin.clone().add(this.direction);
    group.lookAt(lookTarget);

    this.mesh = group;
    this.scene.add(this.mesh);

    this.body = this.physics.createBox(0.05, 0.05, 0.5, { x: this.mesh.position.x, y: this.mesh.position.y, z: this.mesh.position.z });
    this.body.velocity.set(this.direction.x * this.speed, this.direction.y * this.speed, this.direction.z * this.speed);
    this.body.allowSleep = false;
  }

  update(delta) {
    if (!this.alive) return;
    this.age += delta;
    if (this.age > this.maxLife) {
      this.dispose();
      return;
    }

    if (this.body) {
      this.mesh.position.copy(this.body.position);
      const dir = new THREE.Vector3(this.body.velocity.x, this.body.velocity.y, this.body.velocity.z);
      if (dir.length() > 0.1) {
        const lookTarget = this.mesh.position.clone().add(dir.normalize());
        this.mesh.lookAt(lookTarget);
      }
    }

    if (!this.hit) {
      this._checkCollisions();
    }
  }

  _checkCollisions() {
    const arrowPos = this.mesh.position;
    const enemies = this.source?.enemies || [];
    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const dist = enemy.mesh.position.distanceTo(arrowPos);
      if (dist < 1.5) {
        this.hit = true;
        enemy.takeDamage(this.damage, this.source);
        this.source.events.emit('combat:hit', {
          target: enemy, damage: this.damage, source: this.source,
        });
        this._stickIn(enemy);
        return;
      }
    }
  }

  _stickIn(enemy) {
    this.body.velocity.set(0, 0, 0);
    this.body.updateMassProperties();
    this.body.collisionFilterMask = 0;
    setTimeout(() => this.dispose(), 2000);
  }

  dispose() {
    this.alive = false;
    if (this.body) {
      this.physics.removeBody(this.body);
      this.body = null;
    }
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.traverse((child) => {
        if (child.isMesh) {
          child.geometry.dispose();
          child.material.dispose();
        }
      });
      this.mesh = null;
    }
  }
}
