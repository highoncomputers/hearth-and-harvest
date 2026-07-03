import * as THREE from 'three';
import { getQualitySettings } from '../utils/device.js';

export class Renderer {
  constructor() {
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.width = 0;
    this.height = 0;
    this.quality = null;
  }

  init(qualityTier = 'medium') {
    this.quality = getQualitySettings(qualityTier);

    this.renderer = new THREE.WebGLRenderer({
      antialias: this.quality.msaa > 0,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
    });

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    if (this.quality.shadows) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.shadowMap.bias = 0.0001;
    }

    this.renderer.domElement.style.cssText = 'display: block; position: fixed; top: 0; left: 0; touch-action: none;';
    document.body.prepend(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x87CEEB, this.quality.drawDistance * 0.5, this.quality.drawDistance);

    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, this.quality.drawDistance * 2);

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this._resize();

    window.addEventListener('resize', () => this._resize());
  }

  _resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.renderer.setSize(this.width, this.height);
    if (this.camera) {
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
    }
  }

  setQuality(tier) {
    this.quality = getQualitySettings(tier);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, tier === 'ultra' ? 2 : 1.5));
    if (this.quality.shadows) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    } else {
      this.renderer.shadowMap.enabled = false;
    }
    this.scene.fog = new THREE.Fog(0x87CEEB, this.quality.drawDistance * 0.5, this.quality.drawDistance);
  }

  render() {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  getScene() { return this.scene; }
  getCamera() { return this.camera; }
  getRenderer() { return this.renderer; }

  dispose() {
    window.removeEventListener('resize', () => this._resize());
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
    this.scene = null;
    this.camera = null;
    this.renderer = null;
  }
}
