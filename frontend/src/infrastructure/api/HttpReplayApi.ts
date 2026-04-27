import type { ReplayApi, ReplayRecord, CreateReplayPayload } from '../../application/ports/ReplayApi'

export class HttpReplayApi implements ReplayApi {
  constructor(
    private readonly baseUrl: string,
    private readonly getToken: () => string | null,
  ) {}

  private authHeaders(): HeadersInit {
    const token = this.getToken()
    return token
      ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      : { 'Content-Type': 'application/json' }
  }

  async save(payload: CreateReplayPayload): Promise<void> {
    const res = await fetch(`${this.baseUrl}/replay`, {
      method: 'POST',
      headers: this.authHeaders(),
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(`Failed to save replay: HTTP ${res.status}`)
  }

  async list(): Promise<ReplayRecord[]> {
    const res = await fetch(`${this.baseUrl}/replay`, { headers: this.authHeaders() })
    if (!res.ok) throw new Error(`Failed to list replays: HTTP ${res.status}`)
    return res.json() as Promise<ReplayRecord[]>
  }

  async getById(id: string): Promise<ReplayRecord> {
    const res = await fetch(`${this.baseUrl}/replay/${id}`, { headers: this.authHeaders() })
    if (!res.ok) throw new Error(`Failed to get replay: HTTP ${res.status}`)
    return res.json() as Promise<ReplayRecord>
  }

  async delete(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/replay/${id}`, {
      method: 'DELETE',
      headers: this.authHeaders(),
    })
    if (!res.ok) throw new Error(`Failed to delete replay: HTTP ${res.status}`)
  }
}
