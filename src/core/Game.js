import { EventSystem } from './EventSystem.js';
import { InputManager } from './InputManager.js';
import { AudioManager } from './AudioManager.js';
import { SaveManager } from './SaveManager.js';
import { SceneManager } from './SceneManager.js';
import { Renderer } from '../graphics/Renderer.js';
import { Camera } from '../graphics/Camera.js';
import { Terrain } from '../graphics/Terrain.js';
import { SkyCycle } from '../graphics/SkyCycle.js';
import { Water } from '../graphics/Water.js';
import { Physics } from '../physics/Physics.js';
import { Player } from '../entities/Player.js';
import { TouchControls } from '../controls/TouchControls.js';
import { UIManager } from '../ui/UIManager.js';
import { HUD } from '../ui/HUD.js';
import { LoadingScreen } from '../ui/LoadingScreen.js';
import { detectDeviceCapability, getQualityTier, setQualityTier, getQualitySettings } from '../utils/device.js';
import { CONFIG } from '../config.js';

export class Game {
  constructor() {
    this.events = new EventSystem();
    this.running = false;
    this.paused = false;
    this.delta = 0;
    this.lastTime = 0;
    this.frameCount = 0;
    this.fpsTimer = 0;
    this.fps = 0;

    this.renderer = null;
    this.cameraCtrl = null;
    this.input = null;
    this.audio = null;
    this.save = null;
    this.scenes = null;
    this.terrain = null;
    this.sky = null;
    this.water = null;
    this.physics = null;
    this.player = null;
    this.touchControls = null;
    this.ui = null;
    this.hud = null;
    this.loadingScreen = null;

    this.currentZone = 'village';
    this.zonesLoaded = new Set();
    this.zoneGroups = {};
  }

  async init() {
    const deviceInfo = detectDeviceCapability();
    let qualityTier = deviceInfo.tier;
    const savedSettings = new SaveManager().loadSettings();
    if (savedSettings && savedSettings.qualityTier) {
      qualityTier = savedSettings.qualityTier;
    }
    setQualityTier(qualityTier);

    this.renderer = new Renderer();
    this.renderer.init(qualityTier);

    this.cameraCtrl = new Camera(this.renderer.getCamera());

    this.physics = new Physics();
    this.physics.init(CONFIG.WORLD.GRAVITY);
    this.physics.createGround(0);

    this.input = new InputManager(this.events);
    this.audio = new AudioManager();
    await this.audio.init();
    this.save = new SaveManager();
    this.scenes = new SceneManager();
    this.scenes.init(this.renderer.getRenderer());

    this.sky = new SkyCycle(this.renderer.getScene());
    this.sky.init();

    this.water = new Water(this.renderer.getScene(), qualityTier);
    this.water.init();

    this.terrain = new Terrain(this.renderer.getScene(), qualityTier);
    this.terrain.generate();
    this.terrain.generateTrees(80);
    this.terrain.generateRocks(25);

    this.player = new Player(this.renderer.getScene(), this.physics, this.cameraCtrl, this.events);
    this.player.init();
    this.player.setPosition(0, 3, 0);

    this.ui = new UIManager(this.events);
    this.ui.init();

    this.hud = new HUD(this.ui.container, this.events);
    this.hud.init();

    this.loadingScreen = new LoadingScreen(this.ui.container);
    this.loadingScreen.init();

    this.touchControls = new TouchControls(document.body, this.events);
    this.touchControls.init();

    this.events.on('player:death', () => this._onPlayerDeath());
    this.events.on('player:respawned', () => this._onRespawn());

    this._setupResizeHandler();

    this.running = true;
    this.lastTime = performance.now();

    await this.loadingScreen.simulateLoad(2500);
    this.loadingScreen.dispose();
    this.loadingScreen = null;

    this.save.startAutoSave(() => this._getSaveData());
  }

  _setupResizeHandler() {
    window.addEventListener('resize', () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (this.renderer) {
        this.renderer.width = w;
        this.renderer.height = h;
        this.renderer.getRenderer().setSize(w, h);
        this.renderer.getCamera().aspect = w / h;
        this.renderer.getCamera().updateProjectionMatrix();
      }
      if (this.touchControls) {
        this.touchControls.reposition();
      }
    });

    try {
      screen.orientation.lock('landscape').catch(() => {});
    } catch (e) {}

