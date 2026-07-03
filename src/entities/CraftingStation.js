import * as THREE from 'three';

const STATION_VISUALS = {
  campfire: (group) => {
    const fireMat = new THREE.MeshStandardMaterial({ color: 0xFF6600, emissive: 0xFF4400, emissiveIntensity: 0.3 });
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.9 });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.08, 6, 12), stoneMat);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
    const fire = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.3, 6), fireMat);
    fire.position.y = 0.15;
    group.add(fire);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.4, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xFF6600, transparent: true, opacity: 0.1 }));
    glow.position.y = 0.15;
    group.add(glow);
  },
  hearth: (group) => {
    const brickMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.9 });
    const arch = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.6), brickMat);
    arch.position.y = 0.25;
    group.add(arch);
    const fireMat = new THREE.MeshStandardMaterial({ color: 0xFF4400, emissive: 0xFF2200, emissiveIntensity: 0.2 });
    const fire = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.2, 6), fireMat);
    fire.position.y = 0.1;
    group.add(fire);
  },
  workbench: (group) => {
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8B7355, roughness: 0.9 });
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.1, 0.6), woodMat);
    top.position.y = 0.55;
    group.add(top);
    for (let i = 0; i < 4; i++) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 4), woodMat);
      leg.position.set(i < 2 ? -0.4 : 0.4, 0.25, i % 2 === 0 ? -0.2 : 0.2);
      group.add(leg);
    }
  },
  anvil: (group) => {
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.6, roughness: 0.4 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.15, 0.4), metalMat);
    group.add(base);
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.2, 0.15), metalMat);
    top.position.y = 0.175;
    group.add(top);
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 4), metalMat);
    horn.rotation.z = Math.PI / 2;
    horn.position.set(0.25, 0.1, 0);
    group.add(horn);
  },
  sawmill: (group) => {
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x6B4226, roughness: 0.9 });
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.5 });
    const table = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.5), woodMat);
    table.position.y = 0.3;
    group.add(table);
    const blade = new THREE.Mesh(new THREE.CircleGeometry(0.2, 8), bladeMat);
    blade.position.set(0, 0.3, 0.15);
    blade.rotation.x = Math.PI / 2;
    group.add(blade);
  },
  loom: (group) => {
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8B7D6B, roughness: 0.9 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.1), woodMat);
    frame.position.y = 0.25;
    group.add(frame);
    const cross = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.4, 0.08), woodMat);
    cross.position.set(-0.15, 0.25, 0);
    group.add(cross);
    cross.position.set(0.15, 0.25, 0);
    group.add(cross);
  },
  kiln: (group) => {
    const clayMat = new THREE.MeshStandardMaterial({ color: 0x993300, roughness: 0.95 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 0.5, 8), clayMat);
    body.position.y = 0.25;
    group.add(body);
    const opening = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.01), clayMat);
    opening.position.set(0, 0.15, 0.35);
    group.add(opening);
  },
  still: (group) => {
    const copperMat = new THREE.MeshStandardMaterial({ color: 0x8B6914, metalness: 0.4, roughness: 0.6 });
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.4, 8), copperMat);
    pot.position.y = 0.2;
    group.add(pot);
    const lid = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.1, 6), copperMat);
    lid.position.y = 0.45;
    group.add(lid);
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.25, 4), copperMat);
    tube.rotation.z = Math.PI / 3;
    tube.position.set(0.1, 0.4, 0);
    group.add(tube);
  },
};

export class CraftingStation {
  constructor(scene, position, type) {
    this.scene = scene;
    this.position = position.clone();
    this.type = type;
    this.alive = true;
    this.mesh = null;
  }

  init() {
    const group = new THREE.Group();
    const builder = STATION_VISUALS[this.type];
    if (builder) builder(group);
    group.position.copy(this.position);
    this.mesh = group;
    this.scene.add(group);
  }

  isPlayerNear(playerPos, range = 2.5) {
    return this.mesh && this.mesh.position.distanceTo(playerPos) < range;
  }

  dispose() {
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.traverse((c) => {
        if (c.isMesh) { c.geometry.dispose(); c.material.dispose(); }
      });
      this.mesh = null;
    }
  }
}
