export type RegisterPayload = {
  username: string
  email: string
  password: string
}

export type LoginPayload = {
  email: string
  password: string
}

export type AuthUser = {
  id: string
  username: string
  email: string
}

export interface AuthApi {
  register(payload: RegisterPayload): Promise<AuthUser>
  login(payload: LoginPayload): Promise<string> // returns JWT
  logout(): void
  getToken(): string | null
}
