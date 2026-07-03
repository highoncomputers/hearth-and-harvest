import * as THREE from 'three';
import { Entity } from './Entity.js';
import { CONFIG } from '../config.js';
import { getItemDef } from '../systems/Inventory.js';

export class Player extends Entity {
  constructor(scene, physics, camera, events, audio) {
    super(scene, physics);
    this.camera = camera;
    this.events = events;
    this.audio = audio;
    this.entityType = 'player';

    this.health = CONFIG.PLAYER.HEALTH_MAX;
    this.maxHealth = CONFIG.PLAYER.HEALTH_MAX;
    this.hunger = CONFIG.PLAYER.HUNGER_MAX;
    this.thirst = CONFIG.PLAYER.THIRST_MAX;
    this.energy = CONFIG.PLAYER.ENERGY_MAX;
    this.warmth = CONFIG.PLAYER.WARMTH_MAX;
    this.stamina = CONFIG.PLAYER.STAMINA_MAX;
    this.maxStamina = CONFIG.PLAYER.STAMINA_MAX;

    this.speed = CONFIG.PLAYER.SPEED;
    this.sprinting = false;
    this.jumping = false;
    this.canJump = true;
    this.isGrounded = false;

    this.comboCount = 0;
    this.comboTimer = 0;
    this.attacking = false;
    this.attackType = 'light';
    this.blocking = false;
    this.dodging = false;
    this.dodgeTimer = 0;
    this.iFrames = 0;
    this.lockedOn = false;
    this.lockTarget = null;

    this.inventory = [];
    this.maxInventory = 30;
    this.equippedTool = null;
    this.equippedWeapon = null;
    this.equippedArmor = null;
    this.equippedHelm = null;
    this.equippedBoots = null;

    this.currentZone = 'village';
    this.skills = {
      farming: 1, hunting: 1, crafting: 1, building: 1, cooking: 1, combat: 1,
    };
    this.skillXp = {
      farming: 0, hunting: 0, crafting: 0, building: 0, cooking: 0, combat: 0,
    };
  }

  init() {
    this.body = this.physics.createCapsule(
      70, CONFIG.PLAYER.RADIUS, CONFIG.PLAYER.HEIGHT,
      { x: 0, y: 2, z: 0 }
    );
    this.body.fixedRotation = true;
    this.body.updateMassProperties();

    this._buildMesh();
    this.scene.add(this.mesh);
    this.physics.linkMesh(this.body, this.mesh);
  }

