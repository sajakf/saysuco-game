"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { SucoLogo, PlayerIcon, AIIcon, FriendIcon } from "./SucoLogo";
import { createPlayer } from "@/lib/storage";
import { sounds } from "@/lib/sounds";
import type { GameRoom } from "@/lib/roomStore";

export type GameMode = "ai" | "friend";

interface LandingScreenProps {
  /** AI mode or pass-and-play friend (legacy). */
  onStart: (phone: string, mode: GameMode, friendPhone?: string) => void;
  /** Real multiplayer: friend joined via invite link. */
  onStartMultiplayer: (roomId: string, myPhone: string, opponentPhone: string) => void;
  onViewQR: () => void;
}

const KUWAIT = { code: "+965", flag: "🇰🇼", name: "Kuwait" };

function validateKuwait(value: string): boolean {
  return /^[569]\d{7}$/.test(value.replace(/\D/g, ""));
}

// ── Main landing screen ───────────────────────────────────────────────────────
export function LandingScreen({ onStart, onStartMultiplayer, onViewQR }: LandingScreenProps) {
  const [localNumber, setLocalNumber] = useState("");
  const [error, setError]             = useState("");
  const [step, setStep]               = useState<"enter" | "mode" | "invite">("enter");
  const [phone, setPhone]             = useState("");
  const [inviteRoomId, setInviteRoomId] = useState("");

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
    setPhone(fullPhone);
    setStep("mode");
  }

  async function handleChooseMultiplayer() {
    // Create a room on the server, then show invite screen
    sounds.click();
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ p1Phone: phone }),
      });
      if (!res.ok) throw new Error("create failed");
      const room: GameRoom = await res.json();
      setInviteRoomId(room.id);
      setStep("invite");
    } catch {
      alert("Could not create game room. Please try again.");
    }
  }

  if (step === "mode") {
    return (
      <ModeScreen
        phone={phone}
        onChooseAI={() => { sounds.click(); onStart(phone, "ai"); }}
        onChooseFriend={handleChooseMultiplayer}
        onBack={() => setStep("enter")}
      />
    );
  }

  if (step === "invite") {
    return (
      <InviteScreen
        roomId={inviteRoomId}
        myPhone={phone}
        onFriendJoined={(opponentPhone) => onStartMultiplayer(inviteRoomId, phone, opponentPhone)}
        onCancel={() => setStep("mode")}
      />
    );
  }

  // ── Phone entry ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-suco-cream flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">

        {/* Logo */}
        <motion.div className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
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
        <motion.div className="flex flex-wrap justify-center gap-2"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          {["🏆 10 wins/week → Promo", "⏱ 60-Sec Challenge", "🧠 Live Trivia", "📲 Invite Friends"].map((tag) => (
            <span key={tag} className="text-xs bg-white/60 border border-suco-plum/20 rounded-full px-3 py-1 text-suco-mid font-medium shadow-sm">
              {tag}
            </span>
          ))}
        </motion.div>

        {/* Phone entry form */}
        <motion.form onSubmit={handlePhoneSubmit} className="space-y-4"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="space-y-1">
            <label className="text-xs text-suco-mid uppercase tracking-widest font-semibold">Mobile Number</label>
            <div className="flex gap-2">
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
          <button type="submit"
            className="w-full py-4 bg-suco-plum hover:bg-suco-plum2 active:scale-95 text-white font-black text-lg rounded-2xl transition-all shadow-lg">
            Join the Game 🥤
          </button>
        </motion.form>

        <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <button onClick={() => { sounds.click(); onViewQR(); }}
            className="text-sm text-suco-mid hover:text-suco-plum transition-colors underline underline-offset-2">
            Share this game 📲
          </button>
        </motion.div>

        <motion.div className="flex justify-center items-center gap-8 opacity-30"
          animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 3, repeat: Infinity }}>
          <PlayerIcon size={40} />
          <span className="text-2xl text-suco-plum font-black">VS</span>
          <AIIcon size={40} />
        </motion.div>
      </div>
    </div>
  );
}

// ── Mode selection ────────────────────────────────────────────────────────────
function ModeScreen({
  phone, onChooseAI, onChooseFriend, onBack,
}: {
  phone: string;
  onChooseAI: () => void;
  onChooseFriend: () => void;
  onBack: () => void;
}) {
  return (
    <div className="min-h-screen bg-suco-cream flex flex-col items-center justify-center p-6">
      <motion.div className="w-full max-w-sm space-y-6"
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>

        <div className="text-center">
          <SucoLogo size={64} />
          <h2 className="text-2xl font-black text-suco-dark mt-3">Choose Your Mode</h2>
          <p className="text-sm text-suco-mid mt-1">{phone}</p>
        </div>

        {/* Mode cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* vs AI */}
          <motion.button
            onClick={onChooseAI}
            whileTap={{ scale: 0.96 }}
            className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-suco-border/60 bg-white/60 hover:border-suco-plum/40 hover:bg-suco-plum/5 transition-all shadow-sm"
          >
            <AIIcon size={48} />
            <div className="text-center">
              <p className="font-black text-suco-dark text-sm">vs AI 🤖</p>
              <p className="text-[11px] text-suco-muted mt-0.5">Solo challenge</p>
            </div>
          </motion.button>

          {/* vs Friend */}
          <motion.button
            onClick={onChooseFriend}
            whileTap={{ scale: 0.96 }}
            className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-suco-border/60 bg-white/60 hover:border-teal-400/40 hover:bg-teal-50 transition-all shadow-sm"
          >
            <FriendIcon size={48} />
            <div className="text-center">
              <p className="font-black text-suco-dark text-sm">vs Friend 👥</p>
              <p className="text-[11px] text-suco-muted mt-0.5">Invite via link</p>
            </div>
          </motion.button>
        </div>

        {/* Quick rules */}
        <div className="bg-white/60 border border-suco-plum/15 rounded-2xl p-4 space-y-1.5 shadow-sm">
          {[
            ["⏱", "60-second countdown"],
            ["🏆", "10 weekly wins → promo code"],
            ["🧠", "Trivia bonus on every win or draw"],
            ["📲", "Friend joins on their own device"],
          ].map(([icon, text]) => (
            <div key={text as string} className="flex items-center gap-2 text-xs text-suco-mid">
              <span>{icon}</span><span>{text}</span>
            </div>
          ))}
        </div>

        <button onClick={onBack} className="w-full text-xs text-suco-muted hover:text-suco-mid transition-colors text-center">
          ← Change number
        </button>
      </motion.div>
    </div>
  );
}

