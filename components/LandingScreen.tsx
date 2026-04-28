"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SucoLogo, PlayerIcon, AIIcon } from "./SucoLogo";
import { createPlayer, canPlayToday } from "@/lib/storage";
import { sounds } from "@/lib/sounds";

interface LandingScreenProps {
  onStart: (phone: string) => void;
  onViewQR: () => void;
}

const KUWAIT = { code: "+965", flag: "🇰🇼", name: "Kuwait" };

export function LandingScreen({ onStart, onViewQR }: LandingScreenProps) {
  const [localNumber, setLocalNumber] = useState("");
  const [error, setError] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [blockedMsg, setBlockedMsg] = useState("");
  const [step, setStep] = useState<"enter" | "ready">("enter");

  // Kuwait mobile numbers: 8 digits, starting with 5, 6, or 9
  function validateKuwaitNumber(value: string): boolean {
    const digits = value.replace(/\D/g, "");
    return /^[569]\d{7}$/.test(digits);
  }

  const fullPhone = `${KUWAIT.code}${localNumber.replace(/\D/g, "")}`;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateKuwaitNumber(localNumber)) {
      setError("Enter a valid Kuwait number (e.g. 5XXXXXXX, 6XXXXXXX or 9XXXXXXX).");
      return;
    }
    sounds.click();
    setError("");
    const { canPlay, reason } = canPlayToday(fullPhone);
    if (!canPlay) {
      setBlocked(true);
      setBlockedMsg(reason ?? "Come back tomorrow!");
      return;
    }
    createPlayer(fullPhone);
    setStep("ready");
  }

  if (blocked) return <BlockedScreen message={blockedMsg} onViewQR={onViewQR} />;
  if (step === "ready") return <ReadyScreen phone={fullPhone} onStart={onStart} onBack={() => setStep("enter")} />;

  return (
    <div className="min-h-screen bg-suco-cream flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">

        {/* Logo + Title */}
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>
            <SucoLogo size={88} />
          </motion.div>
          <div className="text-center">
            <h1 className="text-3xl font-black text-suco-dark tracking-tight">
              Say Suco{" "}
              <span className="text-suco-plum">X</span>
              <span className="text-suco-gold">&</span>
              <span className="text-suco-plum">O</span>
            </h1>
            <p className="text-sm text-suco-mid mt-1 font-medium">Always scooped, never blended 🥄</p>
          </div>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          className="flex flex-wrap justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {["🏆 Win 10× → Promo Code", "⏱ 3-Min Challenge", "🧠 Açaí Trivia", "🤖 Beat the AI"].map((tag) => (
            <span
              key={tag}
              className="text-xs bg-white/60 border border-suco-plum/20 rounded-full px-3 py-1 text-suco-mid font-medium shadow-sm"
            >
              {tag}
            </span>
          ))}
        </motion.div>

        {/* Phone entry */}
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="space-y-1">
            <label className="text-xs text-suco-mid uppercase tracking-widest font-semibold">
              Mobile Number
            </label>
            <div className="flex gap-2">
              {/* Country code — Kuwait only */}
              <div className="flex items-center gap-2 bg-white/70 border border-suco-plum/20 rounded-2xl px-3 py-4 shadow-sm min-w-[110px] cursor-default select-none">
                <span className="text-lg leading-none">{KUWAIT.flag}</span>
                <div className="flex flex-col leading-tight">
                  <span className="text-xs text-suco-muted font-medium">{KUWAIT.name}</span>
                  <span className="text-sm font-bold text-suco-plum">{KUWAIT.code}</span>
                </div>
              </div>

              {/* Local number */}
              <input
                type="tel"
                value={localNumber}
                onChange={(e) => {
                  // only digits, max 8
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
                  setLocalNumber(digits);
                  setError("");
                }}
                placeholder="5XXX XXXX"
                inputMode="numeric"
                className="flex-1 bg-white/70 border border-suco-plum/20 focus:border-suco-plum/60 rounded-2xl px-4 py-4 text-suco-dark placeholder-suco-muted outline-none transition-all text-base shadow-sm tracking-widest"
              />
            </div>
            {error && (
              <motion.p
                className="text-red-600 text-xs mt-1"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {error}
              </motion.p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-suco-plum hover:bg-suco-plum2 active:scale-95 text-white font-black text-lg rounded-2xl transition-all shadow-lg hover:shadow-suco-plum/30"
          >
            Join the Game 🥤
          </button>
        </motion.form>

        {/* QR share */}
        <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <button
            onClick={() => { sounds.click(); onViewQR(); }}
            className="text-sm text-suco-mid hover:text-suco-plum transition-colors underline underline-offset-2"
          >
            Share this game 📲
          </button>
        </motion.div>

        {/* Floating icons */}
        <motion.div
          className="flex justify-center items-center gap-8 opacity-30"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <PlayerIcon size={40} />
          <span className="text-2xl text-suco-plum font-black">VS</span>
          <AIIcon size={40} />
        </motion.div>
      </div>
    </div>
  );
}

