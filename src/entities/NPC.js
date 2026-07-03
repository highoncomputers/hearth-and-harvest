import * as THREE from 'three';

const SCHEDULE_TIMES = {
  morning: 0.15,
  work: 0.35,
  tavern: 0.6,
  evening: 0.8,
  night: 0.92,
};

export class NPC {
  constructor(scene, physics, config, events) {
    this.scene = scene;
    this.physics = physics;
    this.events = events;
    this.entityType = 'npc';
    this.alive = true;

    this.name = config.name;
    this.role = config.role;
    this.title = config.title;
    this.relation = config.relation || 20;
    this.recruited = false;
    this.homePos = config.homePos.clone();

    this.appearance = config.appearance || { skin: 0xD4A574, hair: 0x3A2A1A, clothes: 0x5A4A3A };
    this.mesh = null;
    this.body = null;
    this.speed = 2;

    this.waypoints = config.waypoints || [];
    this.currentWp = 0;
    this.waitTimer = 0;

    this.dialogue = config.dialogue || {
      greeting: 'Hello there.',
      trade: 'See anything you like?',
      quest: 'I could use a hand.',
      gossip: 'Heard the blacksmith\'s bellows are acting up.',
    };

    this.desires = config.desires || [];
    this.offers = config.offers || [];

    this.questAvailable = config.questAvailable || false;
    this.currentQuest = null;

    this.interactRange = 2.5;
  }

  init() {
    this._buildMesh();
    this.scene.add(this.mesh);
    this.body = this.physics.createCapsule(50, 0.3, 1.6, {
      x: this.homePos.x, y: this.homePos.y + 0.8, z: this.homePos.z,
    });
    this.body.fixedRotation = true;
    this.physics.linkMesh(this.body, this.mesh);
  }

  _buildMesh() {
    const group = new THREE.Group();
    const { skin, hair, clothes } = this.appearance;
    const skinMat = new THREE.MeshStandardMaterial({ color: skin, roughness: 0.8 });
    const hairMat = new THREE.MeshStandardMaterial({ color: hair, roughness: 0.9 });
    const clothesMat = new THREE.MeshStandardMaterial({ color: clothes, roughness: 0.85 });

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.35), clothesMat);
    torso.position.y = 1.0;
    group.add(torso);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), skinMat);
    head.position.y = 1.45;
    group.add(head);

    const hairMesh = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 6), hairMat);
    hairMesh.position.y = 1.5;
    hairMesh.scale.y = 0.5;
    group.add(hairMesh);

    const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.5, 4), skinMat);
    leftArm.position.set(-0.38, 0.9, 0);
    group.add(leftArm);
    const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.5, 4), skinMat);
    rightArm.position.set(0.38, 0.9, 0);
    group.add(rightArm);

    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x4A3A2A, roughness: 0.9 });
    const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.5, 4), pantsMat);
    leftLeg.position.set(-0.12, 0.35, 0);
    group.add(leftLeg);
    const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.5, 4), pantsMat);
    rightLeg.position.set(0.12, 0.35, 0);
    group.add(rightLeg);

    this.mesh = group;
    this.mesh.position.copy(this.homePos);

    this.mesh.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
  }

  update(delta, timeOfDay) {
    if (!this.alive || !this.body) return;

    this._updateSchedule(delta, timeOfDay);

    if (this.body) {
      this.mesh.position.copy(this.body.position);
    }
  }

  _updateSchedule(delta, timeOfDay) {
    if (this.waypoints.length === 0) return;

    if (this.waitTimer > 0) {
      this.waitTimer -= delta;
      if (this.body) this.body.velocity.x *= 0.9;
      this.body.velocity.z *= 0.9;
      return;
    }

    const target = this.waypoints[this.currentWp];
    const pos = this.body.position;
    const dx = target.x - pos.x;
    const dz = target.z - pos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < 0.5) {
      this.currentWp = (this.currentWp + 1) % this.waypoints.length;
      this.waitTimer = 2 + Math.random() * 3;
      return;
    }

    const speed = this.speed * delta;
    this.body.velocity.x = (dx / dist) * speed * 5;
    this.body.velocity.z = (dz / dist) * speed * 5;

    const targetAngle = Math.atan2(dx, dz);
    this.mesh.rotation.y = targetAngle;
  }

  setWaypointsFromRole(role, homePos, zoneTerrain) {
    this.waypoints = [];
    const getH = (x, z) => Math.max(zoneTerrain.getHeightAt(x, z), 0.5);

    switch (role) {
      case 'farmer':
        this.waypoints = [
          new THREE.Vector3(homePos.x, getH(homePos.x, homePos.z), homePos.z),
          new THREE.Vector3(homePos.x + 6, getH(homePos.x + 6, homePos.z + 2), homePos.z + 2),
          new THREE.Vector3(homePos.x - 3, getH(homePos.x - 3, homePos.z - 3), homePos.z - 3),
        ];
        break;
      case 'blacksmith':
        this.waypoints = [
          new THREE.Vector3(homePos.x, getH(homePos.x, homePos.z), homePos.z),
          new THREE.Vector3(homePos.x + 2, getH(homePos.x + 2, homePos.z), homePos.z),
          new THREE.Vector3(homePos.x - 2, getH(homePos.x - 2, homePos.z + 1), homePos.z + 1),
        ];
        break;
      case 'baker':
        this.waypoints = [
          new THREE.Vector3(homePos.x, getH(homePos.x, homePos.z), homePos.z),
          new THREE.Vector3(homePos.x + 4, getH(homePos.x + 4, homePos.z), homePos.z),
        ];
        break;
      case 'hunter':
        this.waypoints = [
          new THREE.Vector3(homePos.x, getH(homePos.x, homePos.z), homePos.z),
          new THREE.Vector3(homePos.x + 8, getH(homePos.x + 8, homePos.z + 5), homePos.z + 5),
          new THREE.Vector3(homePos.x - 4, getH(homePos.x - 4, homePos.z - 6), homePos.z - 6),
        ];
        break;
      default:
        this.waypoints = [
          new THREE.Vector3(homePos.x, getH(homePos.x, homePos.z), homePos.z),
          new THREE.Vector3(homePos.x + 3, getH(homePos.x + 3, homePos.z + 2), homePos.z + 2),
        ];
    }
  }

  isPlayerNear(playerPos) {
    return this.mesh && this.mesh.position.distanceTo(playerPos) < this.interactRange;
  }

  dispose() {
    this.alive = false;
    if (this.body) { this.physics.removeBody(this.body); this.body = null; }
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.traverse(c => { if (c.isMesh) { c.geometry.dispose(); c.material.dispose(); } });
      this.mesh = null;
    }
  }
}
