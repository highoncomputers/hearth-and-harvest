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
    const geo = this._buildWaterGeometry(64);
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
  }

  _buildWaterGeometry(segs) {
    const size = this.size;
    const half = size / 2;
    const vertCount = (segs + 1) * (segs + 1);
    const positions = new Float32Array(vertCount * 3);

    let idx = 0;
    for (let iz = 0; iz <= segs; iz++) {
      const z = -half + iz * (size / segs);
      for (let ix = 0; ix <= segs; ix++) {
        const x = -half + ix * (size / segs);
        positions[idx] = x;
        positions[idx + 1] = 0;
        positions[idx + 2] = z;
        idx += 3;
      }
    }

    const triCount = segs * segs * 6;
    const indices = new Uint16Array(triCount);
    idx = 0;
    for (let iz = 0; iz < segs; iz++) {
      for (let ix = 0; ix < segs; ix++) {
        const a = iz * (segs + 1) + ix;
        const b = iz * (segs + 1) + ix + 1;
        const c = (iz + 1) * (segs + 1) + ix;
        const d = (iz + 1) * (segs + 1) + ix + 1;
        indices[idx] = a; indices[idx + 1] = b; indices[idx + 2] = c;
        indices[idx + 3] = b; indices[idx + 4] = d; indices[idx + 5] = c;
        idx += 6;
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setIndex(new THREE.BufferAttribute(indices, 1));
    geo.computeVertexNormals();
    return geo;
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
      this.mesh.geometry = this._buildWaterGeometry(segs);
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
