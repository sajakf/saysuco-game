export interface PlayerData {
  phone: string;
  totalWins: number;
  lastPlayDate: string | null;
  lastResult: "win" | "lose" | "draw" | null;
  promoCode: string | null;
  promoUnlocked: boolean;
  joinedAt: string;
}

export interface WinnersLog {
  phone: string;
  wins: number;
  date: string;
}

const STORAGE_KEY = "saysuco_player_";
const WINNERS_KEY = "saysuco_winners";
const WINS_THRESHOLD = 10;

export function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

export function getPlayerData(phone: string): PlayerData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY + phone);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function savePlayerData(data: PlayerData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY + data.phone, JSON.stringify(data));
}

export function createPlayer(phone: string): PlayerData {
  const existing = getPlayerData(phone);
  if (existing) return existing;
  const data: PlayerData = {
    phone,
    totalWins: 0,
    lastPlayDate: null,
    lastResult: null,
    promoCode: null,
    promoUnlocked: false,
    joinedAt: new Date().toISOString(),
  };
  savePlayerData(data);
  return data;
}

export function canPlayToday(phone: string): { canPlay: boolean; reason?: string } {
  const data = getPlayerData(phone);
  if (!data) return { canPlay: true };
  const today = getToday();

  if (data.lastPlayDate === today && data.lastResult === "lose") {
    return {
      canPlay: false,
      reason: "You already lost today. Come back tomorrow for another chance!",
    };
  }
  return { canPlay: true };
}

export function recordGameResult(
  phone: string,
  result: "win" | "lose" | "draw"
): { promoUnlocked: boolean; promoCode: string | null; totalWins: number } {
  const data = getPlayerData(phone) ?? createPlayer(phone);
  const today = getToday();

  if (result === "win") {
    data.totalWins += 1;
  }

  data.lastPlayDate = today;
  data.lastResult = result;

  if (data.totalWins >= WINS_THRESHOLD && !data.promoUnlocked) {
    data.promoUnlocked = true;
    data.promoCode = generatePromoCode(phone);
    logWinner(phone, data.totalWins);
  }

  savePlayerData(data);
  return {
    promoUnlocked: data.promoUnlocked,
    promoCode: data.promoCode,
    totalWins: data.totalWins,
  };
}

function generatePromoCode(phone: string): string {
  const suffix = phone.slice(-4);
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SUCO-${suffix}-${rand}`;
}

function logWinner(phone: string, wins: number): void {
  try {
    const raw = localStorage.getItem(WINNERS_KEY);
    const winners: WinnersLog[] = raw ? JSON.parse(raw) : [];
    const existing = winners.find((w) => w.phone === phone);
    if (existing) {
      existing.wins = wins;
      existing.date = new Date().toISOString();
    } else {
      winners.push({ phone, wins, date: new Date().toISOString() });
    }
    localStorage.setItem(WINNERS_KEY, JSON.stringify(winners));
  } catch {}
}

export function getAllWinners(): WinnersLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WINNERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export const WINS_TO_PROMO = WINS_THRESHOLD;
