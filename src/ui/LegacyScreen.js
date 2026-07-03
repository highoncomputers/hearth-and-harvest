export class LegacyScreen {
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
      background: radial-gradient(ellipse at center, #1A1A0A 0%, #0A0A00 70%);
      display: none; flex-direction: column; align-items: center;
      justify-content: center; z-index: 9999; font-family: Georgia, serif;
    `;

    const crown = document.createElement('div');
    crown.textContent = '\u{1F451}';
    crown.style.cssText = 'font-size: 56px; margin-bottom: 8px;';
    this.element.appendChild(crown);

    const title = document.createElement('div');
    title.textContent = 'Thy Legacy';
    title.style.cssText = 'color: #FFD700; font-size: 30px; font-weight: bold; text-shadow: 0 0 30px rgba(255,215,0,0.4); margin-bottom: 4px;';
    this.element.appendChild(title);

    const subtitle = document.createElement('div');
    subtitle.textContent = 'Another age dawns upon the realm...';
    subtitle.style.cssText = 'color: #8B7355; font-size: 13px; margin-bottom: 20px;';
    this.element.appendChild(subtitle);

    this.statsEl = document.createElement('div');
    this.statsEl.style.cssText = `
      color: #C4A574; font-size: 13px; line-height: 1.8;
      text-align: center; margin-bottom: 25px;
    `;
    this.element.appendChild(this.statsEl);

    const continueBtn = document.createElement('div');
    continueBtn.textContent = 'Continue Your Journey';
    continueBtn.style.cssText = `
      padding: 10px 30px; border: 1px solid #FFD700; border-radius: 6px;
      color: #FFD700; font-size: 16px; cursor: pointer;
      background: rgba(255,215,0,0.1); margin-bottom: 8px;
    `;
    continueBtn.onmouseenter = () => { continueBtn.style.background = 'rgba(255,215,0,0.25)'; };
    continueBtn.onmouseleave = () => { continueBtn.style.background = 'rgba(255,215,0,0.1)'; };
    continueBtn.onclick = () => this.events.emit('legacy:continue');
    this.element.appendChild(continueBtn);

    const menuBtn = document.createElement('div');
    menuBtn.textContent = 'Return to Title';
    menuBtn.style.cssText = 'padding: 8px 25px; border: 1px solid #554433; border-radius: 6px; color: #8B7355; font-size: 14px; cursor: pointer; background: transparent;';
    menuBtn.onmouseenter = () => { menuBtn.style.color = '#D4A574'; menuBtn.style.borderColor = '#8B7355'; };
    menuBtn.onmouseleave = () => { menuBtn.style.color = '#8B7355'; menuBtn.style.borderColor = '#554433'; };
    menuBtn.onclick = () => this.events.emit('legacy:quit');
    this.element.appendChild(menuBtn);

    this.container.appendChild(this.element);
  }

  show(stats) {
    this.visible = true;
    this.element.style.display = 'flex';

    this.statsEl.innerHTML = `
      <div>Quests Completed: ${stats.questsCompleted || 0}</div>
      <div>Enemies Slain: ${stats.enemiesKilled || 0}</div>
      <div>Crops Harvested: ${stats.cropsHarvested || 0}</div>
      <div>Items Crafted: ${stats.itemsCrafted || 0}</div>
      <div>Legacy Score: <span style="color:#FFD700;font-weight:bold;">${stats.legacyScore || 0}</span></div>
      <div style="margin-top:12px;color:#665544;font-style:italic;">
        "${stats.epitaph || 'They built, they fought, they lived.'}"
      </div>
    `;
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
