"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SucoLogo } from "./SucoLogo";
import { getAllWinners } from "@/lib/storage";
import { sounds } from "@/lib/sounds";

interface QRShareProps {
  onBack: () => void;
}

export function QRShare({ onBack }: QRShareProps) {
  const [gameUrl, setGameUrl] = useState("https://saysuco-game.vercel.app");
  const [QRCode, setQRCode] = useState<React.ComponentType<any> | null>(null);
  const [copied, setCopied] = useState(false);
  const [winners, setWinners] = useState<{ phone: string; wins: number }[]>([]);

  useEffect(() => {
    setGameUrl(window.location.origin);
    import("qrcode.react").then((mod) => {
      setQRCode(() => mod.QRCodeSVG ?? mod.default);
    });
    setWinners(getAllWinners().slice(0, 5));
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(gameUrl);
      setCopied(true);
      sounds.correct();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      sounds.wrong();
    }
  }

  return (
    <div className="min-h-screen bg-suco-cream flex flex-col items-center justify-start p-6 pt-10">
      <div className="w-full max-w-sm space-y-6">

        <button
          onClick={() => { sounds.click(); onBack(); }}
          className="flex items-center gap-2 text-sm text-suco-mid hover:text-suco-dark transition-colors font-medium"
        >
          ← Back
        </button>

        {/* Header */}
        <motion.div
          className="text-center space-y-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-center">
            <SucoLogo size={56} />
          </div>
          <h2 className="text-2xl font-black text-suco-dark">Share the Game!</h2>
          <p className="text-sm text-suco-mid">Let your friends play the Say Suco challenge</p>
        </motion.div>

        {/* QR Code */}
        <motion.div
          className="bg-white border border-suco-plum/20 rounded-3xl p-6 flex flex-col items-center gap-4 shadow-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-suco-cream p-4 rounded-2xl border border-suco-border/40">
            {QRCode ? (
              <QRCode value={gameUrl} size={180} fgColor="#85184F" bgColor="#EDE0D4" level="H" />
            ) : (
              <div className="w-[180px] h-[180px] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-suco-plum border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <p className="text-xs text-suco-muted text-center font-medium">Scan to play Say Suco X&O</p>
        </motion.div>

        {/* URL Copy */}
        <motion.div className="space-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <p className="text-xs text-suco-muted uppercase tracking-wider font-semibold">Game Link</p>
          <div className="flex gap-2">
            <div className="flex-1 bg-white border border-suco-border/60 rounded-xl px-4 py-3 text-sm text-suco-mid overflow-hidden text-ellipsis whitespace-nowrap shadow-sm">
              {gameUrl}
            </div>
            <button
              onClick={handleCopy}
              className={`px-4 rounded-xl font-bold text-sm transition-all ${
                copied
                  ? "bg-suco-plum text-white"
                  : "bg-white hover:bg-suco-beige text-suco-mid border border-suco-border shadow-sm"
              }`}
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
        </motion.div>

        {/* Social share */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "WhatsApp 💬", cls: "bg-green-50 border-green-300 text-green-700 hover:bg-green-100", href: `https://wa.me/?text=Play the Say Suco X%26O game and win a promo! ${gameUrl}` },
            { label: "Instagram 📸", cls: "bg-pink-50 border-pink-300 text-pink-700 hover:bg-pink-100", href: "https://instagram.com/saysuco" },
          ].map(({ label, cls, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-center py-3 rounded-2xl border text-sm font-bold transition-all hover:scale-105 ${cls}`}
              onClick={() => sounds.click()}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Leaderboard */}
        {winners.length > 0 && (
          <motion.div
            className="bg-white border border-suco-plum/15 rounded-2xl p-4 shadow-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-xs font-bold text-suco-plum uppercase tracking-wider mb-3">🏆 Top Winners</p>
            <div className="space-y-2">
              {winners.map((w, i) => (
                <div key={w.phone} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${
                      i === 0 ? "bg-yellow-400 text-white" :
                      i === 1 ? "bg-gray-300 text-gray-700" :
                      i === 2 ? "bg-amber-600 text-white" : "bg-suco-beige text-suco-mid"
                    }`}>{i + 1}</span>
                    <span className="text-suco-mid">{"•".repeat(3) + w.phone.slice(-4)}</span>
                  </div>
                  <span className="text-suco-plum font-bold">{w.wins} wins</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Branding footer */}
        <div className="text-center pb-4">
          <p className="text-xs text-suco-muted">
            Powered by Say Suco • Always scooped, never blended 🥄
          </p>
          <p className="text-xs text-suco-muted/60 mt-1">@saysuco</p>
        </div>
      </div>
    </div>
  );
}
