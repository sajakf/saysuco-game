export interface PlayerData {
  phone: string;
  totalWins: number;
  weeklyWins: number;       // resets each new week
  currentWeek: string;      // e.g. "2026-W18"
  lastPromoWeek: string | null; // week the last promo was earned
  promoCode: string | null;
  joinedAt: string;
}

export interface WinnersLog {
  phone: string;
  wins: number;
  date: string;
}

const STORAGE_KEY = "saysuco_player_";
const WINNERS_KEY  = "saysuco_winners";
const WINS_THRESHOLD = 10; // weekly wins needed for a promo

// ── Week helper ──────────────────────────────────────────────────────────────
export function getCurrentWeek(): string {
  const now  = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(
    ((now.getTime() - jan1.getTime()) / 86_400_000 + jan1.getDay() + 1) / 7
  );
  return `${now.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

// ── CRUD helpers ─────────────────────────────────────────────────────────────
export function getPlayerData(phone: string): PlayerData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY + phone);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
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
    weeklyWins: 0,
    currentWeek: getCurrentWeek(),
    lastPromoWeek: null,
    promoCode: null,
    joinedAt: new Date().toISOString(),
  };
  savePlayerData(data);
  return data;
}

// ── Weekly reset helper ───────────────────────────────────────────────────────
function refreshWeek(data: PlayerData): PlayerData {
  const thisWeek = getCurrentWeek();
  if (data.currentWeek !== thisWeek) {
    data.weeklyWins  = 0;
    data.currentWeek = thisWeek;
  }
  return data;
}

// ── Record a game result ──────────────────────────────────────────────────────
export function recordGameResult(
  phone: string,
  result: "win" | "lose" | "draw"
): { promoJustUnlocked: boolean; promoCode: string | null; totalWins: number; weeklyWins: number } {
  let data = getPlayerData(phone) ?? createPlayer(phone);
  data = refreshWeek(data);

  if (result === "win") {
    data.totalWins  += 1;
    data.weeklyWins += 1;
  }

  // Award promo once per week when weekly threshold is hit
  const thisWeek    = getCurrentWeek();
  const alreadyGot  = data.lastPromoWeek === thisWeek;
  let promoJustUnlocked = false;

  if (data.weeklyWins >= WINS_THRESHOLD && !alreadyGot) {
    data.lastPromoWeek = thisWeek;
    data.promoCode     = generatePromoCode(phone, thisWeek);
    promoJustUnlocked  = true;
    logWinner(phone, data.totalWins);
  }

  savePlayerData(data);
  return {
    promoJustUnlocked,
    promoCode: data.promoCode,
    totalWins: data.totalWins,
    weeklyWins: data.weeklyWins,
  };
}

// ── Promo status for current week ────────────────────────────────────────────
export function getWeeklyPromoStatus(phone: string): {
  weeklyWins: number;
  promoEarnedThisWeek: boolean;
  promoCode: string | null;
} {
  const raw  = getPlayerData(phone);
  if (!raw) return { weeklyWins: 0, promoEarnedThisWeek: false, promoCode: null };
  const data = refreshWeek({ ...raw });
  return {
    weeklyWins:          data.weeklyWins,
    promoEarnedThisWeek: data.lastPromoWeek === getCurrentWeek(),
    promoCode:           data.promoCode,
  };
}

// ── Internals ─────────────────────────────────────────────────────────────────
function generatePromoCode(phone: string, week: string): string {
  const suffix = phone.slice(-4);
  const rand   = Math.random().toString(36).substring(2, 6).toUpperCase();
  const weekTag = week.replace("-", "").replace("W", "W");
  return `SUCO-${suffix}-${weekTag}-${rand}`;
}

function logWinner(phone: string, wins: number): void {
  try {
    const raw     = localStorage.getItem(WINNERS_KEY);
    const winners: WinnersLog[] = raw ? JSON.parse(raw) : [];
    const existing = winners.find((w) => w.phone === phone);
    if (existing) { existing.wins = wins; existing.date = new Date().toISOString(); }
    else winners.push({ phone, wins, date: new Date().toISOString() });
    localStorage.setItem(WINNERS_KEY, JSON.stringify(winners));
  } catch {}
}

export function getAllWinners(): WinnersLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WINNERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export const WINS_TO_PROMO = WINS_THRESHOLD;
