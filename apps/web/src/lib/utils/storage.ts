const PREFIX = "mndr.";

type StorageLike = {
  clearAllWithPrefix(): void;
  get<T = string>(key: string): null | T;
  remove(key: string): void;
  set<T>(key: string, value: T): void;
};

type StorageType = "local" | "session";

function createStorage(type: StorageType = "local"): StorageLike {
  const getBackend = (): null | Storage => {
    if (typeof window === "undefined") return null; // SSR / Node

    try {
      return type === "local" ? window.localStorage : window.sessionStorage;
    } catch {
      // In case of browser privacy modes / errors
      return null;
    }
  };

  return {
    clearAllWithPrefix() {
      const backend = getBackend();
      if (!backend) return;

      for (let i = backend.length - 1; i >= 0; i--) {
        const key = backend.key(i);
        if (key && key.startsWith(PREFIX)) {
          backend.removeItem(key);
        }
      }
    },

    get<T = string>(key: string): null | T {
      const backend = getBackend();
      if (!backend) return null;

      const item = backend.getItem(PREFIX + key);
      if (item === null) return null;

      try {
        return JSON.parse(item);
      } catch {
        return item as T;
      }
    },

    remove(key: string) {
      const backend = getBackend();
      if (!backend) return;

      backend.removeItem(PREFIX + key);
    },

    set<T>(key: string, value: T) {
      const backend = getBackend();
      if (!backend) return;

      const data = typeof value === "string" ? value : JSON.stringify(value);
      backend.setItem(PREFIX + key, data);
    },
  };
}

export const localStore = createStorage("local");
export const sessionStore = createStorage("session");
