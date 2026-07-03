import * as THREE from 'three';

export class ParticleSystem {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.systems = [];
    this.weather = 'clear';
    this.weatherIntensity = 0;
  }

  createEmitter(config) {
    const count = config.count || 100;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];
    const lifetimes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const spread = config.spread || 5;
      positions[i * 3] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
      velocities.push({
        x: (Math.random() - 0.5) * (config.driftX || 0),
        y: (config.fallSpeed || -1) * (0.5 + Math.random()),
        z: (Math.random() - 0.5) * (config.driftZ || 0),
      });
      lifetimes[i] = config.lifetime || 3 + Math.random() * 2;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: config.color || 0xFFFFFF,
      size: config.size || 0.05,
      transparent: true,
      opacity: config.opacity || 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const mesh = new THREE.Points(geo, mat);
    mesh.position.copy(config.origin || new THREE.Vector3());
    if (config.follow) mesh.position.copy(config.origin);
    this.scene.add(mesh);

    const emitter = {
      mesh, mat, geo, velocities, lifetimes,
      count, age: 0, config, alive: true,
      origin: (config.origin || new THREE.Vector3()).clone(),
      lifetime: config.systemLifetime || Infinity,
      follow: config.follow || null,
    };

    this.systems.push(emitter);
    return emitter;
  }

  update(delta) {
    for (let s = this.systems.length - 1; s >= 0; s--) {
      const sys = this.systems[s];
      if (!sys.alive) { this._dispose(sys); this.systems.splice(s, 1); continue; }

      sys.age += delta;
      if (sys.age > sys.lifetime) { this._dispose(sys); this.systems.splice(s, 1); continue; }

      if (sys.follow) sys.mesh.position.copy(sys.follow.position);

      const pos = sys.geo.attributes.position;
      const array = pos.array;

      for (let i = 0; i < sys.count; i++) {
        const v = sys.velocities[i];
        array[i * 3] += v.x * delta;
        array[i * 3 + 1] += v.y * delta;
        array[i * 3 + 2] += v.z * delta;

        const reset = sys.config.spawnBox || 5;
        if (array[i * 3 + 1] < -reset) {
          array[i * 3] = (Math.random() - 0.5) * reset;
          array[i * 3 + 1] = reset;
          array[i * 3 + 2] = (Math.random() - 0.5) * reset;
        }
      }
      pos.needsUpdate = true;
    }
  }

  startWeather(type, intensity = 1) {
    this.stopWeather();
    this.weather = type;
    this.weatherIntensity = intensity;

    const playerPos = () => this.camera?.position || new THREE.Vector3();

    switch (type) {
      case 'rain': {
        const count = Math.floor(200 * intensity);
        this.createEmitter({
          count, color: 0xAADDFF, size: 0.02, opacity: 0.4,
          fallSpeed: -8, spread: 30, spawnBox: 12,
          driftX: 0.5, driftZ: 0.3,
          systemLifetime: Infinity, origin: playerPos(),
          follow: { position: playerPos() },
        });
        break;
      }
      case 'snow': {
        const count = Math.floor(150 * intensity);
        this.createEmitter({
          count, color: 0xFFFFFF, size: 0.08, opacity: 0.5,
          fallSpeed: -1.5, spread: 35, spawnBox: 15,
          driftX: 1, driftZ: 0.8,
          systemLifetime: Infinity, origin: playerPos(),
          follow: { position: playerPos() },
        });
        break;
      }
    }
  }

  stopWeather() {
    for (const s of this.systems) {
      if (s.config.systemLifetime === Infinity) {
        s.alive = false;
      }
    }
    this.weather = 'clear';
  }

  fireAt(origin) {
    this.createEmitter({
      count: 30, color: 0xFF6600, size: 0.08, opacity: 0.7,
      fallSpeed: 1.5, spread: 1, driftX: 0.5, driftZ: 0.3,
      lifetime: 1.5, systemLifetime: 2,
      origin,
    });
  }

  dustAt(origin) {
    this.createEmitter({
      count: 20, color: 0xCCAA88, size: 0.04, opacity: 0.3,
      fallSpeed: 0.3, spread: 2, driftX: 0.2, driftZ: 0.2,
      lifetime: 1, systemLifetime: 1.5,
      origin,
    });
  }

  leavesAt(origin) {
    this.createEmitter({
      count: 15, color: 0x4A8A3A, size: 0.06, opacity: 0.5,
      fallSpeed: -0.5, spread: 3, driftX: 1.5, driftZ: 0.5,
      lifetime: 4, systemLifetime: 5,
      origin,
    });
  }

  _dispose(sys) {
    if (sys.mesh.parent) sys.mesh.parent.remove(sys.mesh);
    sys.geo.dispose();
    sys.mat.dispose();
  }

  dispose() {
    for (const s of this.systems) this._dispose(s);
    this.systems = [];
  }
}
