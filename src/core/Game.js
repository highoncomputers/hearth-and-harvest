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
import { ItemEntity } from '../entities/ItemEntity.js';
import { Bandit } from '../entities/Bandit.js';
import { Wolf } from '../entities/Wolf.js';
import { Boar } from '../entities/Boar.js';
import { CombatSystem } from '../systems/Combat.js';
import { ZoneManager } from '../systems/ZoneManager.js';
import { ArrowEntity } from '../entities/ArrowEntity.js';
import { FarmingSystem } from '../systems/FarmingSystem.js';
import { CraftingStation } from '../entities/CraftingStation.js';
import { CraftingUI } from '../ui/CraftingUI.js';
import { RECIPES, getRecipesForStation, canCraft, craft, getRepairCost, repairItem, STATION_TYPES } from '../systems/Crafting.js';
import { TouchControls } from '../controls/TouchControls.js';
import { UIManager } from '../ui/UIManager.js';
import { HUD } from '../ui/HUD.js';
import { LoadingScreen } from '../ui/LoadingScreen.js';
import { MainMenu } from '../ui/MainMenu.js';
import { PauseMenu } from '../ui/PauseMenu.js';
import { SettingsPanel } from '../ui/SettingsPanel.js';
import { InventoryUI } from '../ui/InventoryUI.js';
import { detectDeviceCapability, setQualityTier, getQualitySettings } from '../utils/device.js';
import { CONFIG } from '../config.js';
import { createItem, addToInventory, getItemDef, ITEM_DEFS } from '../systems/Inventory.js';
import * as THREE from 'three';

export class Game {
  constructor() {
    this.events = new EventSystem();
    this.running = false;
    this.paused = false;
    this.gameStarted = false;
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
    this.combat = null;
    this.resources = [];
    this.itemEntities = [];
    this.enemies = [];
    this.touchControls = null;
    this.zoneManager = null;
    this.farming = null;
    this.craftingStations = [];
    this.craftingUI = null;
    this.arrows = [];
    this.craftingPrompt = null;
    this.ui = null;
    this.hud = null;
    this.mainMenu = null;
    this.pauseMenu = null;
    this.settingsPanel = null;
    this.inventoryUI = null;
    this.loadingScreen = null;
    this.interactPrompt = null;

    this.currentZone = 'village';
    this.zonesLoaded = new Set();
    this.zoneGroups = {};
    this.itemPickupCooldown = 0;
    this.lockOnCooldown = 0;
  }

  async init() {
    const deviceInfo = detectDeviceCapability();
    const savedSettings = new SaveManager().loadSettings();
    let qualityTier = deviceInfo.tier;
    if (savedSettings?.qualityTier) qualityTier = savedSettings.qualityTier;
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

    this.combat = new CombatSystem(this.events, this.cameraCtrl, this.audio);

    this.zoneManager = new ZoneManager(this.renderer.getScene(), this.physics, this.events, this.terrain);

    this.player = new Player(this.renderer.getScene(), this.physics, this.cameraCtrl, this.events, this.audio);
    this.player.init();
    this.player.setPosition(0, 3, 0);

    this.farming = new FarmingSystem(this.renderer.getScene(), this.physics, this.events);

    this.player.inventory.push(createItem('iron_sword'));
    this.player.inventory.push(createItem('wood_shield'));
    this.player.inventory.push(createItem('bow'));
    this.player.inventory.push(createItem('arrow', 20));
    this.player.inventory.push(createItem('leather_armor'));
    this.player.inventory.push(createItem('helm_iron'));
    this.player.inventory.push(createItem('boots_leather'));
    this.player.inventory.push(createItem('bread', 3));
    this.player.inventory.push(createItem('berries', 10));
    this.player.inventory.push(createItem('wood_hoe'));
    this.player.inventory.push(createItem('wheat_seed', 5));
    this.player.inventory.push(createItem('carrot_seed', 5));
    this.player.inventory.push(createItem('manure', 3));
    this.player.equippedWeapon = this.player.inventory[0];
    this.player.equippedArmor = this.player.inventory[4];
    this.player.equippedHelm = this.player.inventory[5];
    this.player.equippedBoots = this.player.inventory[6];

    this.ui = new UIManager(this.events);
    this.ui.init();

    this.hud = new HUD(this.ui.container, this.events);
    this.hud.init();

    this.mainMenu = new MainMenu(this.ui.container, this.events);
    this.mainMenu.init();
    this.pauseMenu = new PauseMenu(this.ui.container, this.events);
    this.pauseMenu.init();
    this.settingsPanel = new SettingsPanel(this.ui.container, this.events, this.audio);
    this.settingsPanel.init();
    this.inventoryUI = new InventoryUI(this.ui.container, this.events);
    this.inventoryUI.init();

    this.craftingUI = new CraftingUI(this.ui.container, this.events);
    this.craftingUI.init();

    this.loadingScreen = new LoadingScreen(this.ui.container);
    this.loadingScreen.init();

    this.touchControls = new TouchControls(document.body, this.events);
    this.touchControls.init();

    this._createInteractPrompt();
    this.zoneManager._populateZone('village');
    this._spawnCraftingStations();
    this._setupEvents();
    this._setupResizeHandler();

    this.running = true;
    this.lastTime = performance.now();

    this.mainMenu.show();
    this.touchControls.hide();
    this.hud.element.style.display = 'none';

    this.save.startAutoSave(() => this._getSaveData());
  }

