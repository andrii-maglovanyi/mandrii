const PREFIX = "mndr.";

export const storage = {
  clearAllWithPrefix() {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  },

  get<T = string>(key: string): null | T {
    const item = localStorage.getItem(PREFIX + key);
    if (item === null) return null;

    try {
      return JSON.parse(item);
    } catch {
      return item as T;
    }
  },

  remove(key: string) {
    localStorage.removeItem(PREFIX + key);
  },

  set<T>(key: string, value: T) {
    const data = typeof value === "string" ? value : JSON.stringify(value);
    localStorage.setItem(PREFIX + key, data);
  },
};
