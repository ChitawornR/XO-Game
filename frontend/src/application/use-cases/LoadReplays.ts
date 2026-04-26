import type { ReplayApi, ReplayRecord } from '../ports/ReplayApi'

/**
 * LoadReplays — fetches the list of replays through the ReplayApi port.
 *
 * Wrapping the call in a use case keeps the presentation layer free of
 * any direct knowledge of the API contract beyond the domain port.
 */
export async function loadReplays(api: ReplayApi): Promise<ReplayRecord[]> {
  return api.list()
}

/**
 * LoadReplayById — fetches a single replay by its id.
 */
export async function loadReplayById(
  api: ReplayApi,
  id: string,
): Promise<ReplayRecord> {
  return api.getById(id)
}
