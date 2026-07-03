import { EventSystem } from './EventSystem.js';

export class InputManager {
  constructor(events) {
    this.events = events || new EventSystem();
    this.keys = {};
    this.keysDown = {};
    this.keysUp = {};
    this.mouse = { x: 0, y: 0, dx: 0, dy: 0, down: false, buttons: [false, false, false] };
    this.touches = new Map();
    this.joystick = { x: 0, y: 0, active: false };
    this.actions = {
      moveX: 0, moveY: 0,
      lookX: 0, lookY: 0,
      attack: false, heavyAttack: false,
      block: false, dodge: false,
      jump: false, sprint: false,
      interact: false, inventory: false,
      lockOn: false,
      ranged: false,
      craft: false,
      pause: false,
    };
    this.prevActions = {};

    this._keydownHandler = (e) => {
      if (!this.keysDown[e.code]) {
        this.keysDown[e.code] = true;
        this.keys[e.code] = true;
        this._mapKeyToAction(e.code, true);
      }
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    };
    this._keyupHandler = (e) => {
      this.keysUp[e.code] = true;
      this.keys[e.code] = false;
      this._mapKeyToAction(e.code, false);
    };
    this._mousedownHandler = (e) => {
      this.mouse.down = true;
      this.mouse.buttons[e.button] = true;
      if (e.button === 0) this.actions.attack = true;
    };
    this._mouseupHandler = (e) => {
      this.mouse.buttons[e.button] = false;
      if (this.mouse.buttons[0] === false && e.button === 0) {
        this.actions.attack = false;
      }
      if (this.mouse.buttons.every(b => !b)) this.mouse.down = false;
    };
    this._mousemoveHandler = (e) => {
      this.mouse.dx = e.movementX || 0;
      this.mouse.dy = e.movementY || 0;
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      if (this.mouse.down && e.button === 2) {
        this.actions.lookX = this.mouse.dx * 0.002;
        this.actions.lookY = this.mouse.dy * 0.002;
      }
    };
    this._touchHandler = (e) => {
      e.preventDefault();
      for (const touch of e.changedTouches) {
        if (e.type === 'touchstart') {
          this.touches.set(touch.identifier, { x: touch.clientX, y: touch.clientY, startX: touch.clientX, startY: touch.clientY });
          this._handleTouchStart(touch);
        } else if (e.type === 'touchmove') {
          const t = this.touches.get(touch.identifier);
          if (t) {
            t.x = touch.clientX;
            t.y = touch.clientY;
          }
          this._handleTouchMove(touch);
        } else if (e.type === 'touchend' || e.type === 'touchcancel') {
          const t = this.touches.get(touch.identifier);
          if (t) {
            this._handleTouchEnd(touch, t);
          }
          this.touches.delete(touch.identifier);
        }
      }
    };
    this._contextMenuHandler = (e) => e.preventDefault();

    this._setupListeners();
  }

  _setupListeners() {
    window.addEventListener('keydown', this._keydownHandler);
    window.addEventListener('keyup', this._keyupHandler);
    window.addEventListener('mousedown', this._mousedownHandler);
    window.addEventListener('mouseup', this._mouseupHandler);
    window.addEventListener('mousemove', this._mousemoveHandler);
    window.addEventListener('touchstart', this._touchHandler, { passive: false });
    window.addEventListener('touchmove', this._touchHandler, { passive: false });
    window.addEventListener('touchend', this._touchHandler, { passive: false });
    window.addEventListener('touchcancel', this._touchHandler, { passive: false });
    window.addEventListener('contextmenu', this._contextMenuHandler);
  }

