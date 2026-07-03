export class ActionButton {
  constructor(container, config) {
    this.container = container;
    this.config = config;
    this.element = null;
    this.pressed = false;
    this.touchId = -1;

    this._onStart = null;
    this._onEnd = null;
  }

  init() {
    this.element = document.createElement('div');
    this.element.style.cssText = `
      position: fixed;
      width: ${this.config.size || 60}px;
      height: ${this.config.size || 60}px;
      border-radius: 50%;
      background: ${this.config.bg || 'rgba(255,255,255,0.2)'};
      border: 2px solid ${this.config.border || 'rgba(255,255,255,0.4)'};
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: ${this.config.fontSize || '16'}px;
      font-family: sans-serif; font-weight: bold;
      touch-action: none; z-index: 100;
      user-select: none; -webkit-user-select: none;
      transition: transform 0.1s, background 0.1s;
      pointer-events: none;
    `;
    if (this.config.label) {
      this.element.textContent = this.config.label;
    }
    if (this.config.icon) {
      this.element.innerHTML = this.config.icon;
    }
    this._applyPosition();

    this._onStart = (e) => {
      if (e.detail.action !== 'action' || e.detail.id === undefined) return;
      if (this.config.action !== e.detail.actionType) return;
      this.pressed = true;
      this.touchId = e.detail.id;
      this.element.style.transform = 'scale(0.85)';
      this.element.style.background = this.config.activeBg || 'rgba(255,255,255,0.35)';
    };

    this._onEnd = (e) => {
      if (e.detail.id !== this.touchId) return;
      this.pressed = false;
      this.touchId = -1;
      this.element.style.transform = 'scale(1)';
      this.element.style.background = this.config.bg || 'rgba(255,255,255,0.2)';
    };

    this.container.appendChild(this.element);
  }

  _applyPosition() {
    if (!this.config.position || !this.element) return;
    const p = this.config.position;
    if (p.bottom) this.element.style.bottom = p.bottom + 'px';
    if (p.right) this.element.style.right = p.right + 'px';
    if (p.left) this.element.style.left = p.left + 'px';
    if (p.top) this.element.style.top = p.top + 'px';
  }

  setPressed(p) {
    this.pressed = p;
    if (p) {
      this.element.style.transform = 'scale(0.85)';
      this.element.style.background = this.config.activeBg || 'rgba(255,255,255,0.35)';
    } else {
      this.element.style.transform = 'scale(1)';
      this.element.style.background = this.config.bg || 'rgba(255,255,255,0.2)';
    }
  }

  isPressed() {
    return this.pressed;
  }

  show() {
    if (this.element) this.element.style.display = 'flex';
  }

  hide() {
    if (this.element) this.element.style.display = 'none';
  }

  setPosition(pos) {
    this.config.position = pos;
    this._applyPosition();
  }

  dispose() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
