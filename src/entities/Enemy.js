import * as THREE from 'three';
import { Entity } from './Entity.js';

const STATE = {
  IDLE: 'idle',
  PATROL: 'patrol',
  ALERT: 'alert',
  CHASE: 'chase',
  ATTACK: 'attack',
  STAGGER: 'stagger',
  FLEE: 'flee',
  DEAD: 'dead',
};

export class Enemy extends Entity {
  constructor(scene, physics, events, config) {
    super(scene, physics);
    this.events = events;
    this.entityType = 'enemy';
    this.enemyType = 'base';

    this.state = STATE.IDLE;
    this.stateTimer = 0;
    this.stateCooldown = 0;
    this.prevState = STATE.IDLE;

    this.speed = config.speed || 3;
    this.attackDamage = config.attackDamage || 10;
    this.attackRange = config.attackRange || 1.5;
    this.attackCooldown = config.attackCooldown || 1.5;
    this.attackTimer = 0;
    this.agroRange = config.agroRange || 15;
    this.fleeHealth = config.fleeHealth || 0.15;
    this.staggerTimer = 0;
    this.blocking = false;
    this.lootTable = config.lootTable || [{ id: 'bone', quantity: 1, chance: 0.5 }];
    this.xpReward = config.xpReward || 10;

    this.homePosition = new THREE.Vector3();
    this.patrolTarget = new THREE.Vector3();
    this.patrolRadius = config.patrolRadius || 10;
    this.target = null;

    this.telegraphActive = false;
    this.telegraphTimer = 0;
    this.telegraphMesh = null;
    this.attackWindup = config.attackWindup || 0.3;
  }

  init() {
    this.homePosition.copy(this.mesh.position);
    this._pickPatrolTarget();
    this.events.emit('combat:registerEnemy', this);
  }

  _pickPatrolTarget() {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * this.patrolRadius;
    this.patrolTarget.set(
      this.homePosition.x + Math.cos(angle) * dist,
      this.homePosition.y,
      this.homePosition.z + Math.sin(angle) * dist,
    );
  }

  setTarget(entity) {
    this.target = entity;
    if (entity) {
      this.state = STATE.ALERT;
      this.stateTimer = 2;
    }
  }

  takeDamage(amount, source) {
    super.takeDamage(amount, source);
    this.setTarget(source);
    if (this.state !== STATE.STAGGER) {
      this.prevState = this.state;
      this.state = STATE.STAGGER;
      this.stateTimer = 0.4;
    }
  }

  stagger(duration) {
    if (this.state === STATE.DEAD) return;
    this.prevState = this.state;
    this.state = STATE.STAGGER;
    this.staggerTimer = duration;
    this.stateTimer = duration;
  }

  die(source) {
    this.state = STATE.DEAD;
    super.die(source);
    this.events.emit('combat:unregisterEnemy', this);
    if (this.telegraphMesh) {
      this.scene.remove(this.telegraphMesh);
      this.telegraphMesh = null;
    }
  }

  dropLoot() {
    const drops = this.lootTable.filter(l => Math.random() < l.chance);
    for (const drop of drops) {
      this.events.emit('world:dropItem', {
        itemId: drop.id,
        quantity: drop.quantity,
        position: this.mesh.position.clone(),
      });
    }
    this.events.emit('player:skillXp', { skill: 'combat', amount: this.xpReward });
  }