function ReadyScreen({ phone, onStart, onBack }: { phone: string; onStart: (p: string) => void; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-suco-cream flex flex-col items-center justify-center p-6">
      <motion.div
        className="w-full max-w-sm space-y-6 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <motion.div animate={{ rotate: [0, -5, 5, -3, 3, 0] }} transition={{ duration: 0.8 }}>
          <SucoLogo size={72} />
        </motion.div>

        <div>
          <h2 className="text-2xl font-black text-suco-dark mb-1">Ready, Player!</h2>
          <p className="text-suco-plum text-sm font-bold">{phone}</p>
        </div>

        {/* Rules */}
        <div className="bg-white/60 border border-suco-plum/15 rounded-2xl p-4 text-left space-y-2 shadow-sm">
          <p className="text-xs font-bold text-suco-dark uppercase tracking-wider mb-2">How to Win</p>
          {[
            ["🥤", "You play as the Açaí Cup"],
            ["🥣", "AI plays as the Açaí Bowl"],
            ["⏱", "3-minute countdown — don't run out!"],
            ["🏆", "Win 10 total games → Promo Code"],
            ["❌", "Lose once today → come back tomorrow"],
            ["🧠", "Trivia every 3rd game — earn +15 sec!"],
          ].map(([icon, text]) => (
            <div key={text as string} className="flex items-start gap-2 text-xs text-suco-mid">
              <span>{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => { sounds.click(); onStart(phone); }}
          className="w-full py-4 bg-suco-plum hover:bg-suco-plum2 text-white font-black text-xl rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95"
        >
          Start Game! 🎮
        </button>

        <button onClick={onBack} className="text-xs text-suco-muted hover:text-suco-mid transition-colors">
          ← Change number
        </button>
      </motion.div>
    </div>
  );
}

function BlockedScreen({ message, onViewQR }: { message: string; onViewQR: () => void }) {
  return (
    <div className="min-h-screen bg-suco-cream flex flex-col items-center justify-center p-6">
      <motion.div
        className="w-full max-w-sm text-center space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-6xl">😔</div>
        <div>
          <h2 className="text-2xl font-black text-suco-dark mb-2">Thanks for Playing!</h2>
          <p className="text-suco-mid text-sm">{message}</p>
        </div>

        <div className="bg-white/60 border border-suco-plum/20 rounded-2xl p-5 text-left space-y-3 shadow-sm">
          <p className="text-xs font-bold text-suco-plum uppercase tracking-wider">About Say Suco</p>
          <p className="text-sm text-suco-dark leading-relaxed">
            We serve the <span className="text-suco-plum font-semibold">purest açaí in town</span> — always scooped,
            never blended. Our thick, authentic Brazilian açaí bowls are made fresh for you every day.
          </p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {[
              { label: "Instagram", val: "@saysuco" },
              { label: "TikTok", val: "@say.suco" },
              { label: "Mantra", val: "Always Scooped" },
              { label: "Product", val: "Açaí Bowls 🥣" },
            ].map(({ label, val }) => (
              <div key={label} className="bg-suco-beige rounded-xl p-2">
                <p className="text-xs text-suco-muted">{label}</p>
                <p className="text-xs text-suco-dark font-semibold">{val}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onViewQR}
          className="w-full py-3 bg-white/60 hover:bg-white/80 border border-suco-plum/20 rounded-2xl text-suco-mid text-sm font-semibold transition-all shadow-sm"
        >
          Share with Friends 📲
        </button>
      </motion.div>
    </div>
  );
}
