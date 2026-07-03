import { getQualityTier, setQualityTier, getQualitySettings } from '../utils/device.js';

export class SettingsPanel {
  constructor(container, events, audio) {
    this.container = container;
    this.events = events;
    this.audio = audio;
    this.element = null;
    this.visible = false;
    this.onClose = null;
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
      z-index: 700; font-family: 'Georgia', serif;
    `;

    const frame = document.createElement('div');
    frame.style.cssText = `
      background: linear-gradient(135deg, #2a1f0a 0%, #1a1208 100%);
      border: 2px solid #D4A574;
      border-radius: 8px; padding: 25px 35px;
      display: flex; flex-direction: column;
      width: min(350px, 85vw);
    `;

    const header = document.createElement('div');
    header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;';
    const title = document.createElement('span');
    title.textContent = 'SETTINGS';
    title.style.cssText = 'color: #D4A574; font-size: 20px; font-weight: bold; letter-spacing: 3px;';
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'X';
    closeBtn.style.cssText = 'background: none; border: 1px solid #8B7355; color: #D4A574; cursor: pointer; padding: 2px 8px; border-radius: 3px; font-size: 14px;';
    closeBtn.addEventListener('click', () => this.hide());
    header.appendChild(title);
    header.appendChild(closeBtn);
    frame.appendChild(header);

    const groupStyle = 'margin-bottom: 14px;';
    const labelStyle = 'color: #D4A574; font-size: 12px; letter-spacing: 1px; margin-bottom: 5px; display: block;';
    const sliderStyle = 'width: 100%; height: 4px; -webkit-appearance: none; appearance: none; background: #3a2a1a; border-radius: 2px; outline: none;';
    const sliderThumb = '::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #D4A574; cursor: pointer; }';

    const style = document.createElement('style');
    style.textContent = sliderThumb;
    frame.appendChild(style);

    this._addSection(frame, 'AUDIO', groupStyle);

    this._addSlider(frame, 'Master Volume', 0.7, (v) => {
      if (this.audio) this.audio.setMasterVolume(v);
      this._savePref('masterVolume', v);
    }, labelStyle, sliderStyle);

    this._addSlider(frame, 'Music Volume', 0.5, (v) => {
      if (this.audio) this.audio.setMusicVolume(v);
      this._savePref('musicVolume', v);
    }, labelStyle, sliderStyle);

    this._addSlider(frame, 'SFX Volume', 0.8, (v) => {
      if (this.audio) this.audio.setSFXVolume(v);
      this._savePref('sfxVolume', v);
    }, labelStyle, sliderStyle);

    this._addSection(frame, 'GRAPHICS', groupStyle);

    const qRow = document.createElement('div');
    qRow.style.cssText = 'margin-bottom: 14px;';
    const qLabel = document.createElement('span');
    qLabel.textContent = 'Quality: ';
    qLabel.style.cssText = labelStyle;
    qLabel.style.display = 'inline';
    const qVal = document.createElement('span');
    qVal.id = 'quality-value';
    qVal.textContent = getQualityTier().toUpperCase();
    qVal.style.cssText = 'color: #FFD700; font-size: 12px;';
    qLabel.appendChild(qVal);
    qRow.appendChild(qLabel);

    const qBtns = document.createElement('div');
    qBtns.style.cssText = 'display: flex; gap: 4px; margin-top: 5px;';
    const tiers = ['potato', 'low', 'medium', 'high', 'ultra'];
    for (const tier of tiers) {
      const btn = document.createElement('button');
      btn.textContent = tier.toUpperCase();
      btn.style.cssText = `
        flex: 1; padding: 4px 2px; font-size: 9px;
        background: ${getQualityTier() === tier ? 'rgba(212,165,116,0.3)' : 'rgba(255,255,255,0.05)'};
        border: 1px solid ${getQualityTier() === tier ? '#D4A574' : '#8B7355'};
        color: ${getQualityTier() === tier ? '#FFD700' : '#8B7355'};
        border-radius: 3px; cursor: pointer;
        font-family: 'Georgia', serif;
      `;
      btn.addEventListener('click', () => {
        setQualityTier(tier);
        document.getElementById('quality-value').textContent = tier.toUpperCase();
        qBtns.querySelectorAll('button').forEach(b => {
          b.style.background = 'rgba(255,255,255,0.05)';
          b.style.border = '1px solid #8B7355';
          b.style.color = '#8B7355';
        });
        btn.style.background = 'rgba(212,165,116,0.3)';
        btn.style.border = '1px solid #D4A574';
        btn.style.color = '#FFD700';
        this.events.emit('settings:qualityChanged', tier);
        this._savePref('qualityTier', tier);
      });
      qBtns.appendChild(btn);
    }
    qRow.appendChild(qBtns);
    frame.appendChild(qRow);

    this._addSection(frame, 'CONTROLS', groupStyle);

    const cRow = document.createElement('div');
    cRow.style.cssText = 'margin-bottom: 8px;';
    const cInfo = document.createElement('p');
    cInfo.innerHTML = 'WASD: Move &nbsp;|&nbsp; E: Interact &nbsp;|&nbsp; Q: Dodge<br>F: Block &nbsp;|&nbsp; Space: Jump &nbsp;|&nbsp; I: Inventory<br>Click: Attack &nbsp;|&nbsp; Esc: Pause';
    cInfo.style.cssText = 'color: #8B7355; font-size: 10px; line-height: 1.6; margin: 0;';
    cRow.appendChild(cInfo);
    frame.appendChild(cRow);

    this.element.appendChild(frame);
    this.container.appendChild(this.element);
  }

  _addSection(frame, title, groupStyle) {
    const section = document.createElement('div');
    section.style.cssText = groupStyle;
    const label = document.createElement('div');
    label.textContent = title;
    label.style.cssText = 'color: #8B7355; font-size: 11px; letter-spacing: 3px; margin-bottom: 8px; border-bottom: 1px solid rgba(139,115,85,0.3); padding-bottom: 3px;';
    section.appendChild(label);
    frame.appendChild(section);
  }

  _addSlider(frame, label, defaultValue, onChange, labelStyle, sliderStyle) {
    const row = document.createElement('div');
    row.style.cssText = 'margin-bottom: 10px;';

    const lbl = document.createElement('span');
    lbl.textContent = label;
    lbl.style.cssText = labelStyle;
    row.appendChild(lbl);

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = 0;
    slider.max = 1;
    slider.step = 0.05;
    slider.value = this._loadPref(label.toLowerCase().replace(' ', '_'), defaultValue);
    slider.style.cssText = sliderStyle;
    slider.addEventListener('input', () => {
      onChange(parseFloat(slider.value));
    });
    row.appendChild(slider);

    frame.appendChild(row);
  }

  _loadPref(key, defaultVal) {
    try {
      const raw = localStorage.getItem('hearth_and_harvest_settings');
      if (raw) {
        const prefs = JSON.parse(raw);
        return prefs[key] !== undefined ? prefs[key] : defaultVal;
      }
    } catch (e) {}
    return defaultVal;
  }

  _savePref(key, value) {
    try {
      const raw = localStorage.getItem('hearth_and_harvest_settings');
      const prefs = raw ? JSON.parse(raw) : {};
      prefs[key] = value;
      localStorage.setItem('hearth_and_harvest_settings', JSON.stringify(prefs));
    } catch (e) {}
  }

  show() {
    this.visible = true;
    this.element.style.display = 'flex';
  }

  hide() {
    this.visible = false;
    this.element.style.display = 'none';
    if (this.onClose) this.onClose();
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
