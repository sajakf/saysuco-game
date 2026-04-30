import { NextResponse } from "next/server";
import type { TriviaQuestion } from "@/lib/trivia";

// ── Token cache (server memory, reused across requests) ───────────────────────
const g = globalThis as typeof globalThis & {
  _spotifyToken?: { value: string; expiresAt: number };
};

async function getToken(): Promise<string> {
  const now = Date.now();
  if (g._spotifyToken && g._spotifyToken.expiresAt > now + 60_000) {
    return g._spotifyToken.value;
  }
  const clientId     = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret ||
      clientId === "your_client_id_here" ||
      clientSecret === "your_client_secret_here") {
    throw new Error("Spotify credentials not configured");
  }
  const creds = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization:  `Basic ${creds}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Spotify token ${res.status}`);
  const data = await res.json();
  g._spotifyToken = { value: data.access_token, expiresAt: now + data.expires_in * 1000 };
  return data.access_token;
}

// ── Spotify search ────────────────────────────────────────────────────────────
interface SpotifyTrack {
  id:      string;
  name:    string;
  artists: { name: string }[];
  album:   { name: string };
  popularity: number;
}

// Rotate through search queries so pool stays fresh each fetch
const SEARCH_QUERIES = [
  "year:2023-2024 genre:pop",
  "year:2022-2024 genre:hip-hop",
  "year:2021-2024 genre:pop",
  "year:2020-2024 genre:r-n-b",
  "year:2024 tag:new",
  "year:2022-2024 genre:latin",
];
let searchIdx = 0;

async function fetchTracks(token: string): Promise<SpotifyTrack[]> {
  const q   = SEARCH_QUERIES[searchIdx++ % SEARCH_QUERIES.length];
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=50&market=US`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Spotify search ${res.status}`);
  const data = await res.json();
  // Keep only reasonably popular tracks so questions are recognisable
  return (data.tracks?.items as SpotifyTrack[])
    .filter((t) => t.popularity >= 40)
    .sort((a, b) => b.popularity - a.popularity);
}

// ── Question generation ───────────────────────────────────────────────────────
let idCounter = 3000; // Spotify questions get IDs ≥ 3000

function buildQuestions(tracks: SpotifyTrack[]): TriviaQuestion[] {
  const artistPool = Array.from(new Set(tracks.map((t) => t.artists[0].name)));
  if (artistPool.length < 4) return [];

  const questions: TriviaQuestion[] = [];
  const usedTracks = new Set<string>();

  for (const track of tracks) {
    if (questions.length >= 20) break;
    // Skip live/remix/karaoke versions — they're confusing
    if (/live|remix|karaoke|instrumental|version/i.test(track.name)) continue;
    if (usedTracks.has(track.name.toLowerCase())) continue;
    usedTracks.add(track.name.toLowerCase());

    const correctArtist = track.artists[0].name;
    const wrongs = artistPool
      .filter((a) => a !== correctArtist)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    if (wrongs.length < 3) continue;

    const allOptions = [correctArtist, ...wrongs].sort(() => Math.random() - 0.5);

    // Alternate between two question styles for variety
    const style = questions.length % 2 === 0 ? "artist" : "song";

    if (style === "artist") {
      // "Which artist performs '[song]'?"
      questions.push({
        id: idCounter++,
        question: `Which artist performs "${track.name}"?`,
        options: allOptions,
        correctIndex: allOptions.indexOf(correctArtist),
        explanation: `🎵 "${track.name}" is by ${correctArtist}!`,
        emoji: "🎵",
        category: "Music",
        difficulty: "easy",
        source: "spotify",
      });
    } else {
      // "Which of these songs is by [artist]?" — pick one real track + 3 decoys
      const decoyTracks = tracks
        .filter((t) => t.artists[0].name !== correctArtist && !usedTracks.has(t.name.toLowerCase()))
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((t) => t.name);
      if (decoyTracks.length < 3) {
        // Fall back to artist-style question
        questions.push({
          id: idCounter++,
          question: `Which artist performs "${track.name}"?`,
          options: allOptions,
          correctIndex: allOptions.indexOf(correctArtist),
          explanation: `🎵 "${track.name}" is by ${correctArtist}!`,
          emoji: "🎤",
          category: "Music",
          difficulty: "easy",
          source: "spotify",
        });
        continue;
      }
      const songOptions = [track.name, ...decoyTracks].sort(() => Math.random() - 0.5);
      questions.push({
        id: idCounter++,
        question: `Which of these songs is by ${correctArtist}?`,
        options: songOptions,
        correctIndex: songOptions.indexOf(track.name),
        explanation: `🎤 "${track.name}" is indeed by ${correctArtist}!`,
        emoji: "🎤",
        category: "Music",
        difficulty: "medium",
        source: "spotify",
      });
    }
  }

  return questions;
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const token     = await getToken();
    const tracks    = await fetchTracks(token);
    const questions = buildQuestions(tracks);
    return NextResponse.json({ questions, count: questions.length });
  } catch (err) {
    // Return empty rather than 500 — trivia falls back to OpenTDB gracefully
    return NextResponse.json({ questions: [], error: String(err) });
  }
}
