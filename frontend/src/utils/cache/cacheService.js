class CacheService {
  constructor() {
    this.cache = new Map();
    this.expirations = new Map();
  }

  set(key, value, duration = 5 * 60 * 1000) {
    if (this.expirations.has(key)) {
      clearTimeout(this.expirations.get(key));
    }
    this.cache.set(key, value);
    const timeout = setTimeout(() => this.remove(key), duration);
    this.expirations.set(key, timeout);
  }

  get(key) {
    return this.cache.get(key) || null;
  }

  has(key) {
    return this.cache.has(key);
  }

  remove(key) {
    this.cache.delete(key);
    if (this.expirations.has(key)) {
      clearTimeout(this.expirations.get(key));
      this.expirations.delete(key);
    }
  }

  clear() {
    for (const timeout of this.expirations.values()) {
      clearTimeout(timeout);
    }
    this.cache.clear();
    this.expirations.clear();
  }

  size() {
    return this.cache.size;
  }

  keys() {
    return Array.from(this.cache.keys());
  }
}

export default new CacheService();
