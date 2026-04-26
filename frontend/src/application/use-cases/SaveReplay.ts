import type { ReplayApi, CreateReplayPayload } from '../ports/ReplayApi'

/**
 * Use-case: persist a completed game replay via the ReplayApi port.
 * Application layer — does not know about fetch or MongoDB.
 */
export async function saveReplay(
  api: ReplayApi,
  payload: CreateReplayPayload,
): Promise<void> {
  await api.save(payload)
}
