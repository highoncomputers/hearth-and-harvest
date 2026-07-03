export class EventSystem {
  constructor() {
    this.listeners = new Map();
    this.onceListeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return () => this.off(event, callback);
  }

  once(event, callback) {
    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, []);
    }
    this.onceListeners.get(event).push(callback);
    return () => {
      const list = this.onceListeners.get(event);
      if (list) {
        const idx = list.indexOf(callback);
        if (idx !== -1) list.splice(idx, 1);
      }
    };
  }

  off(event, callback) {
    const list = this.listeners.get(event);
    if (list) {
      const idx = list.indexOf(callback);
      if (idx !== -1) list.splice(idx, 1);
    }
    const onceList = this.onceListeners.get(event);
    if (onceList) {
      const idx = onceList.indexOf(callback);
      if (idx !== -1) onceList.splice(idx, 1);
    }
  }

  emit(event, data) {
    const list = this.listeners.get(event);
    if (list) {
      for (const cb of list) {
        cb(data);
      }
    }
    const onceList = this.onceListeners.get(event);
    if (onceList) {
      const copy = [...onceList];
      this.onceListeners.set(event, []);
      for (const cb of copy) {
        cb(data);
      }
    }
  }

  clear() {
    this.listeners.clear();
    this.onceListeners.clear();
  }
}
