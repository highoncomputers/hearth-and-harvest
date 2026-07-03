import { getItemDef } from '../systems/Inventory.js';

export class DialogueUI {
  constructor(container, events) {
    this.container = container;
    this.events = events;
    this.element = null;
    this.textEl = null;
    this.choicesEl = null;
    this.nameEl = null;
    this.portraitEl = null;
    this.visible = false;
    this.currentNPC = null;
    this._resolve = null;
    this._typingTimer = null;
    this._fullText = '';
  }

  init() {
    this.element = document.createElement('div');
    this.element.style.cssText = `
      position: fixed; bottom: 15%; left: 50%; transform: translateX(-50%);
      width: min(400px, 85vw); min-height: 140px;
      background: rgba(8,8,8,0.92); border: 1px solid #8B7355;
      border-radius: 8px; padding: 14px; z-index: 5000;
      font-family: Georgia, serif; display: none;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    `;

    const topBar = document.createElement('div');
    topBar.style.cssText = 'display: flex; align-items: center; gap: 10px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #443322;';

    this.portraitEl = document.createElement('div');
    this.portraitEl.style.cssText = `
      width: 36px; height: 36px; border-radius: 50%;
      background: #8B7355; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; color: #D4A574;
    `;
    this.portraitEl.textContent = '\u{1F9D1}';
    topBar.appendChild(this.portraitEl);

    this.nameEl = document.createElement('div');
    this.nameEl.style.cssText = 'font-size: 15px; font-weight: bold; color: #D4A574;';
    topBar.appendChild(this.nameEl);
    this.element.appendChild(topBar);

    this.textEl = document.createElement('div');
    this.textEl.style.cssText = 'color: #C4A574; font-size: 14px; line-height: 1.5; min-height: 40px; padding: 4px 0;';
    this.element.appendChild(this.textEl);

    this.choicesEl = document.createElement('div');
    this.choicesEl.style.cssText = 'display: flex; flex-direction: column; gap: 5px; margin-top: 10px;';
    this.element.appendChild(this.choicesEl);

    this.container.appendChild(this.element);
  }

  show(npc, text, choices) {
    this.currentNPC = npc;
    this.nameEl.textContent = `${npc.name} ${npc.title || ''}`;
    this._fullText = text;
    this.textEl.textContent = '';
    this.choicesEl.innerHTML = '';
    this.visible = true;
    this.element.style.display = 'block';

    let idx = 0;
    if (this._typingTimer) clearInterval(this._typingTimer);
    this._typingTimer = setInterval(() => {
      if (idx < this._fullText.length) {
        this.textEl.textContent += this._fullText[idx];
        idx++;
      } else {
        clearInterval(this._typingTimer);
        this._typingTimer = null;
        this._renderChoices(choices);
      }
    }, 25);
  }

  _renderChoices(choices) {
    this.choicesEl.innerHTML = '';
    if (!choices || choices.length === 0) return;
    for (const choice of choices) {
      const btn = document.createElement('div');
      btn.textContent = choice.label;
      btn.style.cssText = `
        padding: 6px 10px; border: 1px solid #554433; border-radius: 4px;
        cursor: pointer; font-size: 13px; color: #C4A574;
        background: rgba(139,115,85,0.1); transition: background 0.15s;
      `;
      btn.onmouseenter = () => { btn.style.background = 'rgba(139,115,85,0.3)'; };
      btn.onmouseleave = () => { btn.style.background = 'rgba(139,115,85,0.1)'; };
      btn.onclick = () => {
        if (this._typingTimer) { clearInterval(this._typingTimer); this._typingTimer = null; this.textEl.textContent = this._fullText; }
        choice.action();
      };
      this.choicesEl.appendChild(btn);
    }
  }

  hide() {
    this.visible = false;
    this.element.style.display = 'none';
    if (this._typingTimer) { clearInterval(this._typingTimer); this._typingTimer = null; }
    this.currentNPC = null;
    this._fullText = '';
  }

  isVisible() { return this.visible; }

  dispose() {
    if (this._typingTimer) clearInterval(this._typingTimer);
    if (this.element && this.element.parentNode) this.element.parentNode.removeChild(this.element);
  }
}
