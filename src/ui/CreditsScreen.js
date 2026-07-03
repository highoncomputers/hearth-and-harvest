export class CreditsScreen {
  constructor(container, events) {
    this.container = container;
    this.events = events;
    this.element = null;
    this.contentEl = null;
    this.visible = false;
    this._animFrame = null;
  }

  init() {
    this.element = document.createElement('div');
    this.element.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: #000; display: none; z-index: 10000;
      font-family: Georgia, serif; overflow: hidden;
    `;

    this.contentEl = document.createElement('div');
    this.contentEl.style.cssText = `
      position: absolute; width: 100%; text-align: center;
      color: #D4A574; transition: none;
    `;
    this.element.appendChild(this.contentEl);

    const skipBtn = document.createElement('div');
    skipBtn.textContent = '[ Skip ]';
    skipBtn.style.cssText = `
      position: fixed; bottom: 20px; right: 20px; color: #8B7355;
      font-size: 12px; cursor: pointer; z-index: 10001;
    `;
    skipBtn.onclick = () => this.hide();
    this.element.appendChild(skipBtn);

    this.container.appendChild(this.element);
  }

  show(onComplete) {
    this.visible = true;
    this.element.style.display = 'block';
    this._onComplete = onComplete;

    const lines = [
      { text: 'Hearth & Harvest', size: '28px', color: '#FFD700', margin: '40px' },
      { text: 'A Medieval Life Simulation', size: '14px', color: '#8B7355', margin: '10px' },
      { text: '', size: '10px', color: '#000', margin: '30px' },
      { text: 'Created by', size: '16px', color: '#C4A574', margin: '10px' },
      { text: 'The Hearth & Harvest Team', size: '14px', color: '#D4A574', margin: '5px' },
      { text: '', size: '10px', color: '#000', margin: '30px' },
      { text: 'Built With', size: '16px', color: '#C4A574', margin: '10px' },
      { text: 'Three.js — 3D Rendering', size: '13px', color: '#A0845A', margin: '3px' },
      { text: 'Cannon-es — Physics', size: '13px', color: '#A0845A', margin: '3px' },
      { text: 'Vite — Build Tooling', size: '13px', color: '#A0845A', margin: '3px' },
      { text: 'Web Audio API — Sound', size: '13px', color: '#A0845A', margin: '3px' },
      { text: '', size: '10px', color: '#000', margin: '30px' },
      { text: 'All Assets Procedurally Generated', size: '14px', color: '#D4A574', margin: '10px' },
      { text: 'No external assets were harmed in the making', size: '11px', color: '#8B7355', margin: '3px' },
      { text: '', size: '10px', color: '#000', margin: '30px' },
      { text: 'Special Thanks', size: '16px', color: '#C4A574', margin: '10px' },
      { text: 'Open source community', size: '13px', color: '#A0845A', margin: '3px' },
      { text: 'Three.js examples & documentation', size: '13px', color: '#A0845A', margin: '3px' },
      { text: 'Cannon-es maintainers', size: '13px', color: '#A0845A', margin: '3px' },
      { text: '', size: '10px', color: '#000', margin: '30px' },
      { text: 'Thank You for Playing!', size: '20px', color: '#FFD700', margin: '20px' },
      { text: '', size: '10px', color: '#000', margin: '30px' },
      { text: '', size: '10px', color: '#000', margin: '100px' },
    ];

    this.contentEl.innerHTML = lines.map(l =>
      `<div style="font-size:${l.size};color:${l.color};margin-bottom:${l.margin};">${l.text}</div>`
    ).join('');

    const totalHeight = lines.length * 40 + 200;
    this.contentEl.style.top = window.innerHeight + 'px';

    let pos = window.innerHeight;
    const speed = 0.8;
    let startTime = null;

    const animate = (time) => {
      if (!startTime) startTime = time;
      const elapsed = (time - startTime) / 1000;
      pos -= speed;
      this.contentEl.style.top = pos + 'px';

      if (pos > -totalHeight) {
        this._animFrame = requestAnimationFrame(animate);
      } else {
        if (this._onComplete) this._onComplete();
      }
    };
    this._animFrame = requestAnimationFrame(animate);
  }

  hide() {
    this.visible = false;
    if (this._animFrame) { cancelAnimationFrame(this._animFrame); this._animFrame = null; }
    this.element.style.display = 'none';
    if (this._onComplete) this._onComplete();
  }

  isVisible() { return this.visible; }

  dispose() {
    if (this._animFrame) cancelAnimationFrame(this._animFrame);
    if (this.element && this.element.parentNode) this.element.parentNode.removeChild(this.element);
  }
}
