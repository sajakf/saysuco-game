export interface TriviaQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  emoji: string;
  category?: string;
  difficulty?: string;
  source: "api" | "local";
}

// ─── Category → emoji map ────────────────────────────────────────────────────
const CATEGORY_EMOJI: Record<string, string> = {
  "General Knowledge":              "💡",
  "Entertainment: Books":           "📚",
  "Entertainment: Film":            "🎬",
  "Entertainment: Music":           "🎵",
  "Entertainment: Musicals & Theatres": "🎭",
  "Entertainment: Television":      "📺",
  "Entertainment: Video Games":     "🎮",
  "Entertainment: Board Games":     "🎲",
  "Entertainment: Comics":          "💬",
  "Entertainment: Cartoon & Animations": "🎨",
  "Entertainment: Japanese Anime & Manga": "⛩️",
  "Science & Nature":               "🌿",
  "Science: Computers":             "💻",
  "Science: Mathematics":           "🔢",
  "Science: Gadgets":               "🔧",
  "Mythology":                      "🏛️",
  "Sports":                         "⚽",
  "Geography":                      "🌍",
  "History":                        "📜",
  "Politics":                       "🗳️",
  "Art":                            "🎨",
  "Celebrities":                    "⭐",
  "Animals":                        "🐾",
  "Vehicles":                       "🚗",
};

function categoryToEmoji(cat: string): string {
  return CATEGORY_EMOJI[cat] ?? "❓";
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function decode(str: string): string {
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Open Trivia DB API ───────────────────────────────────────────────────────
interface OTDBResult {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

interface OTDBResponse {
  response_code: number;
  results: OTDBResult[];
}

let idCounter = 1000; // API questions get IDs ≥ 1000

export async function fetchTriviaFromAPI(amount = 10): Promise<TriviaQuestion[]> {
  const url = `https://opentdb.com/api.php?amount=${amount}&type=multiple&encode=url3986`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`OTDB HTTP ${res.status}`);

  const data: OTDBResponse = await res.json();
  if (data.response_code !== 0) throw new Error(`OTDB response_code ${data.response_code}`);

  return data.results.map((r): TriviaQuestion => {
    const correct  = decode(r.correct_answer);
    const wrongs   = r.incorrect_answers.map(decode);
    const allOpts  = shuffleArray([correct, ...wrongs]);
    const correctIndex = allOpts.indexOf(correct);
    const category = decode(r.category);
    const difficulty = r.difficulty;

    return {
      id: idCounter++,
      question: decode(r.question),
      options: allOpts,
      correctIndex,
      explanation: `✅ The correct answer is: ${correct}`,
      emoji: categoryToEmoji(category),
      category,
      difficulty,
      source: "api",
    };
  });
}

// ─── Local fallback questions (Say Suco themed) ───────────────────────────────
export const FALLBACK_QUESTIONS: TriviaQuestion[] = [
  {
    id: 1,
    question: "How do you correctly pronounce 'açaí'?",
    options: ["AH-KAI", "AH-SIGH-EE", "AK-EYE", "AH-SAH-EE"],
    correctIndex: 1,
    explanation: "Açaí is pronounced 'AH-SIGH-EE' — a Brazilian Portuguese word!",
    emoji: "🗣️",
    source: "local",
  },
  {
    id: 2,
    question: "What is Say Suco's signature preparation method for açaí?",
    options: ["Always blended", "Always frozen", "Always scooped, never blended", "Always juiced"],
    correctIndex: 2,
    explanation: "Say Suco is famous for: 'Always scooped, never blended'!",
    emoji: "🥄",
    source: "local",
  },
  {
    id: 3,
    question: "What does Say Suco claim about their açaí?",
    options: ["Cheapest açaí in town", "Purest açaí in town", "Biggest bowls in town", "Sweetest açaí in town"],
    correctIndex: 1,
    explanation: "Say Suco proudly serves 'the purest açaí in town'!",
    emoji: "✨",
    source: "local",
  },
  {
    id: 4,
    question: "Where does açaí berry originally come from?",
    options: ["Hawaii", "Brazil", "Mexico", "Colombia"],
    correctIndex: 1,
    explanation: "Açaí berries come from the Amazon rainforest in Brazil!",
    emoji: "🌿",
    source: "local",
  },
  {
    id: 5,
    question: "Açaí is known as a 'superfood' mainly because of its high content of what?",
    options: ["Vitamin C", "Omega-3", "Antioxidants", "Calcium"],
    correctIndex: 2,
    explanation: "Açaí is packed with powerful antioxidants — great for your body!",
    emoji: "💪",
    source: "local",
  },
  {
    id: 6,
    question: "Açaí bowls are traditionally topped with what?",
    options: ["Oats", "Granola", "Rice puffs", "Quinoa"],
    correctIndex: 1,
    explanation: "Crunchy granola is the classic topping for an authentic açaí bowl!",
    emoji: "🌾",
    source: "local",
  },
  {
    id: 7,
    question: "What color is a typical açaí berry?",
    options: ["Bright red", "Orange", "Dark purple / black", "Green"],
    correctIndex: 2,
    explanation: "Açaí berries are a beautiful deep dark purple — almost black!",
    emoji: "🫐",
    source: "local",
  },
];

// ─── Public helper: pick one question, exclude already-seen IDs ───────────────
export function pickFromPool(
  pool: TriviaQuestion[],
  excludeIds: number[] = []
): TriviaQuestion | null {
  const available = pool.filter((q) => !excludeIds.includes(q.id));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

// ─── Legacy fallback (used if pool is totally empty) ─────────────────────────
export function getRandomTrivia(excludeIds: number[] = []): TriviaQuestion {
  const available = FALLBACK_QUESTIONS.filter((q) => !excludeIds.includes(q.id));
  const pool = available.length > 0 ? available : FALLBACK_QUESTIONS;
  return pool[Math.floor(Math.random() * pool.length)];
}