  _showTelegraph() {
    if (!this.telegraphMesh) {
      const geo = new THREE.RingGeometry(0.3, 0.5, 16);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xFF0000,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
      });
      this.telegraphMesh = new THREE.Mesh(geo, mat);
      this.telegraphMesh.rotation.x = -Math.PI / 2;
      this.scene.add(this.telegraphMesh);
    }
    this.telegraphActive = true;
    this.telegraphTimer = this.attackWindup;
    this.telegraphMesh.position.copy(this.mesh.position);
    this.telegraphMesh.position.y += 0.05;
    this.telegraphMesh.visible = true;
  }

  _hideTelegraph() {
    if (this.telegraphMesh) {
      this.telegraphMesh.visible = false;
    }
    this.telegraphActive = false;
  }

  updateAI(delta, playerPos) {
    if (this.state === STATE.DEAD) return;
    if (this.staggerTimer > 0) {
      this.staggerTimer -= delta;
      if (this.staggerTimer <= 0 && this.state === STATE.STAGGER) {
        this.state = this.prevState;
      }
      return;
    }

    this.stateTimer -= delta;
    this.attackTimer -= delta;

    if (this.telegraphActive) {
      this.telegraphTimer -= delta;
      if (this.telegraphTimer <= 0) {
        this._hideTelegraph();
        this._executeAttack(playerPos);
      }
      return;
    }

    const distToPlayer = playerPos ? this.mesh.position.distanceTo(playerPos) : 999;

    switch (this.state) {
      case STATE.IDLE:
        this._idle(delta);
        if (distToPlayer < this.agroRange) this.state = STATE.ALERT;
        break;

      case STATE.PATROL:
        this._patrol(delta);
        if (distToPlayer < this.agroRange) this.state = STATE.ALERT;
        break;

      case STATE.ALERT:
        this._lookAt(playerPos);
        this.stateTimer = 1;
        this.state = STATE.CHASE;
        break;

      case STATE.CHASE:
        this._chase(delta, playerPos);
        if (distToPlayer < this.attackRange && this.attackTimer <= 0) {
          this._showTelegraph();
          this.state = STATE.ATTACK;
        }
        if (distToPlayer > this.agroRange * 1.5) {
          this.state = STATE.PATROL;
          this.target = null;
          this._pickPatrolTarget();
        }
        if (this.health / this.maxHealth < this.fleeHealth) {
          this.state = STATE.FLEE;
        }
        break;

      case STATE.ATTACK:
        if (!this.telegraphActive && this.attackTimer <= 0) {
          this._showTelegraph();
        }
        break;

      case STATE.FLEE:
        this._flee(delta, playerPos);
        if (distToPlayer > this.agroRange * 2) {
          this.state = STATE.PATROL;
          this._pickPatrolTarget();
        }
        break;
    }
  }

  _idle(delta) {
    this.stateTimer -= delta;
    if (this.stateTimer <= 0) {
      this.state = STATE.PATROL;
      this.stateTimer = 3 + Math.random() * 5;
      this._pickPatrolTarget();
    }
  }

  _patrol(delta) {
    const dir = new THREE.Vector3().copy(this.patrolTarget).sub(this.mesh.position);
    dir.y = 0;
    if (dir.length() < 1) {
      this.state = STATE.IDLE;
      this.stateTimer = 2 + Math.random() * 4;
      this._pickPatrolTarget();
      return;
    }
    dir.normalize();
    this.mesh.position.x += dir.x * this.speed * 0.4 * delta;
    this.mesh.position.z += dir.z * this.speed * 0.4 * delta;
    this.mesh.rotation.y = Math.atan2(dir.x, dir.z);
    if (this.body) {
      this.body.position.copy(this.mesh.position);
    }
  }

  _chase(delta, targetPos) {
    if (!targetPos) return;
    const dir = new THREE.Vector3().copy(targetPos).sub(this.mesh.position);
    dir.y = 0;
    const dist = dir.length();
    if (dist < 0.5) return;
    dir.normalize();
    this.mesh.position.x += dir.x * this.speed * delta;
    this.mesh.position.z += dir.z * this.speed * delta;
    this.mesh.rotation.y = Math.atan2(dir.x, dir.z);
    if (this.body) {
      this.body.position.copy(this.mesh.position);
    }
  }

  _flee(delta, fromPos) {
    if (!fromPos) return;
    const dir = new THREE.Vector3().copy(this.mesh.position).sub(fromPos);
    dir.y = 0;
    dir.normalize();
    this.mesh.position.x += dir.x * this.speed * 0.7 * delta;
    this.mesh.position.z += dir.z * this.speed * 0.7 * delta;
    this.mesh.rotation.y = Math.atan2(dir.x, dir.z);
    if (this.body) {
      this.body.position.copy(this.mesh.position);
    }
  }

  _lookAt(targetPos) {
    if (!targetPos) return;
    const dir = new THREE.Vector3().copy(targetPos).sub(this.mesh.position);
    dir.y = 0;
    if (dir.length() > 0.1) {
      this.mesh.rotation.y = Math.atan2(dir.x, dir.z);
    }
  }

  _executeAttack(playerPos) {
    if (!playerPos || !this.target) return;
    const dist = this.mesh.position.distanceTo(playerPos);
    if (dist <= this.attackRange + 0.5) {
      this.events.emit('combat:hitCheck', {
        origin: this.mesh.position,
        direction: new THREE.Vector3(0, 0, -1).applyQuaternion(this.mesh.quaternion),
        range: this.attackRange,
        damage: this.attackDamage,
        source: this,
      });
    }
    this.attackTimer = this.attackCooldown;
    this.state = STATE.CHASE;
  }

  update(delta, playerPos) {
    super.update(delta);
    this.updateAI(delta, playerPos);
  }

  dispose() {
    if (this.telegraphMesh) {
      this.scene.remove(this.telegraphMesh);
      this.telegraphMesh.geometry.dispose();
      this.telegraphMesh.material.dispose();
    }
    this.events.emit('combat:unregisterEnemy', this);
    super.dispose();
  }
}

export { STATE };