    document.body.style.cssText = `
      margin: 0; overflow: hidden; position: fixed;
      width: 100%; height: 100%; touch-action: none;
      -webkit-touch-callout: none; -webkit-user-select: none;
      user-select: none; background: #000;
    `;
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    this._loop(performance.now());
  }

  pause() {
    this.paused = true;
    this.events.emit('game:paused');
  }

  resume() {
    this.paused = false;
    this.lastTime = performance.now();
    this.events.emit('game:resumed');
  }

  _loop(now) {
    if (!this.running) return;

    this.delta = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    this.frameCount++;
    this.fpsTimer += this.delta;
    if (this.fpsTimer >= 1) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsTimer -= 1;
    }

    if (!this.paused) {
      this._update(this.delta);
    }

    this.renderer.render();
    this.input.endFrame();

    requestAnimationFrame((t) => this._loop(t));
  }

  _update(delta) {
    this.scenes.update(delta);
    this.sky.update(delta);
    this.water.update(delta);

    this.touchControls.update(this.input);

    const move = this.input.getMoveVector();
    this.player.sprinting = this.input.getAction('sprint');
    this.player.move(move.x, move.y, delta);

    if (this.input.getActionDown('jump')) this.player.jump();
    if (this.input.getActionDown('attack')) {
      if (this.input.getAction('sprint')) this.player.heavyAttack();
      else this.player.lightAttack();
    }
    if (this.input.getActionDown('heavyAttack')) this.player.heavyAttack();
    if (this.input.getAction('block')) this.player.block(true);
    else this.player.block(false);
    if (this.input.getActionDown('dodge')) this.player.dodge();
    if (this.input.getActionDown('interact')) this._onInteract();
    if (this.input.getActionDown('pause')) this._togglePause();

    this._updateCamera(delta);

    this.player.update(delta);
    this.physics.update(delta);
    this.hud.update(delta);
  }

  _updateCamera(delta) {
    if (this.cameraCtrl) {
      const look = this.input.getLookVector();
      if (look.x !== 0 || look.y !== 0) {
        this.cameraCtrl.rotate(look.x, look.y);
      }
      this.cameraCtrl.update(delta);
    }
  }

  _onInteract() {
    this.events.emit('player:interact', { pos: this.player.mesh.position });
  }

  _togglePause() {
    if (this.paused) this.resume();
    else this.pause();
  }

  _onPlayerDeath() {
    this.pause();
    setTimeout(() => {
      this.player.respawn();
      this.resume();
    }, 2000);
  }

  _onRespawn() {
    this.cameraCtrl.shake(0.3, 0.5);
  }

  _getSaveData() {
    try {
      return {
        version: CONFIG.GAME.VERSION,
        timestamp: Date.now(),
        player: {
          position: this.player.position.toArray(),
          health: this.player.health,
          hunger: this.player.hunger,
          thirst: this.player.thirst,
          energy: this.player.energy,
          warmth: this.player.warmth,
          stamina: this.player.stamina,
          inventory: this.player.inventory,
          equippedTool: this.player.equippedTool,
          equippedWeapon: this.player.equippedWeapon,
          skills: this.player.skills,
          skillXp: this.player.skillXp,
        },
        world: {
          zone: this.currentZone,
          time: this.sky.time,
          season: this.sky.season,
        },
      };
    } catch (e) {
      return null;
    }
  }

  loadSave(data) {
    if (!data) return false;
    try {
      if (data.player) {
        const p = data.player;
        this.player.health = p.health;
        this.player.hunger = p.hunger;
        this.player.thirst = p.thirst;
        this.player.energy = p.energy;
        this.player.warmth = p.warmth;
        this.player.stamina = p.stamina;
        if (p.position) this.player.setPosition(p.position[0], p.position[1], p.position[2]);
        if (p.inventory) this.player.inventory = p.inventory;
        if (p.skills) this.player.skills = p.skills;
        if (p.skillXp) this.player.skillXp = p.skillXp;
      }
      if (data.world) {
        if (data.world.time !== undefined) this.sky.time = data.world.time;
        if (data.world.season) this.sky.setSeason(data.world.season);
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  dispose() {
    this.running = false;
    this.save.stopAutoSave();
    if (this.input) this.input.dispose();
    if (this.audio) this.audio.dispose();
    if (this.player) this.player.dispose();
    if (this.terrain) this.terrain.dispose();
    if (this.sky) this.sky.dispose();
    if (this.water) this.water.dispose();
    if (this.physics) this.physics.dispose();
    if (this.touchControls) this.touchControls.dispose();
    if (this.hud) this.hud.dispose();
    if (this.ui) this.ui.dispose();
    if (this.renderer) this.renderer.dispose();
    if (this.scenes) this.scenes.dispose();
  }
}
