import * as THREE from 'three';

export class Water {
  constructor(scene, quality) {
    this.scene = scene;
    this.quality = quality;
    this.mesh = null;
    this.size = 500;
    this.time = 0;
  }

  init() {
    const geo = new THREE.PlaneGeometry(this.size, this.size, 64, 64);
    geo.rotateX(-Math.PI / 2);

    const mat = new THREE.MeshStandardMaterial({
      color: 0x1A5A8A,
      transparent: true,
      opacity: 0.7,
      roughness: 0.2,
      metalness: 0.5,
      side: THREE.DoubleSide,
    });

    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.y = 0.5;
    this.mesh.receiveShadow = true;
    this.scene.add(this.mesh);

    this.basePositions = new Float32Array(geo.attributes.position.array);
  }

  update(delta) {
    this.time += delta;
    if (!this.mesh) return;
    const pos = this.mesh.geometry.attributes.position;
    const array = pos.array;
    for (let i = 0; i < array.length; i += 3) {
      const x = array[i];
      const z = array[i + 2];
      array[i + 1] = Math.sin(x * 0.05 + this.time * 1.5) * 0.15 +
                     Math.sin(z * 0.07 + this.time * 2.0) * 0.1 +
                     Math.sin((x + z) * 0.03 + this.time * 1.0) * 0.08;
    }
    pos.needsUpdate = true;
  }

  setQuality(quality) {
    this.quality = quality;
    if (this.mesh) {
      const segs = quality === 'ultra' || quality === 'high' ? 64 : quality === 'medium' ? 32 : 16;
      this.mesh.geometry.dispose();
      const geo = new THREE.PlaneGeometry(this.size, this.size, segs, segs);
      geo.rotateX(-Math.PI / 2);
      this.mesh.geometry = geo;
    }
  }

  dispose() {
    if (this.mesh) {
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
      this.scene.remove(this.mesh);
    }
  }
}
