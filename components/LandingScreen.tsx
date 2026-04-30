"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SucoLogo, PlayerIcon, AIIcon, FriendIcon } from "./SucoLogo";
import { createPlayer } from "@/lib/storage";
import { sounds } from "@/lib/sounds";

export type GameMode = "ai" | "friend";

interface LandingScreenProps {
  onStart: (phone: string, mode: GameMode, friendPhone?: string) => void;
  onViewQR: () => void;
}

const KUWAIT = { code: "+965", flag: "🇰🇼", name: "Kuwait" };

function validateKuwait(value: string): boolean {
  return /^[569]\d{7}$/.test(value.replace(/\D/g, ""));
}

export function LandingScreen({ onStart, onViewQR }: LandingScreenProps) {
  const [localNumber, setLocalNumber] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState<"enter" | "mode">("enter");

  const fullPhone = `${KUWAIT.code}${localNumber.replace(/\D/g, "")}`;

  function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateKuwait(localNumber)) {
      setError("Enter a valid Kuwait number (5, 6 or 9 + 7 digits).");
      return;
    }
    sounds.click();
    setError("");
    createPlayer(fullPhone);
    setStep("mode");
  }

  if (step === "mode") {
    return (
      <ModeScreen
        phone={fullPhone}
        onStart={onStart}
        onBack={() => setStep("enter")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-suco-cream flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">

        {/* Logo */}
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>
            <SucoLogo size={88} />
          </motion.div>
          <div className="text-center">
            <h1 className="text-3xl font-black text-suco-dark tracking-tight">
              Say Suco <span className="text-suco-plum">X</span>
              <span className="text-suco-gold">&</span>
              <span className="text-suco-plum">O</span>
            </h1>
            <p className="text-sm text-suco-mid mt-1 font-medium">Always scooped, never blended 🥄</p>
          </div>
        </motion.div>

        {/* Pills */}
        <motion.div className="flex flex-wrap justify-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          {["🏆 10 wins/week → Promo", "⏱ 60-Sec Challenge", "🧠 Live Trivia", "👥 vs Friend"].map((tag) => (
            <span key={tag} className="text-xs bg-white/60 border border-suco-plum/20 rounded-full px-3 py-1 text-suco-mid font-medium shadow-sm">
              {tag}
            </span>
          ))}
        </motion.div>

        {/* Phone entry */}
        <motion.form onSubmit={handlePhoneSubmit} className="space-y-4"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="space-y-1">
            <label className="text-xs text-suco-mid uppercase tracking-widest font-semibold">Mobile Number</label>
            <div className="flex gap-2">
              {/* Country badge — Kuwait only */}
              <div className="flex items-center gap-2 bg-white/70 border border-suco-plum/20 rounded-2xl px-3 py-4 shadow-sm min-w-[110px] cursor-default select-none">
                <span className="text-lg leading-none">{KUWAIT.flag}</span>
                <div className="flex flex-col leading-tight">
                  <span className="text-xs text-suco-muted font-medium">{KUWAIT.name}</span>
                  <span className="text-sm font-bold text-suco-plum">{KUWAIT.code}</span>
                </div>
              </div>
              <input
                type="tel" inputMode="numeric"
                value={localNumber}
                onChange={(e) => { setLocalNumber(e.target.value.replace(/\D/g, "").slice(0, 8)); setError(""); }}
                placeholder="5XXX XXXX"
                className="flex-1 bg-white/70 border border-suco-plum/20 focus:border-suco-plum/60 rounded-2xl px-4 py-4 text-suco-dark placeholder-suco-muted outline-none transition-all text-base shadow-sm tracking-widest"
              />
            </div>
            {error && (
              <motion.p className="text-red-600 text-xs mt-1" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
                {error}
              </motion.p>
            )}
          </div>
          <button type="submit" className="w-full py-4 bg-suco-plum hover:bg-suco-plum2 active:scale-95 text-white font-black text-lg rounded-2xl transition-all shadow-lg">
            Join the Game 🥤
          </button>
        </motion.form>

        <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <button onClick={() => { sounds.click(); onViewQR(); }} className="text-sm text-suco-mid hover:text-suco-plum transition-colors underline underline-offset-2">
            Share this game 📲
          </button>
        </motion.div>

        <motion.div className="flex justify-center items-center gap-8 opacity-30" animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 3, repeat: Infinity }}>
          <PlayerIcon size={40} />
          <span className="text-2xl text-suco-plum font-black">VS</span>
          <AIIcon size={40} />
        </motion.div>
      </div>
    </div>
  );
}

