export class HUD {
  constructor(container, events) {
    this.container = container;
    this.events = events;
    this.element = null;
    this.bars = {};
    this.labels = {};
    this.comboDisplay = null;
    this.lockOnIndicator = null;
    this.damageOverlay = null;
    this.damageAlpha = 0;
  }

  init() {
    this.element = document.createElement('div');
    this.element.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 50;
    `;

    this._createStatsBars();
    this._createHotbar();
    this._createComboDisplay();
    this._createLockOnIndicator();
    this._createDamageOverlay();
    this._createMessageArea();

    this.container.appendChild(this.element);

    this.events.on('player:statsUpdated', (stats) => this._updateStats(stats));
    this.events.on('combat:combo', (data) => this._showCombo(data.count));
    this.events.on('player:hurt', () => this._flashDamage());
    this.events.on('combat:hit', (data) => this._showHitMarker(data));
    this.events.on('player:message', (data) => this._showMessage(data.text));
  }

  _createStatsBars() {
    const barContainer = document.createElement('div');
    barContainer.style.cssText = `
      position: absolute; top: 10px; left: 10px;
      display: flex; flex-direction: column; gap: 3px;
      min-width: 150px;
    `;

    const stats = [
      { id: 'health', color: '#CC3333', bg: 'rgba(200,50,50,0.3)', label: 'HP' },
      { id: 'hunger', color: '#CC8833', bg: 'rgba(200,136,50,0.3)', label: 'Hunger' },
      { id: 'thirst', color: '#3388CC', bg: 'rgba(50,136,200,0.3)', label: 'Thirst' },
      { id: 'energy', color: '#CCCC33', bg: 'rgba(200,200,50,0.3)', label: 'Energy' },
      { id: 'warmth', color: '#FF6633', bg: 'rgba(255,100,50,0.3)', label: 'Warmth' },
    ];

    for (const stat of stats) {
      const row = document.createElement('div');
      row.style.cssText = 'display: flex; align-items: center; gap: 5px;';

      const label = document.createElement('span');
      label.textContent = stat.label;
      label.style.cssText = 'color: #fff; font-size: 10px; width: 45px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);';

      const barOuter = document.createElement('div');
      barOuter.style.cssText = 'width: 100px; height: 10px; background: rgba(0,0,0,0.5); border-radius: 3px; overflow: hidden;';

      const barInner = document.createElement('div');
      barInner.style.cssText = `width: 100%; height: 100%; background: ${stat.color}; border-radius: 3px; transition: width 0.3s ease;`;

      const valueLabel = document.createElement('span');
      valueLabel.textContent = '100';
      valueLabel.style.cssText = 'color: #fff; font-size: 9px; width: 30px; text-align: right; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);';

      barOuter.appendChild(barInner);
      row.appendChild(label);
      row.appendChild(barOuter);
      row.appendChild(valueLabel);
      barContainer.appendChild(row);

      this.bars[stat.id] = { outer: barOuter, inner: barInner, valueLabel };
    }

    this.element.appendChild(barContainer);
  }

  _createHotbar() {
    const hotbar = document.createElement('div');
    hotbar.style.cssText = `
      position: absolute; bottom: 10px; left: 50%;
      transform: translateX(-50%);
      display: flex; gap: 3px;
      background: rgba(0,0,0,0.5);
      padding: 4px; border-radius: 4px;
    `;

    for (let i = 0; i < 6; i++) {
      const slot = document.createElement('div');
      slot.style.cssText = `
        width: 36px; height: 36px;
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 3px; display: flex;
        align-items: center; justify-content: center;
        color: #fff; font-size: 14px;
      `;
      slot.dataset.slot = i;
      hotbar.appendChild(slot);
    }

    this.element.appendChild(hotbar);
  }

  _createComboDisplay() {
    this.comboDisplay = document.createElement('div');
    this.comboDisplay.style.cssText = `
      position: absolute; bottom: 80px; right: 100px;
      color: #FFD700; font-size: 20px; font-weight: bold;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      opacity: 0; transition: opacity 0.2s;
    `;
    this.element.appendChild(this.comboDisplay);
  }

  _createLockOnIndicator() {
    this.lockOnIndicator = document.createElement('div');
    this.lockOnIndicator.style.cssText = `
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 20px; height: 20px;
      border: 2px solid rgba(255,255,255,0.6);
      border-radius: 50%; opacity: 0;
      pointer-events: none;
    `;
    this.element.appendChild(this.lockOnIndicator);
  }

  _createDamageOverlay() {
    this.damageOverlay = document.createElement('div');
    this.damageOverlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 55;
      background: radial-gradient(ellipse at center, transparent 60%, rgba(200,0,0,0.4) 100%);
      opacity: 0; transition: opacity 0.2s;
    `;
    document.body.appendChild(this.damageOverlay);
  }

  _createMessageArea() {
    this.messageArea = document.createElement('div');
    this.messageArea.style.cssText = `
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      color: #FFD700; font-size: 24px; font-weight: bold;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      opacity: 0; transition: opacity 0.3s;
      text-align: center; pointer-events: none;
    `;
    this.element.appendChild(this.messageArea);
  }

  _updateStats(stats) {
    for (const [key, bar] of Object.entries(this.bars)) {
      if (stats[key] !== undefined && stats['max' + key.charAt(0).toUpperCase() + key.slice(1)] !== undefined) {
        const current = stats[key];
        const max = stats['max' + key.charAt(0).toUpperCase() + key.slice(1)];
        const pct = (current / max) * 100;
        bar.inner.style.width = Math.max(0, pct) + '%';
        bar.valueLabel.textContent = Math.floor(current);

        if (pct < 25) bar.inner.style.background = '#FF4444';
        else if (pct < 50) bar.inner.style.background = '#FFAA44';
        else bar.inner.style.background = this._getBarColor(key);
      }
    }

    if (stats.stamina !== undefined) {
    }
  }

  _getBarColor(id) {
    const colors = {
      health: '#CC3333', hunger: '#CC8833', thirst: '#3388CC',
      energy: '#CCCC33', warmth: '#FF6633',
    };
    return colors[id] || '#888888';
  }

  _showCombo(count) {
    if (count > 0) {
      this.comboDisplay.textContent = count + 'x COMBO!';
      this.comboDisplay.style.opacity = '1';
      setTimeout(() => {
        this.comboDisplay.style.opacity = '0';
      }, 500);
    }
  }

  _flashDamage() {
    this.damageOverlay.style.opacity = '1';
    setTimeout(() => { this.damageOverlay.style.opacity = '0'; }, 200);
  }

  _showHitMarker(data) {
    if (data.critical) {
      this._showMessage('CRITICAL HIT!');
    }
  }

  _showMessage(text) {
    this.messageArea.textContent = text;
    this.messageArea.style.opacity = '1';
    setTimeout(() => {
      this.messageArea.style.opacity = '0';
    }, 1500);
  }

  showLockOn() {
    this.lockOnIndicator.style.opacity = '1';
  }

  hideLockOn() {
    this.lockOnIndicator.style.opacity = '0';
  }

  update(delta) {}

  dispose() {
    if (this.damageOverlay && this.damageOverlay.parentNode) {
      this.damageOverlay.parentNode.removeChild(this.damageOverlay);
    }
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
