import * as THREE from 'three';

export class SceneManager {
  constructor() {
    this.scenes = new Map();
    this.currentScene = null;
    this.currentZone = null;
    this.transitioning = false;
    this.overlay = null;
  }

  init(renderer) {
    this.renderer = renderer;
    this._createTransitionOverlay();
  }

  _createTransitionOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: #000; z-index: 9999; pointer-events: none;
      opacity: 0; transition: opacity 0.5s ease;
    `;
    document.body.appendChild(this.overlay);
  }

  register(name, scene) {
    this.scenes.set(name, scene);
  }

  getActive() {
    return this.currentScene;
  }

  getZone() {
    return this.currentZone;
  }

  async switchTo(name, data) {
    if (this.transitioning) return;
    this.transitioning = true;

    this.overlay.style.opacity = '1';
    await this._wait(550);

    if (this.currentScene) {
      const scene = this.scenes.get(this.currentScene);
      if (scene && scene.onLeave) scene.onLeave();
    }

    this.currentScene = name;
    this.currentZone = data?.zone || null;

    const scene = this.scenes.get(name);
    if (scene) {
      if (scene.onEnter) await scene.onEnter(data);
    }

    this.overlay.style.opacity = '0';
    await this._wait(550);
    this.transitioning = false;
  }

  async transitionToZone(zoneName, data) {
    if (this.transitioning) return;
    this.transitioning = true;

    this.overlay.style.opacity = '1';
    await this._wait(500);

    if (this.currentScene) {
      const scene = this.scenes.get(this.currentScene);
      if (scene && scene.onLeave) scene.onLeave();
    }

    this.currentZone = zoneName;

    const scene = this.scenes.get(this.currentScene);
    if (scene && scene.onZoneChange) {
      await scene.onZoneChange(zoneName, data);
    }

    this.overlay.style.opacity = '0';
    await this._wait(500);
    this.transitioning = false;
  }

  update(delta) {
    if (this.currentScene) {
      const scene = this.scenes.get(this.currentScene);
      if (scene && scene.update) scene.update(delta);
    }
  }

  _wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  dispose() {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    this.scenes.clear();
  }
}
