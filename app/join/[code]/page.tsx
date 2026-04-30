"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { SucoLogo, FriendIcon, PlayerIcon } from "@/components/SucoLogo";
import { MultiplayerBoard } from "@/components/MultiplayerBoard";
import { sounds } from "@/lib/sounds";

const KUWAIT = { code: "+965", flag: "🇰🇼", name: "Kuwait" };

function validateKuwait(value: string): boolean {
  return /^[569]\d{7}$/.test(value.replace(/\D/g, ""));
}

export default function JoinPage() {
  const params  = useParams();
  const roomCode = ((params?.code ?? "") as string).toUpperCase();

  const [step, setStep]             = useState<"enter" | "game">("enter");
  const [localNumber, setLocalNumber] = useState("");
  const [error, setError]           = useState("");
  const [joining, setJoining]       = useState(false);
  const [gameData, setGameData]     = useState<{
    roomId: string; myPhone: string; opponentPhone: string;
  } | null>(null);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!validateKuwait(localNumber)) {
      setError("Enter a valid Kuwait number (5, 6 or 9 + 7 digits).");
      return;
    }
    const myPhone = `${KUWAIT.code}${localNumber.replace(/\D/g, "")}`;
    setJoining(true);
    setError("");
    try {
      const res = await fetch(`/api/rooms/${roomCode}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join", p2Phone: myPhone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not join. The link may have expired.");
        setJoining(false);
        return;
      }
      sounds.click();
      setGameData({ roomId: roomCode, myPhone, opponentPhone: data.p1Phone });
      setStep("game");
    } catch {
      setError("Network error. Please try again.");
      setJoining(false);
    }
  }

  // ── In-game screen ─────────────────────────────────────────────────────────
  if (step === "game" && gameData) {
    return (
      <MultiplayerBoard
        roomId={gameData.roomId}
        myPhone={gameData.myPhone}
        myMark="p2"
        opponentPhone={gameData.opponentPhone}
        onGoHome={() => { setStep("enter"); setGameData(null); setLocalNumber(""); }}
      />
    );
  }

  // ── Join entry screen ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-suco-cream flex flex-col items-center justify-center p-6">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #C49540 0%, transparent 70%)" }} />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #85184F 0%, transparent 70%)" }} />
      </div>

      <motion.div className="w-full max-w-sm space-y-7 relative z-10"
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        {/* Logo + heading */}
        <div className="flex flex-col items-center gap-4 text-center">
          <motion.div animate={{ y: [0, -7, 0] }} transition={{ duration: 3, repeat: Infinity }}>
            <SucoLogo size={72} />
          </motion.div>
          <div>
            <h1 className="text-2xl font-black text-suco-dark">You&apos;re Invited! 🎉</h1>
            <p className="text-sm text-suco-mid mt-1">Your friend is waiting for you in the game</p>
          </div>
        </div>

        {/* Room code badge */}
        <div className="bg-white/70 border-2 border-suco-plum/20 rounded-2xl p-5 text-center shadow-sm">
          <p className="text-[10px] text-suco-muted uppercase tracking-widest font-semibold mb-3">Game Room Code</p>
          <div className="flex justify-center gap-1.5">
            {roomCode.split("").map((char, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.07 }}
                className="w-10 h-12 bg-suco-plum/10 border border-suco-plum/25 rounded-xl flex items-center justify-center text-2xl font-black text-suco-plum shadow-sm"
              >
                {char}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Phone entry form */}
        <form onSubmit={handleJoin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-suco-mid uppercase tracking-widest font-semibold">
              Your Kuwait Number
            </label>
            <div className="flex gap-2">
              {/* Country badge */}
              <div className="flex items-center gap-2 bg-white/70 border border-suco-plum/20 rounded-2xl px-3 py-4 shadow-sm min-w-[110px] cursor-default select-none">
                <span className="text-lg leading-none">{KUWAIT.flag}</span>
                <div className="flex flex-col leading-tight">
                  <span className="text-xs text-suco-muted font-medium">{KUWAIT.name}</span>
                  <span className="text-sm font-bold text-suco-plum">{KUWAIT.code}</span>
                </div>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                value={localNumber}
                onChange={(e) => {
                  setLocalNumber(e.target.value.replace(/\D/g, "").slice(0, 8));
                  setError("");
                }}
                placeholder="5XXX XXXX"
                autoFocus
                className="flex-1 bg-white/70 border border-suco-plum/20 focus:border-suco-plum/60 rounded-2xl px-4 py-4 text-suco-dark placeholder-suco-muted outline-none transition-all text-base shadow-sm tracking-widest"
              />
            </div>
            {error && (
              <motion.p
                className="text-red-600 text-xs mt-1"
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              >
                ⚠️ {error}
              </motion.p>
            )}
          </div>

          <button
            type="submit"
            disabled={joining || localNumber.length < 8}
            className="w-full py-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-lg rounded-2xl transition-all shadow-lg active:scale-95"
          >
            {joining
              ? <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Joining…
                </span>
              : "Join the Game 🎮"
            }
          </button>
        </form>

        {/* Players preview */}
        <div className="flex justify-center items-center gap-6 opacity-25 pt-2">
          <PlayerIcon size={36} />
          <span className="text-xl text-suco-plum font-black">VS</span>
          <FriendIcon size={36} />
        </div>
      </motion.div>
    </div>
  );
}
