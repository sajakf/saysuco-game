export interface TriviaQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  emoji: string;
}

export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    id: 1,
    question: "How do you correctly pronounce 'açaí'?",
    options: ["AH-KAI", "AH-SIGH-EE", "AK-EYE", "AH-SAH-EE"],
    correctIndex: 1,
    explanation: "Açaí is pronounced 'AH-SIGH-EE' — a Brazilian Portuguese word!",
    emoji: "🗣️",
  },
  {
    id: 2,
    question: "What is Say Suco's signature preparation method for açaí?",
    options: ["Always blended", "Always frozen", "Always scooped, never blended", "Always juiced"],
    correctIndex: 2,
    explanation: "Say Suco is famous for their motto: 'Always scooped, never blended'!",
    emoji: "🥄",
  },
  {
    id: 3,
    question: "What does Say Suco claim about their açaí?",
    options: [
      "Cheapest açaí in town",
      "Purest açaí in town",
      "Biggest bowls in town",
      "Sweetest açaí in town",
    ],
    correctIndex: 1,
    explanation: "Say Suco proudly serves 'the purest açaí in town'!",
    emoji: "✨",
  },
  {
    id: 4,
    question: "Where does açaí berry originally come from?",
    options: ["Hawaii", "Brazil", "Mexico", "Colombia"],
    correctIndex: 1,
    explanation: "Açaí berries come from the Amazon rainforest in Brazil!",
    emoji: "🌿",
  },
  {
    id: 5,
    question: "Açaí is known as a 'superfood' mainly because of its high content of what?",
    options: ["Vitamin C", "Omega-3", "Antioxidants", "Calcium"],
    correctIndex: 2,
    explanation: "Açaí is packed with powerful antioxidants — great for your body!",
    emoji: "💪",
  },
  {
    id: 6,
    question: "What type of product is Say Suco's primary offering?",
    options: ["Smoothies", "Açaí bowls", "Fruit juices", "Coffee"],
    correctIndex: 1,
    explanation: "Say Suco specializes in authentic açaí bowls — scooped fresh for you!",
    emoji: "🥣",
  },
  {
    id: 7,
    question: "Which fruit does açaí look most similar to?",
    options: ["Blueberry", "Grape", "Olive", "Cherry"],
    correctIndex: 1,
    explanation: "Açaí berries look like small dark purple grapes but taste richer and earthier!",
    emoji: "🍇",
  },
  {
    id: 8,
    question: "What is the color of a typical açaí berry?",
    options: ["Bright red", "Orange", "Dark purple / black", "Green"],
    correctIndex: 2,
    explanation: "Açaí berries are a beautiful deep dark purple — almost black!",
    emoji: "🫐",
  },
  {
    id: 9,
    question: "Açaí bowls are traditionally topped with what grain?",
    options: ["Oats", "Granola", "Rice puffs", "Quinoa"],
    correctIndex: 1,
    explanation: "Crunchy granola is the classic topping for an authentic açaí bowl!",
    emoji: "🌾",
  },
  {
    id: 10,
    question: "What social media platform is Say Suco most active on?",
    options: ["Facebook", "Twitter", "Instagram", "Pinterest"],
    correctIndex: 2,
    explanation: "Follow Say Suco on Instagram @saysuco for the freshest açaí content!",
    emoji: "📱",
  },
];

export function getRandomTrivia(excludeIds: number[] = []): TriviaQuestion {
  const available = TRIVIA_QUESTIONS.filter((q) => !excludeIds.includes(q.id));
  const pool = available.length > 0 ? available : TRIVIA_QUESTIONS;
  return pool[Math.floor(Math.random() * pool.length)];
}
