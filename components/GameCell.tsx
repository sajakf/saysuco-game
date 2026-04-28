"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PlayerIcon, AIIcon } from "./SucoLogo";
import type { Cell } from "@/lib/gameLogic";

interface GameCellProps {
  value: Cell;
  index: number;
  isWinningCell: boolean;
  onClick: (index: number) => void;
  disabled: boolean;
}

export function GameCell({ value, index, isWinningCell, onClick, disabled }: GameCellProps) {
  const isEmpty = value === null;
  const canClick = isEmpty && !disabled;

  return (
    <motion.button
      className={`
        relative aspect-square rounded-2xl border-2 flex items-center justify-center
        transition-all duration-200 select-none overflow-hidden
        ${isWinningCell
          ? "border-suco-plum bg-suco-plum/10 shadow-[0_0_18px_rgba(133,24,79,0.25)]"
          : isEmpty
          ? "border-suco-border/60 bg-white/50 hover:border-suco-plum/50 hover:bg-suco-plum/5"
          : "border-suco-border/40 bg-white/40"
        }
        ${canClick ? "cursor-pointer" : "cursor-default"}
      `}
      onClick={() => canClick && onClick(index)}
      whileTap={canClick ? { scale: 0.93 } : {}}
      whileHover={canClick ? { scale: 1.02 } : {}}
    >
      {/* Win shimmer */}
      {isWinningCell && (
        <motion.div
          className="absolute inset-0 rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.4, 0] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          style={{ background: "linear-gradient(135deg, rgba(133,24,79,0.2) 0%, transparent 60%)" }}
        />
      )}

      <AnimatePresence>
        {value && (
          <motion.div
            key={value + index}
            initial={{ scale: 0, rotate: -15, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="flex items-center justify-center w-full h-full"
          >
            {value === "player" ? <PlayerIcon size={50} /> : <AIIcon size={50} />}
          </motion.div>
        )}
      </AnimatePresence>

      {canClick && (
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-200"
            style={{ background: "radial-gradient(circle at center, rgba(133,24,79,0.07) 0%, transparent 70%)" }}
          />
        </div>
      )}
    </motion.button>
  );
}