  _buildMesh() {
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x4A7A9A, roughness: 0.7 });
    const headMat = new THREE.MeshStandardMaterial({ color: 0xD4A574, roughness: 0.8 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x5A4A3A, roughness: 0.9 });
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x3A2A1A, roughness: 0.9 });

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.7, 0.4), bodyMat);
    torso.position.y = 1.2;
    this.mesh.add(torso);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), headMat);
    head.position.y = 1.75;
    this.mesh.add(head);

    const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.6, 6), bodyMat);
    leftArm.position.set(-0.45, 1.1, 0);
    this.mesh.add(leftArm);

    const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.6, 6), bodyMat);
    rightArm.position.set(0.45, 1.1, 0);
    this.mesh.add(rightArm);

    const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.6, 6), pantsMat);
    leftLeg.position.set(-0.15, 0.4, 0);
    this.mesh.add(leftLeg);

    const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.6, 6), pantsMat);
    rightLeg.position.set(0.15, 0.4, 0);
    this.mesh.add(rightLeg);

    this.mesh.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
      }
    });
  }

  equipTool(tool) {
    this.equippedTool = tool;
  }

  equipWeapon(weapon) {
    this.equippedWeapon = weapon;
  }

  equipArmor(item) {
    const def = getItemDef(item?.id);
    if (!def || def.type !== 'armor') return;
    const subtype = def.subtype;
    if (subtype === 'body') {
      this.equippedArmor = item;
    } else if (subtype === 'head') {
      this.equippedHelm = item;
    } else if (subtype === 'feet') {
      this.equippedBoots = item;
    }
  }

  getTotalDefense() {
    let def = 0;
    const defs = [this.equippedArmor, this.equippedHelm, this.equippedBoots];
    for (const item of defs) {
      if (item) {
        const d = getItemDef(item.id);
        if (d && d.defense) def += d.defense;
      }
    }
    return def;
  }

  hasToolEquipped(subtype) {
    return this.equippedTool && getItemDef(this.equippedTool.id)?.subtype === subtype;
  }

  hasBowEquipped() {
    return this.equippedWeapon && getItemDef(this.equippedWeapon.id)?.subtype === 'bow';
  }

  addItem(item) {
    if (this.inventory.length < this.maxInventory) {
      this.inventory.push(item);
      this.events.emit('inventory:changed', this.inventory);
      return true;
    }
    return false;
  }

  removeItem(index) {
    if (index >= 0 && index < this.inventory.length) {
      const item = this.inventory.splice(index, 1)[0];
      this.events.emit('inventory:changed', this.inventory);
      return item;
    }
    return null;
  }

  update(delta) {
    super.update(delta);

    if (!this.alive) return;

    this._updateStats(delta);
    this._updateCombo(delta);
    this._updateDodge(delta);
    this._updateIFrames(delta);
    this._updateGrounded();

    if (this.camera) {
      this.camera.setTarget(this.mesh.position);
    }
  }

  _updateStats(delta) {
    this.hunger -= 0.3 * delta;
    this.thirst -= 0.5 * delta;
    this.energy -= 0.2 * delta;

    if (this.warmth > 0) this.warmth -= 0.1 * delta;

    if (this.hunger <= 0 || this.thirst <= 0) {
      this.health -= 2 * delta;
    }

    if (this.energy <= 0) {
      this.stamina = 0;
    }

    if (this.stamina < this.maxStamina && !this.sprinting) {
      this.stamina = Math.min(this.maxStamina, this.stamina + CONFIG.PLAYER.STAMINA_REGEN * delta);
    }

    this.events.emit('player:statsUpdated', {
      health: this.health, maxHealth: this.maxHealth,
      hunger: this.hunger, maxHunger: CONFIG.PLAYER.HUNGER_MAX,
      thirst: this.thirst, maxThirst: CONFIG.PLAYER.THIRST_MAX,
      energy: this.energy, maxEnergy: CONFIG.PLAYER.ENERGY_MAX,
      warmth: this.warmth, maxWarmth: CONFIG.PLAYER.WARMTH_MAX,
      stamina: this.stamina, maxStamina: this.maxStamina,
    });
  }

  _updateCombo(delta) {
    if (this.comboCount > 0) {
      this.comboTimer -= delta;
      if (this.comboTimer <= 0) {
        this.comboCount = 0;
      }
    }
  }

  _updateDodge(delta) {
    if (this.dodging) {
      this.dodgeTimer -= delta;
      this.iFrames = 0.15;
      if (this.dodgeTimer <= 0) {
        this.dodging = false;
      }
    }
  }

  _updateIFrames(delta) {
    if (this.iFrames > 0) {
      this.iFrames -= delta;
    }
  }

  _updateGrounded() {
    if (this.body) {
      const vel = this.body.velocity;
      this.isGrounded = Math.abs(vel.y) < 0.01 && this.body.position.y <= 2.1;
    }
  }

  move(moveX, moveY, delta) {
    if (!this.body || this.dodging) return;

    const forward = this.camera ? this.camera.getForward() : new THREE.Vector3(0, 0, -1);
    const right = this.camera ? this.camera.getRight() : new THREE.Vector3(1, 0, 0);

    const dir = new THREE.Vector3()
      .addScaledVector(right, moveX)
      .addScaledVector(forward, -moveY);

    if (dir.length() > 0) {
      dir.normalize();
      const speed = this.sprinting ? this.speed * CONFIG.PLAYER.SPRINT_MULT : this.speed;
      this.body.velocity.x = dir.x * speed;
      this.body.velocity.z = dir.z * speed;

      const targetAngle = Math.atan2(dir.x, dir.z);
      this.mesh.rotation.y = targetAngle;

      if (this.sprinting && this.stamina > 0) {
        this.stamina -= 10 * delta;
        if (this.stamina <= 0) this.sprinting = false;
      }
    } else {
      this.body.velocity.x *= 0.85;
      this.body.velocity.z *= 0.85;
    }
  }

  jump() {
    if (this.body && this.isGrounded && this.energy > 10) {
      this.body.velocity.y = CONFIG.PLAYER.JUMP_FORCE;
      this.energy -= 5;
      this.isGrounded = false;
    }
  }

  _performAttackHit(damage) {
    this.events.emit('combat:hitCheck', {
      origin: this.mesh.position,
      direction: new THREE.Vector3(0, 0, -1).applyQuaternion(this.mesh.quaternion),
      range: 2.5,
      damage: damage,
      source: this,
    });
  }

  block(active) {
    this.blocking = active && this.stamina > 0;
    this.events.emit('player:block', this.blocking);
  }

  dodge() {
    if (this.dodging || this.stamina < CONFIG.COMBAT.DODGE_STAMINA_COST) return;

    this.dodging = true;
    this.dodgeTimer = 0.3;
    this.stamina -= CONFIG.COMBAT.DODGE_STAMINA_COST;

    const forward = this.camera ? this.camera.getForward() : new THREE.Vector3(0, 0, -1);
    this.body.velocity.x = forward.x * 8;
    this.body.velocity.z = forward.z * 8;
    this.body.velocity.y = 2;

    this.events.emit('player:dodge');
  }

  lockOn(target) {
    this.lockedOn = true;
    this.lockTarget = target;
    if (this.camera) {
      this.camera.lockOn(target);
    }
    this.events.emit('player:lockOn', { target });
    this.events.emit('hud:showLockOn');
  }

  unlock() {
    this.lockedOn = false;
    this.lockTarget = null;
    if (this.camera) {
      this.camera.unlock();
    }
    this.events.emit('player:unlock');
    this.events.emit('hud:hideLockOn');
  }

  toggleLockOn(enemies) {
    if (this.lockedOn) {
      this.unlock();
      return;
    }
    let closest = null;
    let closestDist = CONFIG.COMBAT.LOCK_ON_RANGE;
    const pPos = this.mesh.position;
    for (const e of enemies) {
      if (!e.alive) continue;
      const dist = e.mesh.position.distanceTo(pPos);
      if (dist < closestDist) {
        closestDist = dist;
        closest = e;
      }
    }
    if (closest) this.lockOn(closest);
  }

  move(moveX, moveY, delta) {
    if (!this.body || this.dodging) return;

    if (this.lockedOn && this.lockTarget && this.lockTarget.alive) {
      const targetDir = new THREE.Vector3().copy(this.lockTarget.mesh.position).sub(this.mesh.position);
      targetDir.y = 0;
      if (targetDir.length() > 0.1) {
        this.mesh.rotation.y = Math.atan2(targetDir.x, targetDir.z);
      }
      const right = new THREE.Vector3(-targetDir.z, 0, targetDir.x).normalize();
      const forward = new THREE.Vector3(targetDir.x, 0, targetDir.z).normalize();
      const dir = new THREE.Vector3()
        .addScaledVector(right, moveX)
        .addScaledVector(forward, -moveY);
      if (dir.length() > 0) {
        dir.normalize();
        const speed = this.sprinting ? this.speed * CONFIG.PLAYER.SPRINT_MULT : this.speed;
        this.body.velocity.x = dir.x * speed;
        this.body.velocity.z = dir.z * speed;
        if (this.sprinting && this.stamina > 0) this.stamina -= 10 * delta;
      } else {
        this.body.velocity.x *= 0.85;
        this.body.velocity.z *= 0.85;
      }
      return;
    }

    const forward = this.camera ? this.camera.getForward() : new THREE.Vector3(0, 0, -1);
    const right = this.camera ? this.camera.getRight() : new THREE.Vector3(1, 0, 0);
    const dir = new THREE.Vector3()
      .addScaledVector(right, moveX)
      .addScaledVector(forward, -moveY);
    if (dir.length() > 0) {
      dir.normalize();
      const speed = this.sprinting ? this.speed * CONFIG.PLAYER.SPRINT_MULT : this.speed;
      this.body.velocity.x = dir.x * speed;
      this.body.velocity.z = dir.z * speed;
      const targetAngle = Math.atan2(dir.x, dir.z);
      this.mesh.rotation.y = targetAngle;
      if (this.sprinting && this.stamina > 0) this.stamina -= 10 * delta;
    } else {
      this.body.velocity.x *= 0.85;
      this.body.velocity.z *= 0.85;
    }
  }

  lightAttack() {
    if (this.attacking || this.dodging) return;
    if (this.stamina < CONFIG.COMBAT.LIGHT_STAMINA_COST) return;

    this.attacking = true;
    this.attackType = 'light';
    this.stamina -= CONFIG.COMBAT.LIGHT_STAMINA_COST;
    this.comboCount++;
    this.comboTimer = CONFIG.COMBAT.COMBO_WINDOW;

    let dmg = CONFIG.COMBAT.LIGHT_ATTACK_DAMAGE;
    if (this.equippedWeapon) {
      const def = getItemDef(this.equippedWeapon.id);
      if (def && def.damage) dmg += def.damage;
    }
    dmg *= (1 + this.skills.combat * 0.05);

    if (this.comboCount >= 3) {
      dmg *= 1.5;
      this.events.emit('combat:combo', { count: this.comboCount });
    }

    this.events.emit('player:attack', { type: 'light', combo: this.comboCount, damage: dmg });
    if (this.audio) this.audio.playSFX('sword_swing', 0.4);

    setTimeout(() => { this.attacking = false; }, 300);
    this._performAttackHit(dmg);
  }

  heavyAttack() {
    if (this.attacking || this.dodging) return;
    if (this.stamina < CONFIG.COMBAT.HEAVY_STAMINA_COST) return;

    this.attacking = true;
    this.attackType = 'heavy';
    this.stamina -= CONFIG.COMBAT.HEAVY_STAMINA_COST;

    let dmg = CONFIG.COMBAT.HEAVY_ATTACK_DAMAGE;
    if (this.equippedWeapon) {
      const def = getItemDef(this.equippedWeapon.id);
      if (def && def.damage) dmg += def.damage * 1.5;
    }
    dmg *= (1 + this.skills.combat * 0.05);

    this.events.emit('player:attack', { type: 'heavy', combo: this.comboCount, damage: dmg });
    if (this.audio) this.audio.playSFX('sword_swing', 0.6);

    setTimeout(() => { this.attacking = false; }, 600);
    this._performAttackHit(dmg);
  }

  bowAttack() {
    if (this.attacking || this.dodging || !this.hasBowEquipped()) return;
    if (this.stamina < 15) return;
    if (!this.inventory.some(i => i && i.id === 'arrow' && i.quantity > 0)) return;

    this.attacking = true;
    this.attackType = 'ranged';
    this.stamina -= 15;

    for (let i = 0; i < this.inventory.length; i++) {
      if (this.inventory[i] && this.inventory[i].id === 'arrow') {
        this.inventory[i].quantity--;
        if (this.inventory[i].quantity <= 0) this.inventory.splice(i, 1);
        break;
      }
    }
    this.events.emit('inventory:changed', this.inventory);

    const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(this.mesh.quaternion);
    let dmg = CONFIG.COMBAT.LIGHT_ATTACK_DAMAGE * 0.8;
    if (this.equippedWeapon) {
      const def = getItemDef(this.equippedWeapon.id);
      if (def && def.damage) dmg += def.damage;
    }
    dmg *= (1 + this.skills.hunting * 0.05);

    this.events.emit('player:rangedAttack', {
      origin: this.mesh.position,
      direction,
      damage: Math.floor(dmg),
    });
    if (this.audio) this.audio.playSFX('bow_shoot', 0.6);

    setTimeout(() => { this.attacking = false; }, 400);
  }

  takeDamage(amount, source) {
    if (this.iFrames > 0) return;
    if (this.blocking) {
      amount *= 0.3;
      this.stamina -= CONFIG.COMBAT.BLOCK_STAMINA_DRAIN;
      this.events.emit('player:blocked', amount);
      if (this.stamina <= 0) {
        this.blocking = false;
        this.stamina = 0;
      }
      return;
    }
    const defense = this.getTotalDefense();
    const reduction = defense / (defense + 50);
    amount *= (1 - reduction);
    super.takeDamage(amount, source);
    this.iFrames = 0.3;
    this.events.emit('player:hurt', { amount, health: this.health });
    if (!this.alive) {
      this.events.emit('player:death');
    }
  }

  die(source) {
    super.die(source);
    this.body.velocity.set(0, 0, 0);
    this.events.emit('player:died', { source });
  }

  addSkillXp(skill, amount) {
    if (this.skillXp[skill] !== undefined) {
      this.skillXp[skill] += amount;
      const needed = this.skills[skill] * 100;
      if (this.skillXp[skill] >= needed) {
        this.skillXp[skill] -= needed;
        this.skills[skill]++;
        this.events.emit('player:skillUp', { skill, level: this.skills[skill] });
      }
    }
  }

  respawn() {
    this.health = this.maxHealth * 0.5;
    this.hunger = CONFIG.PLAYER.HUNGER_MAX * 0.5;
    this.thirst = CONFIG.PLAYER.THIRST_MAX * 0.5;
    this.energy = CONFIG.PLAYER.ENERGY_MAX * 0.5;
    this.warmth = CONFIG.PLAYER.WARMTH_MAX * 0.5;
    this.stamina = this.maxStamina;
    this.alive = true;
    this.setPosition(0, 3, 0);
    this.events.emit('player:respawned');
  }

  dispose() {
    super.dispose();
    this.inventory = [];
    this.lockTarget = null;
  }
}
