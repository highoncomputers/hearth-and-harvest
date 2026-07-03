export class SaveManager {
  constructor() {
    this.prefix = 'hearth_and_harvest_';
    this.currentSlot = 0;
    this.autoSaveInterval = null;
    this.AUTO_SAVE_MS = 60000;
  }

  save(slot, data) {
    try {
      const key = this.prefix + 'save_' + slot;
      const payload = JSON.stringify({
        version: 1,
        timestamp: Date.now(),
        data: data,
      });
      localStorage.setItem(key, payload);
      return true;
    } catch (e) {
      console.warn('Save failed:', e);
      return false;
    }
  }

  load(slot) {
    try {
      const key = this.prefix + 'save_' + slot;
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const payload = JSON.parse(raw);
      return payload.data;
    } catch (e) {
      console.warn('Load failed:', e);
      return null;
    }
  }

  deleteSlot(slot) {
    const key = this.prefix + 'save_' + slot;
    localStorage.removeItem(key);
  }

  getSlotInfo(slot) {
    try {
      const key = this.prefix + 'save_' + slot;
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const payload = JSON.parse(raw);
      return {
        version: payload.version,
        timestamp: payload.timestamp,
        date: new Date(payload.timestamp).toLocaleString(),
      };
    } catch (e) {
      return null;
    }
  }

  listSlots() {
    const slots = [];
    for (let i = 0; i < 10; i++) {
      const info = this.getSlotInfo(i);
      if (info) slots.push({ slot: i, ...info });
    }
    return slots;
  }

  saveSettings(settings) {
    try {
      const key = this.prefix + 'settings';
      localStorage.setItem(key, JSON.stringify(settings));
      return true;
    } catch (e) {
      return false;
    }
  }

  loadSettings() {
    try {
      const key = this.prefix + 'settings';
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  exportSave(slot) {
    const data = this.load(slot);
    if (!data) return null;
    try {
      const blob = JSON.stringify({ slot, data, exported: Date.now() });
      return btoa(blob);
    } catch (e) {
      return null;
    }
  }

  importSave(encoded) {
    try {
      const blob = atob(encoded);
      const payload = JSON.parse(blob);
      if (payload && payload.slot !== undefined && payload.data) {
        this.save(payload.slot, payload.data);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  startAutoSave(getDataFn) {
    this.stopAutoSave();
    this.autoSaveInterval = setInterval(() => {
      const data = getDataFn();
      if (data) {
        this.save('autosave', data);
      }
    }, this.AUTO_SAVE_MS);
  }

  stopAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  dispose() {
    this.stopAutoSave();
  }
}
