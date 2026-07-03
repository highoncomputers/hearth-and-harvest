export class ObjectPool {
  constructor(factory, reset, initialSize = 0) {
    this.factory = factory;
    this.reset = reset;
    this.pool = [];
    this.active = new Set();
    if (initialSize > 0) {
      for (let i = 0; i < initialSize; i++) {
        this.pool.push(factory());
      }
    }
  }

  acquire() {
    let obj;
    if (this.pool.length > 0) {
      obj = this.pool.pop();
    } else {
      obj = this.factory();
    }
    this.active.add(obj);
    return obj;
  }

  release(obj) {
    if (this.active.has(obj)) {
      this.active.delete(obj);
      this.reset(obj);
      this.pool.push(obj);
    }
  }

  releaseAll() {
    for (const obj of this.active) {
      this.reset(obj);
      this.pool.push(obj);
    }
    this.active.clear();
  }

  get activeCount() {
    return this.active.size;
  }

  get poolSize() {
    return this.pool.length;
  }

  dispose() {
    this.pool.length = 0;
    this.active.clear();
  }
}
