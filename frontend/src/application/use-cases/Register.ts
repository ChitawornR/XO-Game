import type { AuthApi, AuthUser, RegisterPayload } from '../ports/AuthApi'

export async function register(api: AuthApi, payload: RegisterPayload): Promise<AuthUser> {
  return api.register(payload)
}
