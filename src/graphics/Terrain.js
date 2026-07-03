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
    const geo = new THREE.PlaneGeometry(this.size, this.size, this.segments, this.segments);
    geo.rotateX(-Math.PI / 2);

    const positions = geo.attributes.position;
    this.heightData = [];

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      const nx = (x + this.size / 2) / this.size;
      const nz = (z + this.size / 2) / this.size;

      let h = fbm(nx * 3 + this.seed, nz * 3 + this.seed, 4);
      h = h * 0.5 + 0.5;
      h = Math.pow(h, 1.5);
      h = h * this.maxHeight;

      if (h < 0.8) h = 0.3;
      positions.setY(i, h);
      this.heightData.push(h);
    }

    geo.computeVertexNormals();

    const colors = new Float32Array(positions.count * 3);
    for (let i = 0; i < positions.count; i++) {
      const y = positions.getY(i);
      const ty = (y / this.maxHeight);
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