  _createInteractPrompt() {
    this.interactPrompt = document.createElement('div');
    this.interactPrompt.style.cssText = `
      position: fixed; top: 50%; left: 50%;
      transform: translate(-50%, 50px);
      color: #FFD700; font-size: 14px; font-family: Georgia, serif;
      text-shadow: 0 0 10px rgba(0,0,0,0.8);
      opacity: 0; transition: opacity 0.2s;
      pointer-events: none; z-index: 60;
      text-align: center;
    `;
    document.body.appendChild(this.interactPrompt);
  }

  _setupEvents() {
    this.events.on('menu:start', () => this._startNewGame());
    this.events.on('menu:continue', () => this._continueGame());
    this.events.on('pause:resume', () => this._togglePause());
    this.events.on('pause:save', () => this._saveGame());
    this.events.on('pause:load', () => this._loadGame());
    this.events.on('pause:settings', () => { this.pauseMenu.hide(); this.settingsPanel.show(); });
    this.events.on('pause:quit', () => this._quitToMenu());
    this.events.on('player:death', () => this._onPlayerDeath());
    this.events.on('player:respawned', () => this._onRespawn());
    this.events.on('inventory:changed', (inv) => { this.player.inventory = inv; });
    this.events.on('player:interact', (data) => this._handleInteract(data));
    this.events.on('world:dropItem', (data) => this._spawnItemEntity(data.itemId, data.quantity, data.position));
    this.events.on('player:skillXp', (data) => this.player.addSkillXp(data.skill, data.amount));
    this.events.on('enemy:killed', (data) => this._onEnemyKilled(data));
    this.events.on('player:rangedAttack', (data) => this._spawnArrow(data));
    this.events.on('zone:changed', (data) => this._onZoneChanged(data));
  }

  _spawnItemEntity(itemId, quantity, position) {
    const item = new ItemEntity(this.renderer.getScene(), this.physics, itemId, quantity, position);
    item.init();
    this.itemEntities.push(item);
  }

  _startNewGame() {
    this.mainMenu.hide();
    this.touchControls.show();
    this.hud.element.style.display = '';
    this.gameStarted = true;
    this.audio.resume();
  }

