"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TriviaQuestion } from "@/lib/trivia";
import { sounds } from "@/lib/sounds";

interface TriviaChallengeProps {
  question: TriviaQuestion;
  onAnswer: (correct: boolean) => void;
  onSkip: () => void;
}

export function TriviaChallenge({ question, onAnswer, onSkip }: TriviaChallengeProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  function handleSelect(idx: number) {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
    const correct = idx === question.correctIndex;
    if (correct) sounds.correct(); else sounds.wrong();
    setTimeout(() => onAnswer(correct), 1600);
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-suco-dark/55 backdrop-blur-md" />

      <motion.div
        className="relative w-full max-w-md rounded-3xl border border-suco-plum/25 bg-white overflow-hidden shadow-2xl"
        initial={{ scale: 0.8, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
      >
        {/* Header */}
        <div className="bg-suco-plum/8 p-5 border-b border-suco-plum/10">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{question.emoji}</span>
            <div>
              <p className="text-xs text-suco-plum uppercase tracking-widest font-bold">
                Say Suco Trivia Challenge
              </p>
              <p className="text-xs text-suco-mid">Answer correctly to earn +15 bonus seconds!</p>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="p-5">
          <p className="text-suco-dark font-bold text-base leading-snug mb-4">{question.question}</p>

          {/* Options */}
          <div className="space-y-2">
            {question.options.map((option, idx) => {
              const isSelected = selected === idx;
              const isCorrect = idx === question.correctIndex;
              let cls = "bg-suco-cream border-suco-border/60 hover:border-suco-plum/50";
              if (revealed) {
                if (isCorrect) cls = "bg-green-50 border-green-500";
                else if (isSelected && !isCorrect) cls = "bg-red-50 border-red-400";
                else cls = "bg-suco-cream border-suco-border/30 opacity-50";
              }

              return (
                <motion.button
                  key={idx}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all duration-200 text-sm ${cls}`}
                  onClick={() => handleSelect(idx)}
                  whileTap={!revealed ? { scale: 0.98 } : {}}
                  disabled={revealed}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        revealed && isCorrect
                          ? "bg-green-500 text-white"
                          : revealed && isSelected && !isCorrect
                          ? "bg-red-400 text-white"
                          : "bg-suco-beige text-suco-mid"
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className={revealed && isCorrect ? "text-suco-dark font-semibold" : "text-suco-dark"}>
                      {option}
                    </span>
                    {revealed && isCorrect && <span className="ml-auto text-green-500 font-bold">✓</span>}
                    {revealed && isSelected && !isCorrect && <span className="ml-auto text-red-400 font-bold">✗</span>}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {revealed && (
              <motion.div
                className="mt-3 p-3 rounded-xl bg-suco-cream border border-suco-plum/15"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <p className="text-xs text-suco-mid">{question.explanation}</p>
                {selected === question.correctIndex ? (
                  <p className="text-xs text-suco-plum font-bold mt-1">+15 seconds bonus! 🎉</p>
                ) : (
                  <p className="text-xs text-red-500 font-bold mt-1">No bonus this time.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!revealed && (
          <div className="px-5 pb-5">
            <button
              onClick={onSkip}
              className="w-full py-2 text-xs text-suco-muted hover:text-suco-mid transition-colors"
            >
              Skip trivia (no bonus)
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
