"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LandingScreen } from "@/components/LandingScreen";
import { GameBoard } from "@/components/GameBoard";
import { QRShare } from "@/components/QRShare";

type Screen = "landing" | "game" | "qr";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [phone, setPhone] = useState("");

  // Confetti on wins — loaded dynamically so it doesn't SSR
  useEffect(() => {
    // Pre-load confetti
    import("canvas-confetti").catch(() => {});
  }, []);

  function handleStartGame(playerPhone: string) {
    setPhone(playerPhone);
    setScreen("game");
  }

  return (
    <main className="min-h-screen bg-suco-cream">
      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #C49540 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #85184F 0%, transparent 70%)" }}
        />
      </div>

      <AnimatePresence mode="wait">
        {screen === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <LandingScreen onStart={handleStartGame} onViewQR={() => setScreen("qr")} />
          </motion.div>
        )}

        {screen === "game" && (
          <motion.div
            key="game"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.3 }}
          >
            <GameBoard phone={phone} onGoHome={() => setScreen("landing")} />
          </motion.div>
        )}

        {screen === "qr" && (
          <motion.div
            key="qr"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <QRShare onBack={() => setScreen("landing")} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
