import * as THREE from 'three';

export class SkyCycle {
  constructor(scene) {
    this.scene = scene;
    this.time = 0;
    this.dayLength = 900;
    this.dayNightCycle = true;
    this.sun = null;
    this.sunLight = null;
    this.ambientLight = null;
    this.hemiLight = null;
    this.moonLight = null;
    this.clouds = [];
    this.season = 'spring';
    this.seasonColors = {
      spring: { sky: 0x87CEEB, ambient: 0x404060, ground: 0x606040 },
      summer: { sky: 0x4A90D9, ambient: 0x505060, ground: 0x707050 },
      autumn: { sky: 0x9A8A6A, ambient: 0x504030, ground: 0x604020 },
      winter: { sky: 0xAAAAAA, ambient: 0x606070, ground: 0x808080 },
    };
  }

  init() {
    this.hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x3A7A3A, 0.6);
    this.scene.add(this.hemiLight);

    this.ambientLight = new THREE.AmbientLight(0x404060, 0.3);
    this.scene.add(this.ambientLight);

    this.sunLight = new THREE.DirectionalLight(0xFFEECC, 1.2);
    this.sunLight.position.set(50, 30, 20);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 1;
    this.sunLight.shadow.camera.far = 150;
    this.sunLight.shadow.camera.left = -60;
    this.sunLight.shadow.camera.right = 60;
    this.sunLight.shadow.camera.top = 60;
    this.sunLight.shadow.camera.bottom = -60;
    this.scene.add(this.sunLight);

    this.moonLight = new THREE.DirectionalLight(0x4466AA, 0.1);
    this.moonLight.position.set(-50, -30, -20);
    this.scene.add(this.moonLight);

    const sunGeo = new THREE.SphereGeometry(2, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xFFDD44 });
    this.sun = new THREE.Mesh(sunGeo, sunMat);
    this.sun.position.set(0, 80, 0);
    this.scene.add(this.sun);

    this._generateClouds();
    this._updateSeasonColors();
  }

  _generateClouds() {
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.6,
      roughness: 1,
      metalness: 0,
    });

    for (let i = 0; i < 15; i++) {
      const group = new THREE.Group();
      const cx = (Math.random() - 0.5) * 200;
      const cz = (Math.random() - 0.5) * 200;
      const cy = 25 + Math.random() * 15;

      for (let j = 0; j < 4; j++) {
        const size = 4 + Math.random() * 8;
        const geo = new THREE.SphereGeometry(size, 6, 6);
        const mesh = new THREE.Mesh(geo, cloudMat);
        mesh.position.set(
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 6,
        );
        mesh.scale.y = 0.4 + Math.random() * 0.3;
        group.add(mesh);
      }

      group.position.set(cx, cy, cz);
      this.clouds.push({ group, speed: 0.5 + Math.random() * 1.5 });
      this.scene.add(group);
    }
  }

  setSeason(season) {
    this.season = season;
    this._updateSeasonColors();
  }

  _updateSeasonColors() {
    const colors = this.seasonColors[this.season];
    if (this.hemiLight) {
      const skyColor = new THREE.Color(colors.sky);
      const groundColor = new THREE.Color(colors.ground);
      this.hemiLight.color.copy(skyColor);
      this.hemiLight.groundColor.copy(groundColor);
    }
    if (this.scene) {
      this.scene.background = new THREE.Color(colors.sky);
    }
  }

  update(delta) {
    if (!this.dayNightCycle) return;

    this.time += delta;
    if (this.time > this.dayLength) this.time -= this.dayLength;

    const t = this.time / this.dayLength;
    const angle = t * Math.PI * 2;

    const sunX = Math.cos(angle) * 80;
    const sunY = Math.sin(angle) * 60;
    const sunZ = Math.sin(angle * 0.7) * 40;

    this.sun.position.set(sunX, Math.max(sunY, -10), sunZ);
    this.sunLight.position.copy(this.sun.position);

    const dayFactor = Math.max(0, Math.min(1, (sunY + 20) / 50));

    this.sunLight.intensity = 0.2 + dayFactor * 1.5;
    this.sunLight.color.setHSL(0.1 - dayFactor * 0.05, 0.5, 0.5 + dayFactor * 0.4);

    this.ambientLight.intensity = 0.05 + dayFactor * 0.35;
    this.hemiLight.intensity = 0.1 + dayFactor * 0.6;

    this.moonLight.intensity = Math.max(0, 0.3 - dayFactor * 0.3);

    this.sun.visible = sunY > -5;

    const skyColor = new THREE.Color(0x0A0A1A);
    if (dayFactor > 0.2) {
      const colors = this.seasonColors[this.season];
      const dayColor = new THREE.Color(colors.sky);
      skyColor.lerp(dayColor, (dayFactor - 0.2) / 0.8);
    }
    skyColor.lerp(new THREE.Color(0xFF6633), Math.max(0, 1 - Math.abs(sunY + 5) / 15) * 0.5);
    this.scene.background = skyColor;

    for (const cloud of this.clouds) {
      cloud.group.position.x += cloud.speed * delta;
      if (cloud.group.position.x > 150) cloud.group.position.x = -150;
    }
  }

  setTimeOfDay(hours) {
    this.time = (hours / 24) * this.dayLength;
  }

  getDayFactor() {
    const t = this.time / this.dayLength;
    const angle = t * Math.PI * 2;
    const sunY = Math.sin(angle) * 60;
    return Math.max(0, Math.min(1, (sunY + 20) / 50));
  }

  dispose() {
    for (const cloud of this.clouds) {
      this.scene.remove(cloud.group);
    }
    this.clouds = [];
  }
}
