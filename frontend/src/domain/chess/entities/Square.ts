/**
 * Board coordinate convention:
 *   row 0 = rank 8 (black's back rank, top of the board when viewing from white's side)
 *   row 7 = rank 1 (white's back rank, bottom of the board)
 *   col 0 = file a (left)
 *   col 7 = file h (right)
 *
 * This matches the typical screen-rendering order (top-to-bottom).
 */

export type Square = {
  row: number
  col: number
}

/** Returns true when the two squares refer to the same cell. */
export function squareEquals(a: Square, b: Square): boolean {
  return a.row === b.row && a.col === b.col
}

/** Returns true when the square is within the 8×8 board. */
export function inBounds(sq: Square): boolean {
  return sq.row >= 0 && sq.row <= 7 && sq.col >= 0 && sq.col <= 7
}

/** Convert a column index (0–7) to a file letter ('a'–'h'). */
export function colToFile(col: number): string {
  return String.fromCharCode('a'.charCodeAt(0) + col)
}

/** Convert a row index (0–7) to a rank number string ('8'–'1'). */
export function rowToRank(row: number): string {
  return String(8 - row)
}

/** Algebraic notation for a square (e.g. "e4"). */
export function squareToAlgebraic(sq: Square): string {
  return `${colToFile(sq.col)}${rowToRank(sq.row)}`
}
