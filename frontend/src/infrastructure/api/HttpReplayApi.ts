import type { ReplayApi, ReplayRecord, CreateReplayPayload } from '../../application/ports/ReplayApi'

/**
 * Concrete implementation of ReplayApi that talks to the Express backend via fetch.
 * The base URL is injected at construction time (from env.ts or a test stub).
 */
export class HttpReplayApi implements ReplayApi {
  constructor(private readonly baseUrl: string) {}

  async save(payload: CreateReplayPayload): Promise<void> {
    const res = await fetch(`${this.baseUrl}/replay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(`Failed to save replay: HTTP ${res.status}`)
  }

  async list(): Promise<ReplayRecord[]> {
    const res = await fetch(`${this.baseUrl}/replay`)
    if (!res.ok) throw new Error(`Failed to list replays: HTTP ${res.status}`)
    return res.json() as Promise<ReplayRecord[]>
  }

  async getById(id: string): Promise<ReplayRecord> {
    const res = await fetch(`${this.baseUrl}/replay/${id}`)
    if (!res.ok) throw new Error(`Failed to get replay: HTTP ${res.status}`)
    return res.json() as Promise<ReplayRecord>
  }

  async delete(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/replay/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`Failed to delete replay: HTTP ${res.status}`)
  }
}
