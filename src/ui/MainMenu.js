export class MainMenu {
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
      background: linear-gradient(135deg, #0a0a0a 0%, #1a0a00 30%, #0a0500 70%, #0a0a0a 100%);
      display: none; flex-direction: column;
      align-items: center; justify-content: center;
      z-index: 1000; font-family: 'Georgia', serif;
    `;

    const title = document.createElement('div');
    title.textContent = 'Hearth & Harvest';
    title.style.cssText = `
      color: #D4A574; font-size: clamp(32px, 8vw, 56px); font-weight: bold;
      text-shadow: 0 0 30px rgba(212,165,116,0.3), 0 2px 4px rgba(0,0,0,0.5);
      margin-bottom: 5px; letter-spacing: 3px;
    `;
    this.element.appendChild(title);

    const subtitle = document.createElement('div');
    subtitle.textContent = 'Medieval Life';
    subtitle.style.cssText = `
      color: #8B7355; font-size: clamp(14px, 3vw, 20px);
      margin-bottom: 50px; letter-spacing: 6px; text-transform: uppercase;
    `;
    this.element.appendChild(subtitle);

    const btnStyle = `
      width: min(250px, 80vw); height: 48px;
      background: linear-gradient(135deg, #D4A574 0%, #B8864E 100%);
      border: none; border-radius: 4px;
      color: #1a0a00; font-size: 16px; font-weight: bold;
      font-family: 'Georgia', serif;
      cursor: pointer; margin: 6px 0;
      letter-spacing: 1px;
      transition: transform 0.1s, box-shadow 0.1s;
    `;

    function addHover(btn) {
      btn.onmouseenter = () => { btn.style.transform = 'scale(1.02)'; btn.style.boxShadow = '0 0 15px rgba(212,165,116,0.5)'; };
      btn.onmouseleave = () => { btn.style.transform = 'scale(1)'; btn.style.boxShadow = 'none'; };
    }

    const makeBtn = (text, event) => {
      const btn = document.createElement('button');
      btn.textContent = text;
      btn.style.cssText = btnStyle;
      addHover(btn);
      btn.addEventListener('click', () => this.events.emit(event));
      btn.addEventListener('touchend', (e) => { e.preventDefault(); this.events.emit(event); });
      this.element.appendChild(btn);
      return btn;
    };

    makeBtn('NEW GAME', 'menu:start');
    makeBtn('CONTINUE', 'menu:continue');
    makeBtn('SETTINGS', 'menu:settings');

    const creditsBtn = makeBtn('CREDITS', 'menu:credits');
    creditsBtn.style.cssText = btnStyle.replace('250px', '200px') + 'height: 36px; font-size: 13px; background: rgba(212,165,116,0.15); color: #8B7355; margin-top: 20px;';

    const version = document.createElement('div');
    version.textContent = 'v0.1.0';
    version.style.cssText = 'position: absolute; bottom: 10px; color: rgba(255,255,255,0.1); font-size: 10px; letter-spacing: 1px;';
    this.element.appendChild(version);

    this.hide();
    this.container.appendChild(this.element);
  }

  show() {
    this.visible = true;
    this.element.style.display = 'flex';
    this.events.emit('menu:opened');
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
