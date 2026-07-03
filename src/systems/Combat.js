import { CONFIG } from '../config.js';
import { getItemDef, reduceDurability } from './Inventory.js';

export class CombatSystem {
  constructor(events, cameraCtrl, audio) {
    this.events = events;
    this.camera = cameraCtrl;
    this.audio = audio;
    this.enemies = [];
    this.hitstopTimer = 0;
    this.hitstopDuration = 0;
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.combatMusicPlaying = false;
    this.lockOnTarget = null;
    this.lockedOn = false;

    this.events.on('combat:hitCheck', (data) => this._processHitCheck(data));
    this.events.on('combat:registerEnemy', (enemy) => this._registerEnemy(enemy));
    this.events.on('combat:unregisterEnemy', (enemy) => this._unregisterEnemy(enemy));
    this.events.on('player:dodge', () => this._onDodge());
  }

  _registerEnemy(enemy) {
    if (!this.enemies.includes(enemy)) {
      this.enemies.push(enemy);
    }
  }

  _unregisterEnemy(enemy) {
    const idx = this.enemies.indexOf(enemy);
    if (idx !== -1) this.enemies.splice(idx, 1);
    if (this.lockOnTarget === enemy) {
      this.clearLockOn();
    }
  }

  getActiveEnemies() {
    return this.enemies.filter(e => e.alive);
  }

  _processHitCheck(data) {
    if (this.hitstopTimer > 0) return;
    const { origin, direction, range, damage, source } = data;

    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      if (enemy === source) continue;

      const toEnemy = new THREE.Vector3().copy(enemy.mesh.position).sub(origin);
      const dist = toEnemy.length();
      if (dist > range) continue;

      toEnemy.normalize();
      const dot = direction.dot(toEnemy);
      if (dot < 0.3) continue;

      this._applyHit(enemy, damage, source, dist);
      return;
    }
  }

  _applyHit(enemy, damage, source, dist) {
    let finalDamage = damage;
    let blocked = false;
    let perfectBlock = false;

    if (enemy.blocking) {
      finalDamage *= 0.3;
      blocked = true;
      if (enemy.staggerTimer > 0) {
        perfectBlock = true;
        finalDamage = 0;
        this._triggerHitstop(0.15);
        this.events.emit('player:message', { text: 'PERFECT BLOCK!' });
      }
    }

    if (source.entityType === 'player') {
      const weapon = source.equippedWeapon;
      if (weapon) {
        const def = getItemDef(weapon.id);
        if (def && def.damage) finalDamage += def.damage;
        const broke = reduceDurability(weapon, 1);
        if (broke) {
          source.equippedWeapon = null;
          this.events.emit('player:message', { text: 'Weapon broke!' });
        }
      }
    }

    enemy.takeDamage(finalDamage, source);

    const staggerChance = source.entityType === 'player' ? 0.4 + (source.comboCount || 0) * 0.15 : 0.2;
    if (Math.random() < staggerChance && enemy.alive) {
      enemy.stagger(0.6 + (source.comboCount || 0) * 0.1);
      this.events.emit('enemy:staggered', { enemy, count: source.comboCount || 0 });
    }

    const distFactor = 1 - dist / 2.5;
    const shakeIntensity = finalDamage > 20 ? 0.25 : 0.12;
    const shakeDur = finalDamage > 20 ? 0.15 : 0.08;

    this._triggerHitstop(finalDamage > 20 ? 0.08 : 0.04);
    if (this.camera) this.camera.shake(shakeIntensity * distFactor, shakeDur);
    if (this.audio) this.audio.playSFX('hit', Math.min(1, finalDamage / 30));

    if (enemy.health <= 0) {
      this._triggerHitstop(0.2);
      if (this.camera) this.camera.shake(0.4, 0.3);
      if (this.audio) this.audio.playSFX('death');
      this.events.emit('enemy:killed', { enemy, source, enemyType: enemy.enemyType });
      setTimeout(() => {
        if (enemy.alive === false) {
          enemy.dropLoot();
        }
      }, 500);
    }

    const forceDir = new THREE.Vector3().copy(enemy.mesh.position).sub(
      source.mesh ? source.mesh.position : new THREE.Vector3()
    ).normalize();
    if (enemy.body) {
      const force = finalDamage > 20 ? 5 : 2;
      enemy.body.velocity.x += forceDir.x * force;
      enemy.body.velocity.z += forceDir.z * force;
    }

    this.events.emit('combat:hit', { damage: finalDamage, critical: finalDamage > 25, blocked, perfectBlock });
  }

  _onDodge() {
    this.clearLockOn();
  }

  _triggerHitstop(duration) {
    this.hitstopTimer = duration;
  }

  tryLockOn(playerPos, enemiesInRange) {
    let closest = null;
    let closestDist = CONFIG.COMBAT.LOCK_ON_RANGE;

    for (const enemy of enemiesInRange) {
      if (!enemy.alive) continue;
      const dist = enemy.mesh.position.distanceTo(playerPos);
      if (dist < closestDist) {
        closestDist = dist;
        closest = enemy;
      }
    }

    if (closest) {
      this.lockOnTarget = closest;
      this.lockedOn = true;
      this.events.emit('combat:lockOn', { target: closest });
      return closest;
    }
    return null;
  }

  clearLockOn() {
    this.lockOnTarget = null;
    this.lockedOn = false;
    this.events.emit('combat:unlock');
  }

  update(delta) {
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= delta;
      return true;
    }

    if (this.lockedOn && this.lockOnTarget) {
      if (!this.lockOnTarget.alive) {
        this.clearLockOn();
      }
    }

    return false;
  }

  dispose() {
    this.enemies = [];
    this.lockOnTarget = null;
  }
}
