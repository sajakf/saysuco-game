"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sounds } from "@/lib/sounds";

interface WinPopupProps {
  result: "win" | "lose" | "draw" | null;
  promoCode: string | null;
  promoJustUnlocked: boolean;
  totalWins: number;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export function WinPopup({ result, promoCode, promoJustUnlocked, totalWins, onPlayAgain, onGoHome }: WinPopupProps) {
  const played = useRef(false);

  useEffect(() => {
    if (result && !played.current) {
      played.current = true;
      setTimeout(() => {
        if (promoJustUnlocked) sounds.promo();
        else if (result === "win") sounds.win();
        else if (result === "lose") sounds.lose();
        else sounds.draw();
      }, 200);
    }
    if (!result) played.current = false;
  }, [result, promoJustUnlocked]);

  const config = {
    win: {
      emoji: "🎉",
      title: "You Won!",
      sub: "Fresh like a Say Suco scoop!",
      bg: "bg-white",
      border: "border-suco-plum/30",
      headerBg: "bg-suco-plum/8",
      btnColor: "bg-suco-plum hover:bg-suco-plum2 text-white",
    },
    lose: {
      emoji: "😔",
      title: "Better Luck Next Time",
      sub: "The AI was strong today. Come back tomorrow!",
      bg: "bg-white",
      border: "border-suco-gold/40",
      headerBg: "bg-suco-gold/10",
      btnColor: "bg-suco-beige hover:bg-suco-card text-suco-dark border border-suco-border",
    },
    draw: {
      emoji: "🤝",
      title: "It's a Draw!",
      sub: "Evenly matched — just like a perfect açaí blend.",
      bg: "bg-white",
      border: "border-suco-gold/40",
      headerBg: "bg-suco-gold/10",
      btnColor: "bg-suco-gold hover:bg-suco-gold2 text-white",
    },
  };

  const cfg = result ? config[result] : null;

  return (
    <AnimatePresence>
      {result && cfg && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div className="absolute inset-0 bg-suco-dark/50 backdrop-blur-sm" />

          {/* Card */}
          <motion.div
            className={`relative w-full max-w-sm rounded-3xl border ${cfg.border} ${cfg.bg} p-6 text-center shadow-2xl overflow-hidden`}
            initial={{ scale: 0.7, y: 60, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
          >
            {/* Emoji */}
            <motion.div
              className="text-6xl mb-3"
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, -10, 10, -5, 5, 0] }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              {cfg.emoji}
            </motion.div>

            <h2 className="text-2xl font-black text-suco-dark mb-1">{cfg.title}</h2>
            <p className="text-suco-mid text-sm mb-4">{cfg.sub}</p>

            {/* Promo unlock */}
            {promoJustUnlocked && promoCode && (
              <motion.div
                className="bg-suco-cream border border-suco-plum/30 rounded-2xl p-4 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-xs text-suco-plum uppercase tracking-widest mb-1 font-bold">
                  🏆 10-Win Promo Unlocked!
                </p>
                <p className="text-xs text-suco-mid mb-3">
                  Show this code at Say Suco to claim your reward:
                </p>
                <div className="bg-white rounded-xl p-3 border border-suco-plum/20">
                  <p className="text-xl font-black text-suco-plum tracking-widest animate-glow">
                    {promoCode}
                  </p>
                </div>
                <p className="text-xs text-suco-muted mt-2">Take a screenshot to save your code!</p>
              </motion.div>
            )}

            {/* Existing promo */}
            {!promoJustUnlocked && promoCode && result === "win" && (
              <div className="bg-suco-cream border border-suco-plum/20 rounded-xl p-3 mb-4 text-left">
                <p className="text-xs text-suco-muted">Your promo code:</p>
                <p className="text-base font-bold text-suco-plum tracking-wider">{promoCode}</p>
              </div>
            )}

            {/* Win badge */}
            {result === "win" && (
              <div className="inline-flex items-center gap-2 bg-suco-plum/10 border border-suco-plum/20 rounded-full px-4 py-1 mb-4">
                <span className="text-suco-plum text-xs font-semibold">Total Wins: {totalWins}</span>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 mt-2">
              {result !== "lose" && (
                <button
                  onClick={onPlayAgain}
                  className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all ${cfg.btnColor}`}
                >
                  Play Again
                </button>
              )}
              <button
                onClick={onGoHome}
                className={`${result === "lose" ? "flex-1" : ""} py-3 px-5 rounded-2xl font-bold text-sm bg-suco-beige hover:bg-suco-card text-suco-mid border border-suco-border transition-all`}
              >
                {result === "lose" ? "Back to Home" : "Home"}
              </button>
            </div>

            {result === "lose" && (
              <p className="text-xs text-suco-muted mt-3">
                You can play again tomorrow. Visit @saysuco for more!
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
