export class DeathScreen {
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
      background: radial-gradient(ellipse at center, #1A0000 0%, #000 70%);
      display: none; flex-direction: column; align-items: center;
      justify-content: center; z-index: 9999; font-family: Georgia, serif;
    `;

    const skull = document.createElement('div');
    skull.textContent = '\u{1F480}';
    skull.style.cssText = 'font-size: 64px; margin-bottom: 10px; opacity: 0.6;';
    this.element.appendChild(skull);

    const title = document.createElement('div');
    title.textContent = 'You Have Fallen';
    title.style.cssText = 'color: #CC3333; font-size: 28px; font-weight: bold; text-shadow: 0 0 20px rgba(200,50,50,0.5); margin-bottom: 8px;';
    this.element.appendChild(title);

    const subtitle = document.createElement('div');
    subtitle.textContent = 'The world of Hearth & Harvest continues without you...';
    subtitle.style.cssText = 'color: #8B7355; font-size: 13px; margin-bottom: 30px;';

    this.element.appendChild(subtitle);

    const respawnBtn = document.createElement('div');
    respawnBtn.textContent = 'Respawn at Village';
    respawnBtn.style.cssText = `
      padding: 10px 30px; border: 1px solid #8B7355; border-radius: 6px;
      color: #D4A574; font-size: 16px; cursor: pointer; margin-bottom: 10px;
      background: rgba(139,115,85,0.1); transition: all 0.2s;
    `;
    respawnBtn.onmouseenter = () => { respawnBtn.style.background = 'rgba(139,115,85,0.3)'; respawnBtn.style.borderColor = '#D4A574'; };
    respawnBtn.onmouseleave = () => { respawnBtn.style.background = 'rgba(139,115,85,0.1)'; respawnBtn.style.borderColor = '#8B7355'; };
    respawnBtn.onclick = () => this.events.emit('death:respawn');
    this.element.appendChild(respawnBtn);

    const menuBtn = document.createElement('div');
    menuBtn.textContent = 'Return to Main Menu';
    menuBtn.style.cssText = `
      padding: 8px 25px; border: 1px solid #554433; border-radius: 6px;
      color: #8B7355; font-size: 14px; cursor: pointer;
      background: transparent; transition: all 0.2s;
    `;
    menuBtn.onmouseenter = () => { menuBtn.style.color = '#D4A574'; menuBtn.style.borderColor = '#8B7355'; };
    menuBtn.onmouseleave = () => { menuBtn.style.color = '#8B7355'; menuBtn.style.borderColor = '#554433'; };
    menuBtn.onclick = () => this.events.emit('death:quit');
    this.element.appendChild(menuBtn);

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

  isVisible() { return this.visible; }

  dispose() {
    if (this.element && this.element.parentNode) this.element.parentNode.removeChild(this.element);
  }
}
