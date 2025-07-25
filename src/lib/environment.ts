export class Environment {
  static get current() {
    return process.env.NODE_ENV || "development";
  }

  static get isDevelopment() {
    return this.current === "development";
  }

  static get isProduction() {
    return this.current === "production";
  }
}
