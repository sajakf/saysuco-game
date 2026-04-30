"use client";

/** Main Say Suco smiley logo — golden circle, X eyes, curved "SAY SUCO" text */
export function SucoLogo({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Gold circle */}
      <circle cx="50" cy="50" r="46" fill="#C49540" />
      <circle cx="50" cy="50" r="46" fill="url(#logoShine)" />

      {/* Curved "SAY SUCO" text around top */}
      <path id="arcTop" d="M 16,50 A 34,34 0 0,1 84,50" fill="none" />
      <text fontSize="8.5" fontWeight="800" fill="#85184F" fontFamily="system-ui, sans-serif" letterSpacing="2.5">
        <textPath href="#arcTop" startOffset="12%">SAY SUCO</textPath>
      </text>

      {/* X left eye */}
      <line x1="33" y1="42" x2="41" y2="52" stroke="#85184F" strokeWidth="4.5" strokeLinecap="round" />
      <line x1="41" y1="42" x2="33" y2="52" stroke="#85184F" strokeWidth="4.5" strokeLinecap="round" />

      {/* X right eye */}
      <line x1="59" y1="42" x2="67" y2="52" stroke="#85184F" strokeWidth="4.5" strokeLinecap="round" />
      <line x1="67" y1="42" x2="59" y2="52" stroke="#85184F" strokeWidth="4.5" strokeLinecap="round" />

      {/* Smile */}
      <path d="M 35 65 Q 50 78 65 65" stroke="#85184F" strokeWidth="4" strokeLinecap="round" fill="none" />

      {/* Shine gradient */}
      <defs>
        <radialGradient id="logoShine" cx="35%" cy="30%" r="60%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/** Player icon — golden cup with açaí dots */
export function PlayerIcon({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cup body */}
      <path d="M12 22 L15 52 H45 L48 22 Z" fill="#C49540" stroke="#B8836A" strokeWidth="1.5" />
      {/* Lid */}
      <rect x="9" y="14" width="42" height="9" rx="4" fill="#D4A850" />
      {/* Straw */}
      <rect x="34" y="4" width="5" height="24" rx="2.5" fill="#85184F" />
      <rect x="34" y="8"  width="5" height="3"  rx="1"   fill="#9E1F5E" />
      <rect x="34" y="14" width="5" height="3"  rx="1"   fill="#9E1F5E" />
      {/* Shine */}
      <path d="M19 28 Q23 26 23 42" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" strokeLinecap="round" />
      {/* Açaí dots */}
      <circle cx="28" cy="36" r="3"   fill="#85184F" opacity="0.85" />
      <circle cx="35" cy="42" r="2.5" fill="#85184F" opacity="0.85" />
      <circle cx="24" cy="44" r="2"   fill="#9E1F5E" opacity="0.85" />
    </svg>
  );
}

/** AI icon — burgundy açaí bowl */
export function AIIcon({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Bowl shadow */}
      <ellipse cx="30" cy="46" rx="24" ry="8" fill="#C8AE94" />
      {/* Bowl body */}
      <path d="M6 36 Q6 54 30 54 Q54 54 54 36 Z" fill="#85184F" stroke="#9E1F5E" strokeWidth="1.5" />
      {/* Açaí scoops */}
      <circle cx="22" cy="34" r="5"   fill="#9E1F5E" stroke="#B82870" strokeWidth="1" />
      <circle cx="32" cy="30" r="4"   fill="#B82870" stroke="#9E1F5E" strokeWidth="1" />
      <circle cx="40" cy="35" r="4.5" fill="#9E1F5E" stroke="#85184F" strokeWidth="1" />
      <circle cx="28" cy="37" r="3.5" fill="#85184F" stroke="#9E1F5E" strokeWidth="1" />
      {/* Granola */}
      <path d="M15 40 Q20 38 25 40" stroke="#C49540" strokeWidth="2" strokeLinecap="round" />
      <path d="M35 38 Q40 36 45 38" stroke="#C49540" strokeWidth="2" strokeLinecap="round" />
      {/* Banana */}
      <ellipse cx="30" cy="25" rx="5" ry="3" fill="#D4A850" stroke="#C49540" strokeWidth="1" />
    </svg>
  );
}

/** Friend icon — teal/green açaí cup variant to distinguish from the player */
export function FriendIcon({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cup body */}
      <path d="M12 22 L15 52 H45 L48 22 Z" fill="#0D9488" stroke="#0F766E" strokeWidth="1.5" />
      {/* Lid */}
      <rect x="9" y="14" width="42" height="9" rx="4" fill="#14B8A6" />
      {/* Straw */}
      <rect x="34" y="4" width="5" height="24" rx="2.5" fill="#0F766E" />
      <rect x="34" y="8"  width="5" height="3"  rx="1"   fill="#0D9488" />
      <rect x="34" y="14" width="5" height="3"  rx="1"   fill="#0D9488" />
      {/* Shine */}
      <path d="M19 28 Q23 26 23 42" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" strokeLinecap="round" />
      {/* Açaí dots */}
      <circle cx="28" cy="36" r="3"   fill="#0F766E" opacity="0.9" />
      <circle cx="35" cy="42" r="2.5" fill="#0D9488" opacity="0.9" />
      <circle cx="24" cy="44" r="2"   fill="#115E59" opacity="0.9" />
    </svg>
  );
}
