export class PauseMenu {
  constructor(container, events) {
    this.container = container;
    this.events = events;
    this.element = null;
    this.visible = false;
  }

  init() {
    this.element = document.createElement('div');
    this.element.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.7);
      backdrop-filter: blur(3px);
      -webkit-backdrop-filter: blur(3px);
      display: none; flex-direction: column;
      align-items: center; justify-content: center;
      z-index: 600; font-family: 'Georgia', serif;
    `;

    const frame = document.createElement('div');
    frame.style.cssText = `
      background: linear-gradient(135deg, #2a1f0a 0%, #1a1208 100%);
      border: 2px solid #D4A574;
      border-radius: 8px; padding: 30px 40px;
      display: flex; flex-direction: column;
      align-items: center;
    `;

    const title = document.createElement('div');
    title.textContent = 'PAUSED';
    title.style.cssText = 'color: #D4A574; font-size: 24px; font-weight: bold; letter-spacing: 4px; margin-bottom: 20px;';
    frame.appendChild(title);

    const btnStyle = `
      width: 200px; height: 42px;
      background: rgba(212,165,116,0.15);
      border: 1px solid #8B7355;
      border-radius: 4px; color: #D4A574;
      font-size: 14px; font-family: 'Georgia', serif;
      cursor: pointer; margin: 4px 0;
      letter-spacing: 1px; transition: background 0.15s;
    `;

    const buttons = [
      { text: 'RESUME', action: 'pause:resume' },
      { text: 'SAVE GAME', action: 'pause:save' },
      { text: 'LOAD GAME', action: 'pause:load' },
      { text: 'SETTINGS', action: 'pause:settings' },
      { text: 'QUIT TO MENU', action: 'pause:quit' },
    ];

    for (const btn of buttons) {
      const el = document.createElement('button');
      el.textContent = btn.text;
      el.style.cssText = btnStyle;
      el.onmouseenter = () => { el.style.background = 'rgba(212,165,116,0.3)'; };
      el.onmouseleave = () => { el.style.background = 'rgba(212,165,116,0.15)'; };
      el.addEventListener('click', () => this.events.emit(btn.action));
      el.addEventListener('touchend', (e) => { e.preventDefault(); this.events.emit(btn.action); });
      frame.appendChild(el);
    }

    this.element.appendChild(frame);
    this.container.appendChild(this.element);
  }

  show() {
    this.visible = true;
    this.element.style.display = 'flex';
  }

  hide() {
    this.visible = false;
    this.element.style.display = 'none';
  }

  isVisible() {
    return this.visible;
  }

  dispose() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
