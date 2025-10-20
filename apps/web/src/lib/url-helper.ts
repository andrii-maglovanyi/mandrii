import { envName } from "./config/env";

export class UrlHelper {
  static config = {
    development: { hostname: "localhost:3000", scheme: "http" },
    preview: { hostname: "mandrii.vercel.app", scheme: "https" },
    production: { hostname: "mandrii.com", scheme: "https" },
    test: { hostname: "localhost:3000", scheme: "http" },
  };

  static buildApiUrl(path = "") {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const apiPath = `/api${cleanPath}`;
    return this.buildUrl(apiPath);
  }

  static buildUrl(path = "") {
    try {
      const normalizedPath = path.startsWith("/") ? path : `/${path}`;
      const url = new URL(normalizedPath, this.getBaseUrl());
      return url.toString();
    } catch (error: unknown) {
      console.error("Invalid URL construction:", {
        baseUrl: this.getBaseUrl(),
        error: error instanceof Error ? error.message : String(error),
        path,
      });
      return this.getBaseUrl();
    }
  }

  static getBaseUrl(envNameOverride?: keyof typeof this.config) {
    const { hostname, scheme } = this.getConfig(envNameOverride);
    return `${scheme}://${hostname}`;
  }

  static getConfig(envNameOverride?: keyof typeof this.config) {
    return this.config[envNameOverride ?? envName];
  }

  static getHostname() {
    return process.env.HOSTNAME || this.getConfig().hostname;
  }

  static getProductionHostname() {
    return this.config.production.hostname;
  }

  static isValidUrl(urlString: string) {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  }

  static isAbsoluteUrl(urlString: string) {
    try {
      const url = new URL(urlString);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }
}
