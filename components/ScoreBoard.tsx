"use client";

import { PlayerIcon, AIIcon } from "./SucoLogo";
import { WINS_TO_PROMO } from "@/lib/storage";

interface ScoreBoardProps {
  playerWins: number;
  aiWins: number;
  draws: number;
  totalWins: number;
}

export function ScoreBoard({ playerWins, aiWins, draws, totalWins }: ScoreBoardProps) {
  const progressPct = Math.min((totalWins / WINS_TO_PROMO) * 100, 100);

  return (
    <div className="w-full space-y-3">
      {/* Session scores */}
      <div className="grid grid-cols-3 gap-2">
        <ScoreCard label="You"  value={playerWins} color="text-suco-plum"  icon={<PlayerIcon size={28} />} />
        <ScoreCard label="Draw" value={draws}       color="text-suco-mid"   icon={<span className="text-lg">🤝</span>} />
        <ScoreCard label="AI"   value={aiWins}      color="text-suco-gold"  icon={<AIIcon size={28} />} />
      </div>

      {/* Promo progress */}
      <div className="bg-white/60 border border-suco-plum/15 rounded-xl p-3 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-suco-mid uppercase tracking-wider font-semibold">Promo Progress</span>
          <span className="text-xs font-bold text-suco-plum">
            {totalWins} / {WINS_TO_PROMO} wins
          </span>
        </div>
        <div className="h-2 bg-suco-beige rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progressPct}%`,
              background: "linear-gradient(90deg, #85184F, #9E1F5E, #B82870)",
              boxShadow: progressPct > 0 ? "0 0 6px rgba(133,24,79,0.5)" : "none",
            }}
          />
        </div>
        {totalWins >= WINS_TO_PROMO ? (
          <p className="text-xs text-suco-plum mt-1 font-bold animate-pulse">🎉 Promo Unlocked!</p>
        ) : (
          <p className="text-xs text-suco-muted mt-1">
            {WINS_TO_PROMO - totalWins} more win{WINS_TO_PROMO - totalWins !== 1 ? "s" : ""} for your promo code!
          </p>
        )}
      </div>
    </div>
  );
}

function ScoreCard({
  label, value, color, icon,
}: {
  label: string; value: number; color: string; icon: React.ReactNode;
}) {
  return (
    <div className="bg-white/60 border border-suco-plum/15 rounded-xl p-3 flex flex-col items-center gap-1 shadow-sm">
      <div className="flex items-center gap-1">{icon}</div>
      <span className={`text-2xl font-bold tabular-nums ${color}`}>{value}</span>
      <span className="text-xs text-suco-muted uppercase tracking-wider font-semibold">{label}</span>
    </div>
  );
}
