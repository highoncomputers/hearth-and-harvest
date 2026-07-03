import * as THREE from 'three';
import { Enemy, STATE } from './Enemy.js';

export class Bandit extends Enemy {
  constructor(scene, physics, events, tier = 1) {
    const config = {
      speed: 3.5,
      attackDamage: 10 + tier * 5,
      attackRange: 2,
      attackCooldown: 1.2 - tier * 0.1,
      agroRange: 18,
      fleeHealth: 0.1,
      attackWindup: 0.4,
      xpReward: 15 * tier,
      lootTable: [
        { id: 'bone', quantity: 1, chance: 0.4 },
        { id: 'bread', quantity: 1, chance: 0.3 },
        { id: tier > 1 ? 'iron_sword' : 'stone_sword', quantity: 1, chance: 0.15 },
        { id: 'gem', quantity: 1, chance: 0.05 },
      ],
    };
    super(scene, physics, events, config);
    this.enemyType = 'bandit';
    this.tier = tier;
    this.health = 40 + tier * 20;
    this.maxHealth = this.health;
    this.blocking = false;
    this.blockChance = 0.1 + tier * 0.05;
  }

  init() {
    this._buildMesh();
    this.scene.add(this.mesh);
    this.body = this.physics.createCapsule(50, 0.3, 1.6, this.mesh.position);
    this.body.fixedRotation = true;
    super.init();
  }

  _buildMesh() {
    const colors = [{ r: 0.5, g: 0.3, b: 0.2 }, { r: 0.4, g: 0.25, b: 0.15 }, { r: 0.3, g: 0.2, b: 0.1 }];
    const c = colors[this.tier - 1] || colors[0];

    const bodyMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(c.r, c.g, c.b), roughness: 0.8 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xD4A574, roughness: 0.8 });
    const weaponMat = new THREE.MeshStandardMaterial({ color: 0x6A6A6A, roughness: 0.5, metalness: 0.3 });

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.35), bodyMat);
    torso.position.y = 1.0;
    this.mesh.add(torso);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 6, 6), skinMat);
    head.position.y = 1.5;
    this.mesh.add(head);

    const hat = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.15, 6), new THREE.MeshStandardMaterial({ color: 0x3A2A1A }));
    hat.position.y = 1.6;
    this.mesh.add(hat);

    const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.5, 5), bodyMat);
    rightArm.position.set(0.35, 0.9, 0);
    this.mesh.add(rightArm);

    const weapon = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.4, 0.06), weaponMat);
    weapon.position.set(0.6, 0.7, 0);
    this.mesh.add(weapon);

    const shield = new THREE.Mesh(new THREE.CircleGeometry(0.2, 8), new THREE.MeshStandardMaterial({ color: 0x5A3A1A }));
    shield.position.set(-0.35, 0.85, -0.1);
    shield.rotation.x = -0.2;
    this.mesh.add(shield);

    this.mesh.traverse(c => { if (c.isMesh) c.castShadow = true; });
  }

  takeDamage(amount, source) {
    if (Math.random() < this.blockChance && this.state !== STATE.STAGGER) {
      this.blocking = true;
      amount *= 0.3;
      setTimeout(() => { this.blocking = false; }, 300);
    }
    super.takeDamage(amount, source);
  }
}
