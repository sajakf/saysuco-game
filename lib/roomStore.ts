import { checkWinner, isBoardFull } from "./gameLogic";

export type CellMark = "p1" | "p2" | null;
export type RoomStatus = "waiting" | "playing" | "finished";

export interface GameRoom {
  id: string;
  p1Phone: string;
  p2Phone: string | null;
  board: CellMark[];
  turn: "p1" | "p2";
  status: RoomStatus;
  winner: "p1" | "p2" | "draw" | null;
  winningLine: number[];
  createdAt: number;
  updatedAt: number;
}

// ── Singleton store — survives hot-reload in Next.js dev ─────────────────────
const g = globalThis as typeof globalThis & { _sucoRooms?: Map<string, GameRoom> };
if (!g._sucoRooms) g._sucoRooms = new Map<string, GameRoom>();
const rooms = g._sucoRooms;

// Expire rooms older than 45 minutes
const ROOM_TTL = 45 * 60 * 1000;
function cleanup() {
  const now = Date.now();
  const expired: string[] = [];
  rooms.forEach((room, id) => { if (now - room.updatedAt > ROOM_TTL) expired.push(id); });
  expired.forEach((id) => rooms.delete(id));
}

function genId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function createRoom(p1Phone: string): GameRoom {
  cleanup();
  let id = genId();
  while (rooms.has(id)) id = genId(); // ensure unique
  const room: GameRoom = {
    id,
    p1Phone,
    p2Phone: null,
    board: Array(9).fill(null),
    turn: "p1",
    status: "waiting",
    winner: null,
    winningLine: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  rooms.set(id, room);
  return room;
}

export function getRoom(id: string): GameRoom | null {
  return rooms.get(id.toUpperCase()) ?? null;
}

export function joinRoom(id: string, p2Phone: string): GameRoom | { error: string } {
  const room = getRoom(id);
  if (!room) return { error: "Room not found. The link may have expired." };
  if (room.p2Phone) return { error: "This game already has two players." };
  if (room.p1Phone === p2Phone) return { error: "You can't join your own game!" };
  room.p2Phone = p2Phone;
  room.status = "playing";
  room.updatedAt = Date.now();
  return room;
}

export function makeMove(id: string, cellIndex: number, player: "p1" | "p2"): GameRoom | { error: string } {
  const room = getRoom(id);
  if (!room) return { error: "Room not found." };
  if (room.status !== "playing") return { error: "Game is not active." };
  if (room.turn !== player) return { error: "Not your turn." };
  if (room.board[cellIndex] !== null) return { error: "Cell already taken." };

  room.board[cellIndex] = player;
  room.updatedAt = Date.now();

  // Map to "player"/"ai" for the win-checker (p1="player", p2="ai")
  const mapped = room.board.map((c) => (c === "p1" ? "player" : c === "p2" ? "ai" : null));
  const winResult = checkWinner(mapped as any);

  if (winResult) {
    room.winner = player;
    room.winningLine = winResult.line;
    room.status = "finished";
  } else if (isBoardFull(mapped as any)) {
    room.winner = "draw";
    room.status = "finished";
  } else {
    room.turn = player === "p1" ? "p2" : "p1";
  }
  return room;
}

export function resetRoom(id: string): GameRoom | { error: string } {
  const room = getRoom(id);
  if (!room) return { error: "Room not found." };
  room.board = Array(9).fill(null);
  room.turn = "p1";
  room.status = "playing";
  room.winner = null;
  room.winningLine = [];
  room.updatedAt = Date.now();
  return room;
}
