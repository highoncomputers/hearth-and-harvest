import { VirtualJoystick } from './VirtualJoystick.js';
import { ActionButton } from './ActionButton.js';

export class TouchControls {
  constructor(container, events) {
    this.container = container;
    this.events = events;
    this.joystick = null;
    this.buttons = [];
    this.visible = true;
    this.actionTouchMap = new Map();
  }

  init() {
    this.joystick = new VirtualJoystick(this.container, this.events);
    this.joystick.init();

    const btnSize = Math.min(window.innerWidth, window.innerHeight) * 0.1;
    const gap = 10;

    this._createButton('attack', {
      label: '\u2694',
      size: btnSize,
      fontSize: btnSize * 0.5,
      bg: 'rgba(200,50,50,0.3)',
      border: 'rgba(200,50,50,0.6)',
      activeBg: 'rgba(200,50,50,0.6)',
      position: { bottom: btnSize * 0.5, right: btnSize * 0.5 },
      action: 'attack',
    });

    this._createButton('block', {
      label: '\u26E8',
      size: btnSize * 0.85,
      fontSize: btnSize * 0.4,
      bg: 'rgba(50,100,200,0.3)',
      border: 'rgba(50,100,200,0.6)',
      activeBg: 'rgba(50,100,200,0.6)',
      position: { bottom: btnSize * 1.6 + gap, right: btnSize * 1.6 + gap },
      action: 'block',
    });

    this._createButton('dodge', {
      label: '\u21BB',
      size: btnSize * 0.85,
      fontSize: btnSize * 0.4,
      bg: 'rgba(50,200,50,0.3)',
      border: 'rgba(50,200,50,0.6)',
      activeBg: 'rgba(50,200,50,0.6)',
      position: { bottom: btnSize * 0.5, right: btnSize * 1.7 + gap },
      action: 'dodge',
    });

    this._createButton('jump', {
      label: '\u2191',
      size: btnSize * 0.85,
      fontSize: btnSize * 0.4,
      bg: 'rgba(200,200,50,0.3)',
      border: 'rgba(200,200,50,0.6)',
      activeBg: 'rgba(200,200,50,0.6)',
      position: { bottom: btnSize * 1.6 + gap, right: btnSize * 0.5 },
      action: 'jump',
    });

    this._createButton('interact', {
      label: '\u270B',
      size: btnSize * 0.7,
      fontSize: btnSize * 0.35,
      bg: 'rgba(255,255,255,0.15)',
      border: 'rgba(255,255,255,0.3)',
      activeBg: 'rgba(255,255,255,0.35)',
      position: { bottom: 'auto', top: btnSize * 0.5, right: btnSize * 0.5 },
      action: 'interact',
    });

    this._setupTouchForwarding();
  }

  _createButton(id, config) {
    const btn = new ActionButton(this.container, config);
    btn.init();
    this.buttons.push({ id, button: btn, config });
    return btn;
  }

  _setupTouchForwarding() {
    this.container.addEventListener('touchstart', (e) => {
      for (const touch of e.changedTouches) {
        const halfW = window.innerWidth / 2;
        const el = document.elementFromPoint(touch.clientX, touch.clientY);

        const rightSide = touch.clientX >= halfW;
        if (!rightSide) {
          this.events.emit('joystick:start', {
            id: touch.identifier, x: touch.clientX, y: touch.clientY, action: 'joystick',
          });
        } else if (el && el.closest && el.closest('[data-action]')) {
          const actionEl = el.closest('[data-action]');
          const action = actionEl.dataset.action;
          this.events.emit('action:start', {
            id: touch.identifier, action, actionType: action,
          });
        }

        for (const { id, button, config } of this.buttons) {
          const rect = button.element.getBoundingClientRect();
          if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
              touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
            this.events.emit('action:start', {
              id: touch.identifier, action: config.action, actionType: config.action,
            });
          }
        }
      }
    }, { passive: true });

    this.container.addEventListener('touchmove', (e) => {
      for (const touch of e.changedTouches) {
        this.events.emit('joystick:move', { id: touch.identifier, x: touch.clientX, y: touch.clientY });
      }
    }, { passive: true });

    this.container.addEventListener('touchend', (e) => {
      for (const touch of e.changedTouches) {
        this.events.emit('joystick:end', { id: touch.identifier });
        this.events.emit('action:end', { id: touch.identifier });
      }
    }, { passive: true });
  }

  update(inputManager) {
    const joy = this.joystick.getValue();
    inputManager.actions.moveX = joy.x;
    inputManager.actions.moveY = joy.y;

    for (const { id, button, config } of this.buttons) {
      if (button.isPressed()) {
        if (config.action === 'attack') inputManager.actions.attack = true;
        else if (config.action === 'block') inputManager.actions.block = true;
        else if (config.action === 'dodge') inputManager.actions.dodge = true;
        else if (config.action === 'jump') inputManager.actions.jump = true;
        else if (config.action === 'interact') inputManager.actions.interact = true;
      }
    }
  }

  show() {
    this.visible = true;
    this.joystick.element.style.display = '';
    for (const { button } of this.buttons) button.show();
  }

  hide() {
    this.visible = false;
    this.joystick.element.style.display = 'none';
    for (const { button } of this.buttons) button.hide();
  }

  reposition() {
    const btnSize = Math.min(window.innerWidth, window.innerHeight) * 0.1;
    this.joystick.setRadius(btnSize * 0.9);
    this.buttons[0].setPosition({ bottom: btnSize * 0.5, right: btnSize * 0.5 });
    this.buttons[1].setPosition({ bottom: btnSize * 1.6 + 10, right: btnSize * 1.6 + 10 });
    this.buttons[2].setPosition({ bottom: btnSize * 0.5, right: btnSize * 1.7 + 10 });
    this.buttons[3].setPosition({ bottom: btnSize * 1.6 + 10, right: btnSize * 0.5 });
    this.buttons[4].setPosition({ bottom: 'auto', top: btnSize * 0.5, right: btnSize * 0.5 });
  }

  dispose() {
    this.joystick.dispose();
    for (const { button } of this.buttons) button.dispose();
    this.buttons = [];
  }
}