  _mapKeyToAction(code, pressed) {
    const map = {
      'KeyW': 'moveY', 'ArrowUp': 'moveY',
      'KeyS': 'moveY', 'ArrowDown': 'moveY',
      'KeyA': 'moveX', 'ArrowLeft': 'moveX',
      'KeyD': 'moveX', 'ArrowRight': 'moveX',
      'ShiftLeft': 'sprint', 'ShiftRight': 'sprint',
      'Space': 'jump',
      'KeyE': 'interact',
      'KeyI': 'inventory',
      'KeyQ': 'dodge',
      'KeyR': 'ranged',
      'KeyC': 'craft',
      'KeyB': 'block',
      'KeyF': 'craft',
      'Escape': 'pause',
      'Tab': 'lockOn',
    };
    const action = map[code];
    if (action) {
      if (action === 'moveY') {
        if (code === 'KeyW' || code === 'ArrowUp') this.actions.moveY = pressed ? -1 : 0;
        else if (code === 'KeyS' || code === 'ArrowDown') this.actions.moveY = pressed ? 1 : 0;
      } else if (action === 'moveX') {
        if (code === 'KeyA' || code === 'ArrowLeft') this.actions.moveX = pressed ? -1 : 0;
        else if (code === 'KeyD' || code === 'ArrowRight') this.actions.moveX = pressed ? 1 : 0;
      } else {
        this.actions[action] = pressed;
      }
    }
  }

  _handleTouchStart(touch) {
    const halfW = window.innerWidth / 2;
    const halfH = window.innerHeight / 2;
    if (touch.clientX < halfW) {
      this.events.emit('joystick:start', { id: touch.identifier, x: touch.clientX, y: touch.clientY });
    } else {
      const zone = touch.clientY < halfH ? 'top' : 'bottom';
      if (zone === 'bottom') {
        this.actions.attack = true;
        this.events.emit('action:start', { id: touch.identifier, action: 'attack' });
      } else {
        this.actions.jump = true;
        this.events.emit('action:start', { id: touch.identifier, action: 'jump' });
      }
    }
  }

  _handleTouchMove(touch) {
    this.events.emit('joystick:move', { id: touch.identifier, x: touch.clientX, y: touch.clientY });
  }

  _handleTouchEnd(touch, data) {
    const halfW = window.innerWidth / 2;
    if (data.startX < halfW) {
      this.actions.moveX = 0;
      this.actions.moveY = 0;
      this.joystick.active = false;
      this.events.emit('joystick:end', { id: touch.identifier });
    } else {
      this.actions.attack = false;
      this.actions.jump = false;
      this.events.emit('action:end', { id: touch.identifier });
    }
  }

  update() {
    if (this.keys['KeyW'] || this.keys['ArrowUp']) this.actions.moveY = -1;
    else if (this.keys['KeyS'] || this.keys['ArrowDown']) this.actions.moveY = 1;

    if (this.keys['KeyA'] || this.keys['ArrowLeft']) this.actions.moveX = -1;
    else if (this.keys['KeyD'] || this.keys['ArrowRight']) this.actions.moveX = 1;

    this.mouse.dx = 0;
    this.mouse.dy = 0;
    this.keysDown = {};
    this.keysUp = {};
  }

  getAction(action) {
    return this.actions[action] || false;
  }

  getActionDown(action) {
    return this.actions[action] && !this.prevActions[action];
  }

  getActionUp(action) {
    return !this.actions[action] && this.prevActions[action];
  }

  getMoveVector() {
    const len = Math.sqrt(this.actions.moveX * this.actions.moveX + this.actions.moveY * this.actions.moveY);
    if (len > 1) {
      return { x: this.actions.moveX / len, y: this.actions.moveY / len };
    }
    return { x: this.actions.moveX, y: this.actions.moveY };
  }

  getLookVector() {
    return { x: this.actions.lookX, y: this.actions.lookY };
  }

  endFrame() {
    this.prevActions = { ...this.actions };
    this.actions.lookX = 0;
    this.actions.lookY = 0;
    this.keysDown = {};
    this.keysUp = {};
  }

  dispose() {
    window.removeEventListener('keydown', this._keydownHandler);
    window.removeEventListener('keyup', this._keyupHandler);
    window.removeEventListener('mousedown', this._mousedownHandler);
    window.removeEventListener('mouseup', this._mouseupHandler);
    window.removeEventListener('mousemove', this._mousemoveHandler);
    window.removeEventListener('touchstart', this._touchHandler);
    window.removeEventListener('touchmove', this._touchHandler);
    window.removeEventListener('touchend', this._touchHandler);
    window.removeEventListener('touchcancel', this._touchHandler);
    window.removeEventListener('contextmenu', this._contextMenuHandler);
  }
}
