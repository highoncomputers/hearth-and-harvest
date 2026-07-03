import * as THREE from 'three';
import { fbm } from '../utils/math.js';

export class Terrain {
  constructor(scene, quality) {
    this.scene = scene;
    this.quality = quality;
    this.mesh = null;
    this.chunks = [];
    this.heightData = [];
    this.size = 500;
    this.segments = 128;
    this.maxHeight = 8;
    this.seed = Math.random() * 1000;
  }

  generate() {
    const segs = this.segments;
    const size = this.size;
    const half = size / 2;

    const vertCount = (segs + 1) * (segs + 1);
    const positions = new Float32Array(vertCount * 3);
    this.heightData = [];

    let idx = 0;
    for (let iz = 0; iz <= segs; iz++) {
      const z = -half + iz * (size / segs);
      for (let ix = 0; ix <= segs; ix++) {
        const x = -half + ix * (size / segs);
        const nx = (x + half) / size;
        const nz = (z + half) / size;

        let h = fbm(nx * 3 + this.seed, nz * 3 + this.seed, 4);
        h = h * 0.5 + 0.5;
        h = Math.pow(h, 1.5);
        h = h * this.maxHeight;
        if (h < 0.8) h = 0.3;

        positions[idx] = x;
        positions[idx + 1] = h;
        positions[idx + 2] = z;
        idx += 3;
        this.heightData.push(h);
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

    const colors = new Float32Array(vertCount * 3);
    for (let i = 0; i < vertCount; i++) {
      const y = positions[i * 3 + 1];
      const ty = y / this.maxHeight;
      let r, g, b;
      if (ty < 0.15) {
        r = 0.6; g = 0.5; b = 0.3;
      } else if (ty < 0.4) {
        const t = (ty - 0.15) / 0.25;
        r = 0.6 - t * 0.2; g = 0.5 + t * 0.3; b = 0.3 - t * 0.1;
      } else if (ty < 0.7) {
        const t = (ty - 0.4) / 0.3;
        r = 0.4 - t * 0.1; g = 0.8 + t * 0.1; b = 0.2 - t * 0.05;
      } else {
        const t = (ty - 0.7) / 0.3;
        r = 0.3 - t * 0.1; g = 0.9 - t * 0.2; b = 0.15 - t * 0.05;
      }
      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.9,
      metalness: 0.0,
      flatShading: true,
    });

    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.receiveShadow = true;
    this.mesh.position.y = 0;
    this.scene.add(this.mesh);

    return this.heightData;
  }

  getHeightAt(x, z) {
    const halfSize = this.size / 2;
    const nx = (x + halfSize) / this.size;
    const nz = (z + halfSize) / this.size;
    if (nx < 0 || nx > 1 || nz < 0 || nz > 1) return 0;

    const h = fbm(nx * 3 + this.seed, nz * 3 + this.seed, 4);
    return (h * 0.5 + 0.5) * this.maxHeight;
  }

  generateTrees(count = 100) {
    const treeGroup = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5D3A1A, roughness: 0.9 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2D5A27, roughness: 0.8 });

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * this.size * 0.8;
      const z = (Math.random() - 0.5) * this.size * 0.8;
      const y = this.getHeightAt(x, z);
      if (y < 0.5 || y > 6) continue;

      const height = 1.5 + Math.random() * 2;
      const trunkGeo = new THREE.CylinderGeometry(0.1, 0.15, height, 6);
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.set(x, y + height / 2, z);
      trunk.castShadow = true;

      const crownSize = 1 + Math.random() * 1.5;
      const crownGeo = new THREE.SphereGeometry(crownSize, 6, 6);
      const crown = new THREE.Mesh(crownGeo, leafMat);
      crown.position.set(x, y + height + crownSize * 0.4, z);
      crown.castShadow = true;

      treeGroup.add(trunk);
      treeGroup.add(crown);
    }
    this.scene.add(treeGroup);
    return treeGroup;
  }

  generateRocks(count = 30) {
    const rockGroup = new THREE.Group();
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x6A6A6A, roughness: 0.95 });

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * this.size * 0.7;
      const z = (Math.random() - 0.5) * this.size * 0.7;
      const y = this.getHeightAt(x, z);
      if (y < 0.5 || y > 5) continue;

      const size = 0.3 + Math.random() * 0.8;
      const rockGeo = new THREE.DodecahedronGeometry(size, 0);
      const rock = new THREE.Mesh(rockGeo, rockMat);
      rock.position.set(x, y + size * 0.3, z);
      rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      rock.castShadow = true;
      rockGroup.add(rock);
    }
    this.scene.add(rockGroup);
    return rockGroup;
  }

  setQuality(quality) {
    this.quality = quality;
  }

  dispose() {
    if (this.mesh) {
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
      this.scene.remove(this.mesh);
    }
  }
}
