import * as THREE from 'three';
import { Enemy, STATE } from './Enemy.js';

export class Boar extends Enemy {
  constructor(scene, physics, events) {
    const config = {
      speed: 4.5,
      attackDamage: 15,
      attackRange: 1.8,
      attackCooldown: 2.0,
      agroRange: 12,
      fleeHealth: 0.15,
      attackWindup: 0.6,
      xpReward: 20,
      lootTable: [
        { id: 'hide', quantity: 2, chance: 0.7 },
        { id: 'meat_raw', quantity: 3, chance: 0.9 },
        { id: 'bone', quantity: 3, chance: 0.6 },
      ],
    };
    super(scene, physics, events, config);
    this.enemyType = 'boar';
    this.health = 50;
    this.maxHealth = 50;
    this.charging = false;
    this.chargeSpeed = 12;
    this.chargeDuration = 0.8;
    this.chargeTimer = 0;
  }

  init() {
    this._buildMesh();
    this.scene.add(this.mesh);
    this.body = this.physics.createCapsule(50, 0.25, 1.0, this.mesh.position);
    this.body.fixedRotation = true;
    super.init();
  }

  _buildMesh() {
    const furMat = new THREE.MeshStandardMaterial({ color: 0x5A3A2A, roughness: 0.9 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x3A2A1A, roughness: 0.9 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.8), furMat);
    body.position.y = 0.4;
    this.mesh.add(body);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.2, 0.2), darkMat);
    head.position.set(0, 0.4, 0.45);
    this.mesh.add(head);

    const tusk1 = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.08, 4), new THREE.MeshStandardMaterial({ color: 0xEEEEEE }));
    tusk1.position.set(-0.08, 0.3, 0.5);
    tusk1.rotation.z = 0.3;
    this.mesh.add(tusk1);

    const tusk2 = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.08, 4), new THREE.MeshStandardMaterial({ color: 0xEEEEEE }));
    tusk2.position.set(0.08, 0.3, 0.5);
    tusk2.rotation.z = -0.3;
    this.mesh.add(tusk2);

    for (let side of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.3, 4), darkMat);
      leg.position.set(side * 0.15, 0.15, side * 0.2);
      this.mesh.add(leg);
    }

    this.mesh.scale.set(0.9 + Math.random() * 0.3, 0.9 + Math.random() * 0.3, 0.9 + Math.random() * 0.3);
    this.mesh.traverse(c => { if (c.isMesh) c.castShadow = true; });
  }

  _chase(delta, targetPos) {
    if (!targetPos) return;
    const dist = this.mesh.position.distanceTo(targetPos);

    if (dist < 6 && dist > 2 && !this.charging) {
      this.charging = true;
      this.chargeTimer = this.chargeDuration;
      const dir = new THREE.Vector3().copy(targetPos).sub(this.mesh.position);
      dir.y = 0;
      dir.normalize();
      this.body.velocity.x = dir.x * this.chargeSpeed;
      this.body.velocity.z = dir.z * this.chargeSpeed;
      this.body.velocity.y = 0.5;
      this.mesh.rotation.y = Math.atan2(dir.x, dir.z);
      this.events.emit('enemy:charge', { enemy: this });
    }

    if (this.charging) {
      this.chargeTimer -= delta;
      if (this.chargeTimer <= 0) {
        this.charging = false;
        this.body.velocity.x *= 0.3;
        this.body.velocity.z *= 0.3;
      }
      return;
    }

    super._chase(delta, targetPos);
  }

  _executeAttack(playerPos) {
    if (!playerPos) return;
    const dist = this.mesh.position.distanceTo(playerPos);
    if (dist <= this.attackRange + 1.0 || this.charging) {
      this.events.emit('combat:hitCheck', {
        origin: this.mesh.position,
        direction: new THREE.Vector3(0, 0, -1).applyQuaternion(this.mesh.quaternion),
        range: this.attackRange + 0.5,
        damage: this.charging ? this.attackDamage * 2 : this.attackDamage,
        source: this,
      });
    }
    this.attackTimer = this.attackCooldown;
    this.charging = false;
    this.state = STATE.CHASE;
  }

  updateAI(delta, playerPos) {
    super.updateAI(delta, playerPos);
  }

  dispose() {
    super.dispose();
  }
}
