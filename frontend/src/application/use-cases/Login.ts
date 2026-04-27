import type { AuthApi, LoginPayload } from '../ports/AuthApi'

export async function login(api: AuthApi, payload: LoginPayload): Promise<string> {
  return api.login(payload)
}
