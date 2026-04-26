/**
 * Typed access to Vite environment variables.
 * Falls back to localhost:8081 so the app works without a .env file in development.
 */
export const env = {
  apiUrl: (import.meta.env['VITE_API_URL'] as string | undefined) ?? 'http://localhost:8081',
} as const
