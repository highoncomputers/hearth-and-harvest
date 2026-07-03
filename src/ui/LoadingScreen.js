export class LoadingScreen {
  constructor(container) {
    this.container = container;
    this.element = null;
    this.bar = null;
    this.text = null;
    this.progress = 0;
    this.message = 'Loading...';
    this.visible = false;
  }

  init() {
    this.element = document.createElement('div');
    this.element.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a0a00 50%, #0a0a0a 100%);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      z-index: 10000; font-family: 'Georgia', serif;
      transition: opacity 0.5s ease;
    `;

    const title = document.createElement('div');
    title.textContent = 'Hearth & Harvest';
    title.style.cssText = `
      color: #D4A574; font-size: 36px; font-weight: bold;
      text-shadow: 0 0 20px rgba(212,165,116,0.3);
      margin-bottom: 10px; letter-spacing: 2px;
    `;
    this.element.appendChild(title);

    const subtitle = document.createElement('div');
    subtitle.textContent = 'Medieval Life';
    subtitle.style.cssText = `
      color: #8B7355; font-size: 16px; margin-bottom: 40px;
      letter-spacing: 4px; text-transform: uppercase;
    `;
    this.element.appendChild(subtitle);

    const barContainer = document.createElement('div');
    barContainer.style.cssText = `
      width: 200px; height: 4px;
      background: rgba(255,255,255,0.1);
      border-radius: 2px; overflow: hidden;
    `;

    this.bar = document.createElement('div');
    this.bar.style.cssText = `
      width: 0%; height: 100%;
      background: linear-gradient(90deg, #D4A574, #FFD700);
      border-radius: 2px; transition: width 0.3s ease;
    `;
    barContainer.appendChild(this.bar);
    this.element.appendChild(barContainer);

    this.text = document.createElement('div');
    this.text.textContent = this.message;
    this.text.style.cssText = `
      color: #8B7355; font-size: 12px; margin-top: 15px;
      letter-spacing: 1px;
    `;
    this.element.appendChild(this.text);

    const tip = document.createElement('div');
    tip.textContent = 'For best experience, rotate your device to landscape';
    tip.style.cssText = `
      color: rgba(255,255,255,0.15); font-size: 10px;
      position: absolute; bottom: 20px;
      letter-spacing: 1px;
    `;
    this.element.appendChild(tip);

    this.hide();
    this.container.appendChild(this.element);
  }

  setProgress(value) {
    this.progress = Math.max(0, Math.min(1, value));
    if (this.bar) {
      this.bar.style.width = (this.progress * 100) + '%';
    }
  }

  setMessage(msg) {
    this.message = msg;
    if (this.text) this.text.textContent = msg;
  }

  show() {
    this.visible = true;
    if (this.element) {
      this.element.style.display = 'flex';
      this.element.style.opacity = '1';
    }
  }

  async hide(animate = true) {
    if (animate && this.element) {
      this.element.style.opacity = '0';
      await new Promise(r => setTimeout(r, 500));
    }
    this.visible = false;
    if (this.element) {
      this.element.style.display = 'none';
    }
  }

  async simulateLoad(duration = 2000) {
    this.show();
    const steps = [
      { at: 0.1, msg: 'Generating terrain...' },
      { at: 0.3, msg: 'Planting trees...' },
      { at: 0.5, msg: 'Building village...' },
      { at: 0.7, msg: 'Spawning wildlife...' },
      { at: 0.9, msg: 'Preparing your hearth...' },
      { at: 1.0, msg: 'Ready!' },
    ];
    let stepIdx = 0;
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        this.progress += 0.02;
        if (this.progress >= 1) this.progress = 1;
        this.setProgress(this.progress);
        if (steps[stepIdx] && this.progress >= steps[stepIdx].at) {
          this.setMessage(steps[stepIdx].msg);
          stepIdx++;
        }
        if (this.progress >= 1) {
          clearInterval(interval);
          setTimeout(() => {
            this.hide();
            resolve();
          }, 300);
        }
      }, duration / 50);
    });
  }

  dispose() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
