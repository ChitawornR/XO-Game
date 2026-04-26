/**
 * Returns the winning streak length for a given board size.
 * 3x3 boards need 3 in a row; anything larger needs 4.
 */
export function streakFor(size: number): number {
  return size === 3 ? 3 : 4
}
