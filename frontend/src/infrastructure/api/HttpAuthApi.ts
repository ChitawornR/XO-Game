import type { AuthApi, AuthUser, LoginPayload, RegisterPayload } from '../../application/ports/AuthApi'

const TOKEN_KEY = 'xo_token'

export class HttpAuthApi implements AuthApi {
  constructor(private readonly baseUrl: string) {}

  async register(payload: RegisterPayload): Promise<AuthUser> {
    const res = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const body = (await res.json()) as { error?: string }
      throw new Error(body.error ?? `Registration failed: HTTP ${res.status}`)
    }
    return res.json() as Promise<AuthUser>
  }

  async login(payload: LoginPayload): Promise<string> {
    const res = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const body = (await res.json()) as { error?: string }
      throw new Error(body.error ?? `Login failed: HTTP ${res.status}`)
    }
    const { token } = (await res.json()) as { token: string }
    localStorage.setItem(TOKEN_KEY, token)
    return token
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY)
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  }
}
