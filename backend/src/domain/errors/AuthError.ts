import { DomainError } from './DomainError';

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('Invalid email or password.');
    this.name = 'InvalidCredentialsError';
  }
}

export class UserAlreadyExistsError extends DomainError {
  constructor() {
    super('A user with this email already exists.');
    this.name = 'UserAlreadyExistsError';
  }
}
