export type Cell = "player" | "ai" | null;
export type Board = Cell[];

export const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],             // diagonals
];

export function checkWinner(board: Board): { winner: Cell; line: number[] } | null {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return null;
}

export function isBoardFull(board: Board): boolean {
  return board.every((cell) => cell !== null);
}

export function getAvailableMoves(board: Board): number[] {
  return board.reduce<number[]>((acc, cell, i) => {
    if (cell === null) acc.push(i);
    return acc;
  }, []);
}

function minimax(board: Board, isMaximizing: boolean, depth: number): number {
  const result = checkWinner(board);
  if (result?.winner === "ai") return 10 - depth;
  if (result?.winner === "player") return depth - 10;
  if (isBoardFull(board)) return 0;

  const moves = getAvailableMoves(board);

  if (isMaximizing) {
    let best = -Infinity;
    for (const move of moves) {
      board[move] = "ai";
      best = Math.max(best, minimax(board, false, depth + 1));
      board[move] = null;
    }
    return best;
  } else {
    let best = Infinity;
    for (const move of moves) {
      board[move] = "player";
      best = Math.min(best, minimax(board, true, depth + 1));
      board[move] = null;
    }
    return best;
  }
}

export function getBestMove(board: Board, difficulty: "easy" | "medium" | "hard" = "medium"): number {
  const moves = getAvailableMoves(board);
  if (moves.length === 0) return -1;

  // Difficulty: random chance to make a suboptimal move
  const randomChance = difficulty === "easy" ? 0.65 : difficulty === "medium" ? 0.35 : 0;
  if (Math.random() < randomChance) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  let bestScore = -Infinity;
  let bestMove = moves[0];

  for (const move of moves) {
    board[move] = "ai";
    const score = minimax(board, false, 0);
    board[move] = null;
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  return bestMove;
}

export function createEmptyBoard(): Board {
  return Array(9).fill(null);
}