  _continueGame() {
    const data = this.save.load('0');
    if (data) {
      this.loadSave(data);
      this.mainMenu.hide();
      this.touchControls.show();
      this.hud.element.style.display = '';
      this.gameStarted = true;
      this.audio.resume();
    } else {
      this._startNewGame();
    }
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
      if (this.touchControls) this.touchControls.reposition();
    });
    try { screen.orientation.lock('landscape').catch(() => {}); } catch (e) {}
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
    if (this.fpsTimer >= 1) { this.fps = this.frameCount; this.frameCount = 0; this.fpsTimer -= 1; }

    if (!this.paused && this.gameStarted) this._update(this.delta);
    this.renderer.render();
    this.input.endFrame();
    requestAnimationFrame((t) => this._loop(t));
  }

  _update(delta) {
    if (!this.gameStarted) return;

    this.scenes.update(delta);
    this.sky.update(delta);
    this.water.update(delta);
    this.touchControls.update(this.input);

    const inHitstop = this.combat.update(delta);
    if (inHitstop) {
      this.player.update(delta);
      this.physics.update(delta);
      this.hud.update(delta);
      return;
    }

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

    if (this.input.getActionDown('ranged')) {
      this.player.bowAttack();
    }
    if (this.input.getActionDown('interact')) {
      if (this.zoneManager.isAtAnyGate()) {
        this._handleGateTravel();
      } else if (this._handleFarmingInteract()) {
      } else {
        this._handleInteract({ pos: this.player.mesh.position });
      }
    }
    if (this.input.getActionDown('inventory')) this._toggleInventory();

    this.lockOnCooldown -= delta;
    if (this.input.getActionDown('pause')) {
      if (this.inventoryUI.isVisible()) this.inventoryUI.hide();
      if (this.craftingUI.isVisible()) this.craftingUI.hide();
      this._togglePause();
      return;
    }

    if (this.input.getActionDown('lockOn') && this.lockOnCooldown <= 0) {
      this.player.toggleLockOn(this.combat.getActiveEnemies());
      this.lockOnCooldown = 0.3;
    }

    this._updateCamera(delta);
    this._updatePickupPrompt();
    this._updateResources(delta);
    this._updateItemEntities(delta);
    this._updateEnemies(delta);
    this._updateArrows(delta);
    this._updateZoneGates(delta);
    this._updateFarming(delta);
    this._updateStations(delta);

    this.player.update(delta);
    this.physics.update(delta);
    this.hud.update(delta);
  }

  _updateCamera(delta) {
    if (this.cameraCtrl) {
      const look = this.input.getLookVector();
      if (look.x !== 0 || look.y !== 0) this.cameraCtrl.rotate(look.x, look.y);
      this.cameraCtrl.update(delta);
    }
  }

  _updatePickupPrompt() {
    if (!this.player) return;
    const pPos = this.player.mesh.position;

    const nearStation = this.craftingStations.find(s => s.alive && s.isPlayerNear(pPos, 2.5));
    if (nearStation) return;

    const plotInfo = this.farming ? this.farming.getNearestPlotInfo(pPos) : null;

    if (plotInfo && plotInfo.dist < 2) {
      let msg = '[E] ';
      if (plotInfo.canHarvest) {
        msg += 'Harvest crop';
      } else if (!plotInfo.cropPlanted) {
        const hasSeeds = ['wheat_seed','barley_seed','cabbage_seed','carrot_seed','flax_seed','onion_set']
          .some(s => getItemQuantity(this.player.inventory, s) > 0);
        const hasFert = ['manure','compost'].some(f => getItemQuantity(this.player.inventory, f) > 0);
        if (hasSeeds) msg += 'Plant seeds';
        else if (hasFert) msg += 'Fertilize';
        else msg += 'Water plot';
      } else {
        if (plotInfo.waterLevel < 3) msg += 'Water plot';
        else if (!plotInfo.fertilized) msg += 'Fertilize';
        else msg += 'Crop growing...';
      }
      this.interactPrompt.textContent = msg;
      this.interactPrompt.style.opacity = '1';
      return;
    }

    const tool = this.player.equippedTool;
    if (tool && getItemDef(tool.id)?.subtype === 'hoe' && tool.durability > 0) {
      const groundY = this.terrain.getHeightAt(pPos.x, pPos.z);
      if (groundY >= 0.3) {
        this.interactPrompt.textContent = '[E] Till soil (hoe)';
        this.interactPrompt.style.opacity = '1';
        return;
      }
    }

    let nearItem = null;
    let nearDist = 2.5;
    for (const item of this.itemEntities) {
      if (!item.alive) continue;
      const dist = item.mesh.position.distanceTo(pPos);
      if (dist < nearDist) { nearDist = dist; nearItem = item; }
    }
    if (nearItem) {
      const def = getItemDef(nearItem.itemId);
      this.interactPrompt.textContent = `[E] Pick up ${def?.name || nearItem.itemId} x${nearItem.quantity}`;
      this.interactPrompt.style.opacity = '1';
    } else {
      this.interactPrompt.style.opacity = '0';
    }
  }

  _updateResources(delta) {
    const resources = this.zoneManager ? this.zoneManager.resources : this.resources;
    for (const r of resources) r.update(delta);
  }

  _updateItemEntities(delta) {
    for (let i = this.itemEntities.length - 1; i >= 0; i--) {
      const item = this.itemEntities[i];
      item.update(delta);
      if (!item.alive || item.age >= 120) { item.dispose(); this.itemEntities.splice(i, 1); }
    }
  }

  _updateEnemies(delta) {
    const enemies = this.zoneManager ? this.zoneManager.enemies : this.enemies;
    const pPos = this.player.mesh.position;
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      if (!e.alive) {
        if (e.state === 'dead' && e.respawnTimer !== undefined) {
          e.respawnTimer -= delta;
          if (e.respawnTimer <= 0) {
            e.dispose();
            enemies.splice(i, 1);
          }
        } else if (e.state === 'dead') {
          setTimeout(() => { e.dispose(); }, 2000);
          enemies.splice(i, 1);
        }
        continue;
      }
      e.update(delta, pPos);
    }
    this.enemies = enemies;
    if (enemies.length < 3 && Math.random() < 0.001) {
      this._respawnEnemy();
    }
  }

  _respawnEnemy() {
    const enemies = this.zoneManager ? this.zoneManager.enemies : this.enemies;
    const spawns = this.zoneManager ? this.zoneManager.getZoneSpawns(this.zoneManager.currentZoneId) : { enemies: ['bandit', 'wolf', 'boar'] };
    const types = spawns.enemies.length > 0 ? spawns.enemies : ['bandit', 'wolf', 'boar'];
    const type = types[Math.floor(Math.random() * types.length)];
    const x = (Math.random() - 0.5) * 50;
    const z = (Math.random() - 0.5) * 50;
    const y = this.terrain.getHeightAt(x, z);
    if (y < 0.5 || y > 6) return;
    let enemy;
    if (type === 'bandit') enemy = new Bandit(this.renderer.getScene(), this.physics, this.events, 1 + Math.floor(Math.random() * 2));
    else if (type === 'wolf') enemy = new Wolf(this.renderer.getScene(), this.physics, this.events);
    else enemy = new Boar(this.renderer.getScene(), this.physics, this.events);
    enemy.setPosition(x, y, z);
    enemy.init();
    enemies.push(enemy);
  }

  _spawnCraftingStations() {
    const positions = [
      { type: 'campfire', x: 5, z: 5 },
      { type: 'workbench', x: -3, z: 6 },
      { type: 'anvil', x: -5, z: 4 },
      { type: 'hearth', x: 2, z: -4 },
      { type: 'sawmill', x: -6, z: -3 },
      { type: 'loom', x: 4, z: -6 },
      { type: 'kiln', x: 7, z: -2 },
      { type: 'still', x: -2, z: -6 },
    ];
    for (const p of positions) {
      const y = this.terrain.getHeightAt(p.x, p.z);
      if (y < 0.3) continue;
      const station = new CraftingStation(this.renderer.getScene(), new THREE.Vector3(p.x, y, p.z), p.type);
      station.init();
      this.craftingStations.push(station);
    }
  }

  _updateStations(delta) {
    if (!this.player || !this.farming) return;
    const pPos = this.player.mesh.position;
    let nearStation = null;

    for (const s of this.craftingStations) {
      if (!s.alive) continue;
      if (s.isPlayerNear(pPos, 2.5)) {
        nearStation = s;
        break;
      }
    }

    if (nearStation && !this.craftingUI.isVisible()) {
      const labels = { campfire:'Campfire (cook)', workbench:'Workbench (craft)', anvil:'Anvil (forge/repair)',
        hearth:'Hearth (bake/brew)', sawmill:'Sawmill (process)', loom:'Loom (weave)',
        kiln:'Kiln (fire)', still:'Still (brew)' };
      this.interactPrompt.textContent = `[F] ${labels[nearStation.type] || nearStation.type}`;
      this.interactPrompt.style.opacity = '1';
    }

    if (this.input && this.input.getActionDown('craft') && nearStation) {
      if (this.craftingUI.isVisible()) {
        this.craftingUI.hide();
        this.resume();
        this.touchControls.show();
        this.hud.element.style.display = '';
      } else {
        this.craftingUI.show(nearStation.type, this.player.inventory, this.player.skills, () => {
          this.events.emit('inventory:changed', this.player.inventory);
        });
        this.pause();
        this.touchControls.hide();
        this.hud.element.style.display = 'none';
      }
    }
  }

  _onEnemyKilled(data) {
    this.combat.clearLockOn();
  }

  _spawnArrow(data) {
    const arrow = new ArrowEntity(
      this.renderer.getScene(), this.physics,
      data.origin, data.direction, data.damage,
      { enemies: this.zoneManager.getEnemies(), events: this.events }
    );
    arrow.init();
    this.arrows.push(arrow);
  }

  _updateArrows(delta) {
    for (let i = this.arrows.length - 1; i >= 0; i--) {
      const a = this.arrows[i];
      a.update(delta);
      if (!a.alive) {
        a.dispose();
        this.arrows.splice(i, 1);
      }
    }
  }

  _updateZoneGates(delta) {
    if (this.zoneManager && this.player) {
      this.zoneManager.updateGates(this.player.mesh.position, this.loadingScreen);
    }
  }

  _handleGateTravel() {
    this.zoneManager.activatePendingGate(this.loadingScreen, (dest) => {
      this.player.setPosition(dest.x, dest.y, dest.z);
    });
  }

  _onZoneChanged(data) {
    this.currentZone = data.zone;
  }

  _updateFarming(delta) {
    if (this.farming && this.sky) {
      this.farming.update(delta, this.sky.season || 'spring');
    }
  }

  _handleFarmingInteract() {
    const pPos = this.player.mesh.position;
    const plotInfo = this.farming.getNearestPlotInfo(pPos);

    if (plotInfo && plotInfo.dist < 2) {
      const inv = this.player.inventory;
      if (plotInfo.canHarvest) {
        const result = this.farming.harvestPlot(pPos, inv);
        if (result.success) {
          this.audio.playSFX('pickup', 0.5);
          this.events.emit('inventory:changed', inv);
          this.player.addSkillXp('farming', 15);
          return true;
        }
      }
      if (!plotInfo.cropPlanted) {
        const seeds = ['wheat_seed', 'barley_seed', 'cabbage_seed', 'carrot_seed', 'flax_seed', 'onion_set'];
        for (const seedId of seeds) {
          if (getItemQuantity(inv, seedId) > 0) {
            const result = this.farming.plantSeed(pPos, inv, seedId);
            if (result.success) {
              this.audio.playSFX('pickup', 0.3);
              this.events.emit('inventory:changed', inv);
              this.player.addSkillXp('farming', 5);
              return true;
            }
          }
        }
        const ferts = ['manure', 'compost'];
        for (const fertId of ferts) {
          if (getItemQuantity(inv, fertId) > 0) {
            const result = this.farming.fertilizePlot(pPos, inv, fertId);
            if (result.success) {
              this.audio.playSFX('pickup', 0.3);
              this.events.emit('inventory:changed', inv);
              return true;
            }
          }
        }
        const result = this.farming.waterPlot(pPos, inv);
        if (result.success) {
          this.audio.playSFX('pickup', 0.3);
          this.events.emit('inventory:changed', inv);
          return true;
        }
      } else {
        if (plotInfo.waterLevel < 3) {
          const result = this.farming.waterPlot(pPos, inv);
          if (result.success) {
            this.audio.playSFX('pickup', 0.3);
            this.events.emit('inventory:changed', inv);
            return true;
          }
        }
        if (!plotInfo.fertilized) {
          const ferts = ['manure', 'compost'];
          for (const fertId of ferts) {
            if (getItemQuantity(inv, fertId) > 0) {
              const result = this.farming.fertilizePlot(pPos, inv, fertId);
              if (result.success) {
                this.audio.playSFX('pickup', 0.3);
                this.events.emit('inventory:changed', inv);
                return true;
              }
            }
          }
        }
      }
      return true;
    }

    const tool = this.player.equippedTool;
    if (tool && getItemDef(tool.id)?.subtype === 'hoe' && tool.durability > 0) {
      const groundY = this.terrain.getHeightAt(pPos.x, pPos.z);
      if (groundY >= 0.3) {
        const result = this.farming.tillGround(pPos, inv);
        if (result.success) {
          this.audio.playSFX('pickup', 0.4);
          this.events.emit('inventory:changed', inv);
          return true;
        }
      }
    }

    return false;
  }

  _handleInteract(data) {
    const pPos = data.pos || this.player.mesh.position;
    let nearItem = null;
    let nearDist = 2.5;
    for (const item of this.itemEntities) {
      if (!item.alive) continue;
      const dist = item.mesh.position.distanceTo(pPos);
      if (dist < nearDist) { nearDist = dist; nearItem = item; }
    }
    if (nearItem) {
      const added = addToInventory(this.player.inventory, nearItem.itemId, nearItem.quantity);
      if (added === 0) {
        this.audio.playSFX('pickup', 0.5);
        nearItem.dispose();
        const idx = this.itemEntities.indexOf(nearItem);
        if (idx !== -1) this.itemEntities.splice(idx, 1);
        this.events.emit('inventory:changed', this.player.inventory);
      }
    }
  }

  _toggleInventory() {
    if (this.pauseMenu.isVisible() || this.craftingUI.isVisible()) return;
    this.inventoryUI.toggle(this.player.inventory);
    if (this.inventoryUI.isVisible()) {
      this.pause();
      this.touchControls.hide();
      this.hud.element.style.display = 'none';
    } else {
      this.resume();
      this.touchControls.show();
      this.hud.element.style.display = '';
    }
  }

  _togglePause() {
    if (this.inventoryUI.isVisible()) return;
    if (this.paused) {
      this.pauseMenu.hide();
      this.resume();
    } else {
      this.pause();
      this.pauseMenu.show();
    }
  }

  _saveGame() {
    if (this.save.save('0', this._getSaveData())) this.events.emit('player:message', { text: 'Game Saved!' });
  }

  _loadGame() {
    const data = this.save.load('0');
    if (data) { this.loadSave(data); this.events.emit('player:message', { text: 'Game Loaded!' }); }
  }

  _quitToMenu() {
    this.pauseMenu.hide();
    this.paused = false;
    this.gameStarted = false;
    this.touchControls.hide();
    this.hud.element.style.display = 'none';
    this.mainMenu.show();
  }

  _onPlayerDeath() {
    this.pause();
    setTimeout(() => { this.player.respawn(); this.resume(); }, 2000);
  }

  _onRespawn() { this.cameraCtrl.shake(0.3, 0.5); }

  _getSaveData() {
    try {
      return {
        version: CONFIG.GAME.VERSION, timestamp: Date.now(),
        player: {
          position: this.player.position.toArray(),
          health: this.player.health, hunger: this.player.hunger,
          thirst: this.player.thirst, energy: this.player.energy,
          warmth: this.player.warmth, stamina: this.player.stamina,
          inventory: this.player.inventory,
          equippedTool: this.player.equippedTool,
          equippedWeapon: this.player.equippedWeapon,
          skills: this.player.skills, skillXp: this.player.skillXp,
        },
        farming: this.farming ? {
          plots: this.farming.plots.filter(p => p.alive).map(p => ({
            x: p.position.x, y: p.position.y, z: p.position.z,
            crop: p.crop, stage: p.growthStage, progress: p.growthProgress,
            water: p.waterLevel, soil: p.soilQuality, fert: p.fertilized,
          })),
        } : { plots: [] },
        world: { zone: this.currentZone, time: this.sky.time, season: this.sky.season },
      };
    } catch (e) { return null; }
  }

  loadSave(data) {
    if (!data) return false;
    try {
      if (data.player) {
        const p = data.player;
        this.player.health = p.health; this.player.hunger = p.hunger;
        this.player.thirst = p.thirst; this.player.energy = p.energy;
        this.player.warmth = p.warmth; this.player.stamina = p.stamina;
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
    } catch (e) { return false; }
  }

  dispose() {
    this.running = false;
    this.save.stopAutoSave();
    if (this.input) this.input.dispose();
    if (this.audio) this.audio.dispose();
    for (const r of this.resources) r.dispose();
    for (const i of this.itemEntities) i.dispose();
    for (const e of this.enemies) e.dispose();
    for (const a of this.arrows) a.dispose();
    if (this.player) this.player.dispose();
    if (this.terrain) this.terrain.dispose();
    if (this.sky) this.sky.dispose();
    if (this.water) this.water.dispose();
    if (this.physics) this.physics.dispose();
    if (this.combat) this.combat.dispose();
    if (this.zoneManager) this.zoneManager.dispose();
    if (this.farming) this.farming.dispose();
    if (this.craftingUI) this.craftingUI.dispose();
    for (const s of this.craftingStations) s.dispose();
    if (this.touchControls) this.touchControls.dispose();
    if (this.hud) this.hud.dispose();
    if (this.mainMenu) this.mainMenu.dispose();
    if (this.pauseMenu) this.pauseMenu.dispose();
    if (this.settingsPanel) this.settingsPanel.dispose();
    if (this.inventoryUI) this.inventoryUI.dispose();
    if (this.loadingScreen) this.loadingScreen.dispose();
    if (this.ui) this.ui.dispose();
    if (this.renderer) this.renderer.dispose();
    if (this.scenes) this.scenes.dispose();
    if (this.interactPrompt?.parentNode) this.interactPrompt.parentNode.removeChild(this.interactPrompt);
  }
}
