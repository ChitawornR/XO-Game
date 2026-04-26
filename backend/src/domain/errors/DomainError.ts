export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
    // Restore prototype chain (needed when targeting ES5/CommonJS)
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
