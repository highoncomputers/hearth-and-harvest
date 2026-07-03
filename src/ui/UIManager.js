export class UIManager {
  constructor(events) {
    this.events = events;
    this.elements = new Map();
    this.container = null;
    this.activePanels = [];
  }

  init() {
    this.container = document.createElement('div');
    this.container.id = 'ui-container';
    this.container.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 50;
      font-family: 'Georgia', serif;
      overflow: hidden;
    `;
    document.body.appendChild(this.container);
  }

  register(name, element) {
    this.elements.set(name, element);
    if (element.style) {
      element.style.pointerEvents = 'auto';
    }
  }

  get(name) {
    return this.elements.get(name);
  }

  show(name) {
    const el = this.elements.get(name);
    if (el) {
      el.style.display = '';
      if (!this.activePanels.includes(name)) {
        this.activePanels.push(name);
      }
    }
  }

  hide(name) {
    const el = this.elements.get(name);
    if (el) {
      el.style.display = 'none';
      const idx = this.activePanels.indexOf(name);
      if (idx !== -1) this.activePanels.splice(idx, 1);
    }
  }

  toggle(name) {
    const el = this.elements.get(name);
    if (el) {
      if (el.style.display === 'none') this.show(name);
      else this.hide(name);
    }
  }

  isVisible(name) {
    const el = this.elements.get(name);
    return el && el.style.display !== 'none';
  }

  createPanel(id, style) {
    const panel = document.createElement('div');
    panel.id = id;
    panel.style.cssText = `
      position: fixed; pointer-events: auto;
      display: none; z-index: 60;
      ${style || ''}
    `;
    this.container.appendChild(panel);
    this.elements.set(id, panel);
    return panel;
  }

  update(delta) {}

  dispose() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.elements.clear();
  }
}
