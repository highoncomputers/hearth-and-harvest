import * as THREE from 'three';

export class Camera {
  constructor(camera) {
    this.camera = camera;
    this.target = new THREE.Vector3();
    this.offset = new THREE.Vector3(0, 2.5, 4.5);
    this.lookOffset = new THREE.Vector3(0, 1.5, 0);
    this.rotation = { yaw: 0, pitch: -0.3 };
    this.distance = 5;
    this.minDistance = 2;
    this.maxDistance = 10;
    this.minPitch = -0.8;
    this.maxPitch = 0.4;
    this.smoothSpeed = 5;
    this.currentPos = new THREE.Vector3();
    this.currentLook = new THREE.Vector3();
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeTimer = 0;
    this.lockedOn = false;
    this.lockTarget = null;
    this.desiredPos = new THREE.Vector3();
    this.desiredLook = new THREE.Vector3();
  }

  setTarget(position) {
    this.target.copy(position);
  }

  rotate(yaw, pitch) {
    this.rotation.yaw += yaw;
    this.rotation.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.rotation.pitch + pitch));
  }

  zoom(delta) {
    this.distance = Math.max(this.minDistance, Math.min(this.maxDistance, this.distance + delta));
  }

  shake(intensity, duration) {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
    this.shakeTimer = 0;
  }

  lockOn(target) {
    this.lockedOn = true;
    this.lockTarget = target;
  }

  unlock() {
    this.lockedOn = false;
    this.lockTarget = null;
  }

  update(delta) {
    const targetPos = this.target;
    const lookTarget = new THREE.Vector3().copy(targetPos).add(this.lookOffset);

    if (this.lockedOn && this.lockTarget) {
      const lockPos = new THREE.Vector3();
      if (this.lockTarget.position) lockPos.copy(this.lockTarget.position);
      else lockPos.copy(this.lockTarget);

      const dir = new THREE.Vector3().subVectors(lockPos, targetPos).normalize();
      this.rotation.yaw = Math.atan2(dir.x, dir.z);
      this.rotation.pitch = -0.2;

      const idealPos = new THREE.Vector3(
        targetPos.x + Math.sin(this.rotation.yaw) * Math.cos(this.rotation.pitch) * this.distance,
        targetPos.y + Math.sin(this.rotation.pitch) * this.distance + 1.5,
        targetPos.z + Math.cos(this.rotation.yaw) * Math.cos(this.rotation.pitch) * this.distance,
      );
      this.desiredPos.copy(idealPos);
      this.desiredLook.copy(targetPos).add(new THREE.Vector3(0, 1, 0));
    } else {
      const idealPos = new THREE.Vector3(
        targetPos.x + Math.sin(this.rotation.yaw) * Math.cos(this.rotation.pitch) * this.distance,
        targetPos.y + Math.sin(this.rotation.pitch) * this.distance + 1.5,
        targetPos.z + Math.cos(this.rotation.yaw) * Math.cos(this.rotation.pitch) * this.distance,
      );
      this.desiredPos.copy(idealPos);
      this.desiredLook.copy(lookTarget);
    }

    const smooth = 1 - Math.exp(-this.smoothSpeed * delta);
    this.currentPos.lerp(this.desiredPos, smooth);
    this.currentLook.lerp(this.desiredLook, smooth);

    if (this.shakeTimer < this.shakeDuration) {
      this.shakeTimer += delta;
      const shakeX = (Math.random() - 0.5) * this.shakeIntensity * 2 * (1 - this.shakeTimer / this.shakeDuration);
      const shakeY = (Math.random() - 0.5) * this.shakeIntensity * 2 * (1 - this.shakeTimer / this.shakeDuration);
      this.currentPos.x += shakeX;
      this.currentPos.y += shakeY;
    }

    this.camera.position.copy(this.currentPos);
    this.camera.lookAt(this.currentLook);
  }

  getDirection() {
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    return dir;
  }

  getForward() {
    const dir = this.getDirection();
    dir.y = 0;
    dir.normalize();
    return dir;
  }

  getRight() {
    const forward = this.getForward();
    return new THREE.Vector3(-forward.z, 0, forward.x);
  }

  dispose() {
    this.lockTarget = null;
  }
}
