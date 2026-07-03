import * as CANNON from 'cannon-es';

export class Physics {
  constructor() {
    this.world = null;
    this.bodies = [];
    this.meshes = new Map();
  }

  init(gravity = -25) {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, gravity, 0),
    });
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    this.world.defaultContactMaterial.friction = 0.6;
    this.world.defaultContactMaterial.restitution = 0.1;

    const groundMat = new CANNON.Material('ground');
    const playerMat = new CANNON.Material('player');
    const contactMat = new CANNON.ContactMaterial(groundMat, playerMat, {
      friction: 0.5,
      restitution: 0.05,
    });
    this.world.addContactMaterial(contactMat);
  }

  createGround(height = 0) {
    const body = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Plane(),
      material: new CANNON.Material('ground'),
    });
    body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    body.position.y = height;
    this.world.addBody(body);
    return body;
  }

  createTerrainCollider(heightfield, size) {
    if (!this.world) return;
    const halfSize = size / 2;
    const step = size / heightfield.length;

    const body = new CANNON.Body({ mass: 0, material: new CANNON.Material('ground') });

    for (let ix = 0; ix < heightfield.length - 1; ix++) {
      for (let iz = 0; iz < heightfield[ix].length - 1; iz++) {
        const h = heightfield[ix][iz];
        const x = -halfSize + ix * step;
        const z = -halfSize + iz * step;

        const shape = new CANNON.Box(new CANNON.Vec3(step / 2, 0.5, step / 2));
        body.addShape(shape, new CANNON.Vec3(x, h / 2, z));
      }
    }

    this.world.addBody(body);
    return body;
  }

  createBody(mass, shape, position, quaternion) {
    const body = new CANNON.Body({
      mass: mass,
      shape: shape,
      position: new CANNON.Vec3(position.x, position.y, position.z),
      material: new CANNON.Material('dynamic'),
    });
    if (quaternion) {
      body.quaternion.copy(quaternion);
    }
    this.world.addBody(body);
    return body;
  }

  createSphere(mass, radius, position) {
    const shape = new CANNON.Sphere(radius);
    return this.createBody(mass, shape, position);
  }

  createBox(mass, halfExtents, position) {
    const shape = new CANNON.Box(
      new CANNON.Vec3(halfExtents.x, halfExtents.y, halfExtents.z)
    );
    return this.createBody(mass, shape, position);
  }

  createCapsule(mass, radius, height, position) {
    const body = new CANNON.Body({
      mass: mass,
      position: new CANNON.Vec3(position.x, position.y, position.z),
      material: new CANNON.Material('player'),
    });
    const sphereShape = new CANNON.Sphere(radius);
    const top = new CANNON.Vec3(0, height / 2 - radius, 0);
    const bottom = new CANNON.Vec3(0, -height / 2 + radius, 0);
    body.addShape(sphereShape, top);
    body.addShape(sphereShape, bottom);
    const cylinderShape = new CANNON.Cylinder(radius, radius, height - 2 * radius, 8);
    body.addShape(cylinderShape, new CANNON.Vec3(0, 0, 0));
    this.world.addBody(body);
    return body;
  }

  linkMesh(body, mesh) {
    this.meshes.set(body, mesh);
  }

  update(delta) {
    if (this.world) {
      this.world.step(1 / 60, delta, 3);
    }
    for (const [body, mesh] of this.meshes) {
      mesh.position.copy(body.position);
      mesh.quaternion.copy(body.quaternion);
    }
  }

  raycast(from, to) {
    if (!this.world) return null;
    const result = new CANNON.RaycastResult();
    this.world.raycastClosest(
      new CANNON.Vec3(from.x, from.y, from.z),
      new CANNON.Vec3(to.x, to.y, to.z),
      { skipBackfaces: true },
      result,
    );
    if (result.hasHit) return result;
    return null;
  }

  dispose() {
    if (this.world) {
      this.meshes.clear();
      this.world.bodies.forEach(b => this.world.removeBody(b));
      this.world = null;
    }
  }
}