// ── Invite screen (host waits for friend to join) ─────────────────────────────
function InviteScreen({
  roomId, myPhone, onFriendJoined, onCancel,
}: {
  roomId: string;
  myPhone: string;
  onFriendJoined: (opponentPhone: string) => void;
  onCancel: () => void;
}) {
  const [copied, setCopied]     = useState(false);
  const [friendJoining, setFriendJoining] = useState(false);
  const pollRef                 = useRef<NodeJS.Timeout | null>(null);
  const doneRef                 = useRef(false);

  // Build the invite URL
  const [inviteUrl, setInviteUrl] = useState("");
  useEffect(() => {
    setInviteUrl(`${window.location.origin}/join/${roomId}`);
  }, [roomId]);

  const poll = useCallback(async () => {
    if (doneRef.current) return;
    try {
      const res = await fetch(`/api/rooms/${roomId}`);
      if (!res.ok) return;
      const room: GameRoom = await res.json();
      if (room.status === "playing" && room.p2Phone) {
        doneRef.current = true;
        if (pollRef.current) clearInterval(pollRef.current);
        setFriendJoining(true);
        sounds.click();
        setTimeout(() => onFriendJoined(room.p2Phone!), 600);
      }
    } catch { /* ignore */ }
  }, [roomId, onFriendJoined]);

  useEffect(() => {
    poll();
    pollRef.current = setInterval(poll, 1500);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [poll]);

  function handleCopy() {
    navigator.clipboard.writeText(inviteUrl).then(() => {
      sounds.click();
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div className="min-h-screen bg-suco-cream flex flex-col items-center justify-center p-6">
      <motion.div className="w-full max-w-sm space-y-6"
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>

        <div className="text-center">
          <SucoLogo size={60} />
          <h2 className="text-2xl font-black text-suco-dark mt-3">Invite Your Friend</h2>
          <p className="text-sm text-suco-mid mt-1">Share the code or link — waiting for them to join…</p>
        </div>

        {/* Room code */}
        <div className="bg-white/80 border-2 border-suco-plum/20 rounded-2xl p-5 text-center shadow-sm">
          <p className="text-[10px] text-suco-muted uppercase tracking-widest font-semibold mb-3">Room Code</p>
          <div className="flex justify-center gap-1.5 mb-4">
            {roomId.split("").map((char, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.07 }}
                className="w-11 h-13 bg-suco-plum/10 border border-suco-plum/25 rounded-xl flex items-center justify-center text-2xl font-black text-suco-plum shadow-sm px-2 py-2"
              >
                {char}
              </motion.span>
            ))}
          </div>

          {/* QR code */}
          {inviteUrl && (
            <div className="flex justify-center mb-4">
              <div className="bg-white p-3 rounded-xl border border-suco-border/40 shadow-sm inline-block">
                <QRCodeSVG value={inviteUrl} size={120} fgColor="#85184F" bgColor="#FFFFFF" />
              </div>
            </div>
          )}

          {/* Copy link button */}
          <button
            onClick={handleCopy}
            className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all border ${
              copied
                ? "bg-green-50 border-green-400/50 text-green-700"
                : "bg-suco-plum/8 border-suco-plum/25 text-suco-plum hover:bg-suco-plum/15"
            }`}
          >
            {copied ? "✅ Link Copied!" : "📋 Copy Invite Link"}
          </button>
        </div>

        {/* Waiting animation */}
        <motion.div
          className={`flex flex-col items-center gap-3 py-4 px-5 rounded-2xl border transition-all ${
            friendJoining
              ? "bg-green-50 border-green-400/40"
              : "bg-white/60 border-suco-border/30"
          }`}
          animate={friendJoining ? { scale: [1, 1.04, 1] } : {}}
        >
          {friendJoining ? (
            <p className="text-sm font-bold text-green-700">🎉 Friend joined! Starting game…</p>
          ) : (
            <>
              <p className="text-xs text-suco-muted font-medium">Waiting for your friend…</p>
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div key={i} className="w-2.5 h-2.5 bg-suco-plum rounded-full"
                    animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }} />
                ))}
              </div>
              <p className="text-[11px] text-suco-muted text-center">
                Your number: <span className="font-bold text-suco-plum">{myPhone.slice(-8)}</span>
              </p>
            </>
          )}
        </motion.div>

        <button onClick={onCancel}
          className="w-full text-xs text-suco-muted hover:text-suco-mid transition-colors text-center">
          ← Cancel &amp; go back
        </button>
      </motion.div>
    </div>
  );
}