// ── Mode Selection Screen ─────────────────────────────────────────────────────
function ModeScreen({
  phone, onStart, onBack,
}: { phone: string; onStart: (p: string, m: GameMode, fp?: string) => void; onBack: () => void }) {
  const [mode, setMode] = useState<GameMode | null>(null);
  const [friendLocal, setFriendLocal] = useState("");
  const [friendError, setFriendError] = useState("");

  function handleStart() {
    sounds.click();
    if (mode === "ai") { onStart(phone, "ai"); return; }
    if (mode === "friend") {
      if (!validateKuwait(friendLocal)) {
        setFriendError("Enter a valid Kuwait number for your friend.");
        return;
      }
      const friendFull = `${KUWAIT.code}${friendLocal.replace(/\D/g, "")}`;
      if (friendFull === phone) {
        setFriendError("Friend's number can't be the same as yours!");
        return;
      }
      onStart(phone, "friend", friendFull);
    }
  }

  return (
    <div className="min-h-screen bg-suco-cream flex flex-col items-center justify-center p-6">
      <motion.div className="w-full max-w-sm space-y-6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>

        <div className="text-center">
          <SucoLogo size={64} />
          <h2 className="text-2xl font-black text-suco-dark mt-3">Choose Your Mode</h2>
          <p className="text-sm text-suco-mid mt-1">{phone}</p>
        </div>

        {/* Mode cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* vs AI */}
          <button
            onClick={() => { sounds.click(); setMode("ai"); setFriendLocal(""); setFriendError(""); }}
            className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
              mode === "ai"
                ? "border-suco-plum bg-suco-plum/10 shadow-md"
                : "border-suco-border/60 bg-white/60 hover:border-suco-plum/40"
            }`}
          >
            <AIIcon size={44} />
            <div className="text-center">
              <p className="font-black text-suco-dark text-sm">vs AI</p>
              <p className="text-[11px] text-suco-muted mt-0.5">Solo challenge</p>
            </div>
            {mode === "ai" && <span className="text-suco-plum text-lg">✓</span>}
          </button>

          {/* vs Friend */}
          <button
            onClick={() => { sounds.click(); setMode("friend"); }}
            className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
              mode === "friend"
                ? "border-teal-500 bg-teal-50 shadow-md"
                : "border-suco-border/60 bg-white/60 hover:border-teal-400/40"
            }`}
          >
            <FriendIcon size={44} />
            <div className="text-center">
              <p className="font-black text-suco-dark text-sm">vs Friend</p>
              <p className="text-[11px] text-suco-muted mt-0.5">Pass & play</p>
            </div>
            {mode === "friend" && <span className="text-teal-600 text-lg">✓</span>}
          </button>
        </div>

        {/* Friend phone input */}
        <AnimatePresence>
          {mode === "friend" && (
            <motion.div className="space-y-2"
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <label className="text-xs text-suco-mid uppercase tracking-widest font-semibold">Friend's Kuwait Number</label>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 bg-white/70 border border-teal-300/50 rounded-2xl px-3 py-3 shadow-sm min-w-[100px] cursor-default select-none">
                  <span className="text-base leading-none">{KUWAIT.flag}</span>
                  <span className="text-sm font-bold text-teal-600">{KUWAIT.code}</span>
                </div>
                <input
                  type="tel" inputMode="numeric"
                  value={friendLocal}
                  onChange={(e) => { setFriendLocal(e.target.value.replace(/\D/g, "").slice(0, 8)); setFriendError(""); }}
                  placeholder="5XXX XXXX"
                  className="flex-1 bg-white/70 border border-teal-300/50 focus:border-teal-500/60 rounded-2xl px-4 py-3 text-suco-dark placeholder-suco-muted outline-none transition-all text-base shadow-sm tracking-widest"
                />
              </div>
              {friendError && (
                <motion.p className="text-red-600 text-xs" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {friendError}
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rules quick summary */}
        <div className="bg-white/60 border border-suco-plum/15 rounded-2xl p-4 text-left space-y-1.5 shadow-sm">
          {[
            ["⏱", "60-second countdown"],
            ["🏆", "10 weekly wins → promo code"],
            ["🧠", "Trivia pops up on every win or draw"],
            ["🔄", "Play unlimited — new promo each week"],
          ].map(([icon, text]) => (
            <div key={text as string} className="flex items-center gap-2 text-xs text-suco-mid">
              <span>{icon}</span><span>{text}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleStart}
          disabled={!mode || (mode === "friend" && friendLocal.length < 8)}
          className="w-full py-4 bg-suco-plum hover:bg-suco-plum2 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xl rounded-2xl transition-all shadow-lg active:scale-95"
        >
          Start Game! 🎮
        </button>

        <button onClick={onBack} className="w-full text-xs text-suco-muted hover:text-suco-mid transition-colors text-center">
          ← Change number
        </button>
      </motion.div>
    </div>
  );
}
