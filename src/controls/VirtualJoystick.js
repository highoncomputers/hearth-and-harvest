export class VirtualJoystick {
  constructor(container, events) {
    this.container = container;
    this.events = events;
    this.element = null;
    this.knob = null;
    this.active = false;
    this.touchId = -1;
    this.baseX = 0;
    this.baseY = 0;
    this.value = { x: 0, y: 0 };
    this.radius = 50;
    this.deadzone = 0.15;

    this._onStart = null;
    this._onMove = null;
    this._onEnd = null;
  }

  init() {
    this.element = document.createElement('div');
    this.element.style.cssText = `
      position: fixed; bottom: 30px; left: 30px;
      width: ${this.radius * 2}px; height: ${this.radius * 2}px;
      border-radius: 50%;
      background: rgba(255,255,255,0.15);
      border: 2px solid rgba(255,255,255,0.3);
      touch-action: none; z-index: 100;
      pointer-events: none; opacity: 0.6;
    `;

    this.knob = document.createElement('div');
    this.knob.style.cssText = `
      position: absolute; top: 50%; left: 50%;
      width: ${this.radius * 0.6}px; height: ${this.radius * 0.6}px;
      border-radius: 50%;
      background: rgba(255,255,255,0.4);
      transform: translate(-50%, -50%);
      transition: none;
    `;
    this.element.appendChild(this.knob);
    this.container.appendChild(this.element);

    this._onStart = (e) => {
      if (e.detail.action !== 'joystick') return;
      this.touchId = e.detail.id;
      this.active = true;
      this.baseX = e.detail.x;
      this.baseY = e.detail.y;
      this.element.style.left = (e.detail.x - this.radius) + 'px';
      this.element.style.top = (e.detail.y - this.radius) + 'px';
      this.element.style.opacity = '0.9';
      this.element.style.pointerEvents = 'auto';
    };

    this._onMove = (e) => {
      if (!this.active || e.detail.id !== this.touchId) return;
      const dx = e.detail.x - this.baseX;
      const dy = e.detail.y - this.baseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = this.radius * 0.8;
      const clamped = Math.min(dist, maxDist);
      const angle = Math.atan2(dy, dx);

      let nx = Math.cos(angle) * clamped / maxDist;
      let ny = Math.sin(angle) * clamped / maxDist;

      if (Math.abs(nx) < this.deadzone) nx = 0;
      if (Math.abs(ny) < this.deadzone) ny = 0;

      this.value.x = nx;
      this.value.y = ny;

      this.knob.style.transform = `translate(${-50 + nx * 50}%, ${-50 + ny * 50}%)`;
    };

    this._onEnd = (e) => {
      if (e.detail.id !== this.touchId) return;
      this.active = false;
      this.touchId = -1;
      this.value.x = 0;
      this.value.y = 0;
      this.knob.style.transform = 'translate(-50%, -50%)';
      this.element.style.opacity = '0.6';
      this.element.style.pointerEvents = 'none';
    };

    this.events.on('joystick:start', this._onStart);
    this.events.on('joystick:move', this._onMove);
    this.events.on('joystick:end', this._onEnd);
  }

  getValue() {
    return this.value;
  }

  setRadius(r) {
    this.radius = r;
    this.element.style.width = (r * 2) + 'px';
    this.element.style.height = (r * 2) + 'px';
    this.knob.style.width = (r * 0.6) + 'px';
    this.knob.style.height = (r * 0.6) + 'px';
  }

  dispose() {
    if (this._onStart) this.events.off('joystick:start', this._onStart);
    if (this._onMove) this.events.off('joystick:move', this._onMove);
    if (this._onEnd) this.events.off('joystick:end', this._onEnd);
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
