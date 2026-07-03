import * as THREE from 'three';
import { Enemy, STATE } from './Enemy.js';

export class Wolf extends Enemy {
  constructor(scene, physics, events) {
    const config = {
      speed: 6,
      attackDamage: 8,
      attackRange: 1.2,
      attackCooldown: 0.8,
      agroRange: 20,
      fleeHealth: 0.2,
      attackWindup: 0.2,
      xpReward: 8,
      lootTable: [
        { id: 'hide', quantity: 1, chance: 0.6 },
        { id: 'meat_raw', quantity: 2, chance: 0.8 },
        { id: 'bone', quantity: 2, chance: 0.4 },
      ],
    };
    super(scene, physics, events, config);
    this.enemyType = 'wolf';
    this.health = 25;
    this.maxHealth = 25;
    this.packTarget = null;
  }

  init() {
    this._buildMesh();
    this.scene.add(this.mesh);
    this.body = this.physics.createCapsule(30, 0.2, 0.8, this.mesh.position);
    this.body.fixedRotation = true;
    super.init();
  }

  _buildMesh() {
    const furMat = new THREE.MeshStandardMaterial({ color: 0x6A6A6A, roughness: 0.9 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x3A3A3A, roughness: 0.9 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.7), furMat);
    body.position.y = 0.4;
    this.mesh.add(body);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.18), furMat);
    head.position.set(0, 0.5, 0.35);
    this.mesh.add(head);

    const ear1 = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.08, 4), darkMat);
    ear1.position.set(-0.08, 0.6, 0.3);
    this.mesh.add(ear1);

    const ear2 = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.08, 4), darkMat);
    ear2.position.set(0.08, 0.6, 0.3);
    this.mesh.add(ear2);

    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.04, 0.2, 4), furMat);
    tail.position.set(0, 0.4, -0.4);
    tail.rotation.x = 0.5;
    this.mesh.add(tail);

    for (let side of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.25, 4), darkMat);
      leg.position.set(side * 0.12, 0.15, side * 0.15);
      this.mesh.add(leg);
    }

    this.mesh.scale.set(0.8 + Math.random() * 0.4, 0.8 + Math.random() * 0.4, 0.8 + Math.random() * 0.4);
    this.mesh.traverse(c => { if (c.isMesh) c.castShadow = true; });
  }

  setTarget(entity) {
    super.setTarget(entity);
    if (entity) {
      this.events.emit('wolf:hunt', { wolf: this, target: entity });
    }
  }

  updateAI(delta, playerPos) {
    if (this.state === STATE.CHASE && this.speed > 3) {
      this.speed = 6 + Math.sin(Date.now() * 0.01) * 0.5;
    }
    super.updateAI(delta, playerPos);
  }

  _executeAttack(playerPos) {
    super._executeAttack(playerPos);
    if (Math.random() < 0.3) {
      this.mesh.position.x += (Math.random() - 0.5) * 0.5;
      this.mesh.position.z += (Math.random() - 0.5) * 0.5;
    }
  }
}
