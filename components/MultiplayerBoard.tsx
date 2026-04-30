"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameCell } from "./GameCell";
import { Timer } from "./Timer";
import { WinPopup } from "./WinPopup";
import { TriviaChallenge } from "./TriviaChallenge";
import { PlayerIcon, FriendIcon } from "./SucoLogo";
import { recordGameResult, getWeeklyPromoStatus } from "@/lib/storage";
import { sounds } from "@/lib/sounds";
import type { Board, Cell } from "@/lib/gameLogic";
import type { GameRoom, CellMark } from "@/lib/roomStore";
import {
  fetchTriviaFromAPI, fetchSpotifyTrivia, pickFromPool, getRandomTrivia,
  FALLBACK_QUESTIONS, type TriviaQuestion,
} from "@/lib/trivia";

const GAME_DURATION   = 60;
const TRIVIA_BONUS    = 15;
const POLL_INTERVAL   = 1500; // ms

interface MultiplayerBoardProps {
  roomId: string;
  myPhone: string;
  myMark: "p1" | "p2";
  opponentPhone: string;
  onGoHome: () => void;
}

// Map API board to Cell[] for GameCell rendering
function toDisplayBoard(board: CellMark[], myMark: "p1" | "p2"): Board {
  return board.map((c) => {
    if (c === null) return null;
    return c === myMark ? "player" : "ai"; // "player"=me, "ai"=opponent
  }) as Board;
}

export function MultiplayerBoard({ roomId, myPhone, myMark, opponentPhone, onGoHome }: MultiplayerBoardProps) {
  const [room, setRoom]             = useState<GameRoom | null>(null);
  const [timeLeft, setTimeLeft]     = useState(GAME_DURATION);
  const [timerPaused, setTimerPaused] = useState(false);

  // local result state (derived from room.winner)
  const [displayResult, setDisplayResult] = useState<"win" | "lose" | "draw" | null>(null);
  const [promoCode, setPromoCode]         = useState<string | null>(null);
  const [promoJustUnlocked, setPromoJustUnlocked] = useState(false);
  const [totalWins, setTotalWins]         = useState(0);

  // Trivia
  const [triviaPool, setTriviaPool]         = useState<TriviaQuestion[]>([...FALLBACK_QUESTIONS]);
  const [triviaFetching, setTriviaFetching] = useState(false);
  const [triviaOpen, setTriviaOpen]         = useState(false);
  const [triviaQuestion, setTriviaQuestion] = useState<TriviaQuestion | null>(null);
  const [askedIds, setAskedIds]             = useState<number[]>([]);

  const [sessionWins, setSessionWins] = useState(0);
  const [sessionLoses, setSessionLoses] = useState(0);
  const [statusMsg, setStatusMsg]     = useState("Waiting…");
  const [flash, setFlash]             = useState(false);

  const pollRef      = useRef<NodeJS.Timeout | null>(null);
  const timerRef     = useRef<NodeJS.Timeout | null>(null);
  const resultDoneRef = useRef(false);
  const fetchingRef  = useRef(false);
  const prevStatusRef = useRef<GameRoom["status"] | null>(null);

  // ── Trivia pool ─────────────────────────────────────────────────────────────
  useEffect(() => { fetchPool(); }, []); // eslint-disable-line

  async function fetchPool() {
    if (fetchingRef.current) return;
    fetchingRef.current = true; setTriviaFetching(true);
    try {
      // Fetch OpenTDB + Spotify in parallel; Spotify silently returns [] if unconfigured
      const [otdbQs, spotifyQs] = await Promise.allSettled([
        fetchTriviaFromAPI(15),
        fetchSpotifyTrivia(),
      ]);
      const newQs = [
        ...(otdbQs.status === "fulfilled" ? otdbQs.value : []),
        ...(spotifyQs.status === "fulfilled" ? spotifyQs.value : []),
      ];
      setTriviaPool((p) => { const ids = new Set(p.map((q) => q.id)); return [...p, ...newQs.filter((q) => !ids.has(q.id))]; });
    } catch {}
    finally { setTriviaFetching(false); fetchingRef.current = false; }
  }

  // ── Load initial promo state ────────────────────────────────────────────────
  useEffect(() => {
    const { promoCode: pc, promoEarnedThisWeek } = getWeeklyPromoStatus(myPhone);
    if (pc && promoEarnedThisWeek) setPromoCode(pc);
  }, [myPhone]);

  // ── Polling ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    poll();
    pollRef.current = setInterval(poll, POLL_INTERVAL);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []); // eslint-disable-line

  async function poll() {
    try {
      const res = await fetch(`/api/rooms/${roomId}`);
      if (!res.ok) return;
      const data: GameRoom = await res.json();
      setRoom(data);

      // Transition: waiting → playing
      if (prevStatusRef.current === "waiting" && data.status === "playing") {
        sounds.click();
        setTimerPaused(false);
      }
      prevStatusRef.current = data.status;

      // Update status message
      if (data.status === "waiting") setStatusMsg("Waiting for friend…");
      else if (data.status === "finished") setTimerPaused(true);
      else if (data.turn === myMark) { setStatusMsg("Your turn! 🥤"); setFlash(true); setTimeout(() => setFlash(false), 700); }
      else setStatusMsg("Opponent's turn…");

      // Handle game end
      if (data.status === "finished" && !resultDoneRef.current) {
        resultDoneRef.current = true;
        if (pollRef.current) clearInterval(pollRef.current);
        const myResult: "win" | "lose" | "draw" =
          data.winner === "draw" ? "draw" :
          data.winner === myMark ? "win" : "lose";
        setDisplayResult(myResult);
        const { promoJustUnlocked: unlocked, promoCode: newCode, totalWins: newTotal } =
          recordGameResult(myPhone, myResult);
        setTotalWins(newTotal);
        if (newCode) setPromoCode(newCode);
        if (unlocked) setPromoJustUnlocked(true);
        if (myResult === "win") setSessionWins((w) => w + 1);
        else if (myResult === "lose") setSessionLoses((l) => l + 1);
        // Trigger trivia on win or draw
        if (myResult === "win" || myResult === "draw") setTimeout(() => openTrivia(), 1800);
      }
    } catch {}
  }

  // ── Timer ───────────────────────────────────────────────────────────────────
  const handleTick = useCallback(() => {
    setTimeLeft((t) => {
      if (t <= 1) { handleTimeout(); return 0; }
      return t - 1;
    });
  }, []); // eslint-disable-line

  async function handleTimeout() {
    if (resultDoneRef.current) return;
    resultDoneRef.current = true;
    setTimerPaused(true);
    setDisplayResult("lose");
    recordGameResult(myPhone, "lose");
    setSessionLoses((l) => l + 1);
  }

  // ── Cell click ───────────────────────────────────────────────────────────────
  async function handleCellClick(index: number) {
    if (!room || room.status !== "playing" || room.turn !== myMark) return;
    if (room.board[index] !== null) return;
    sounds.place();
    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "move", cellIndex: index, player: myMark }),
      });
      if (res.ok) { const updated = await res.json(); setRoom(updated); }
    } catch {}
  }

  // ── Play again ──────────────────────────────────────────────────────────────
  async function handlePlayAgain() {
    if (!room) return;
    resultDoneRef.current = false;
    setDisplayResult(null);
    setPromoJustUnlocked(false);
    setTimeLeft(GAME_DURATION);
    setTimerPaused(false);
    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      if (res.ok) {
        const updated = await res.json();
        setRoom(updated);
        // Resume polling
        pollRef.current = setInterval(poll, POLL_INTERVAL);
      }
    } catch {}
  }

  // ── Trivia ──────────────────────────────────────────────────────────────────
  function openTrivia() {
    setTriviaOpen(true);
    const q = pickFromPool(triviaPool, askedIds) ?? getRandomTrivia(askedIds);
    setTriviaQuestion(q);
  }
  function handleTriviaAnswer(correct: boolean) {
    if (triviaQuestion) setAskedIds((ids) => [...ids, triviaQuestion.id]);
    if (correct) setTimeLeft((t) => Math.min(t + TRIVIA_BONUS, GAME_DURATION));
    setTriviaOpen(false); setTriviaQuestion(null);
  }
  function handleTriviaSkip() {
    if (triviaQuestion) setAskedIds((ids) => [...ids, triviaQuestion.id]);
    setTriviaOpen(false); setTriviaQuestion(null);
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  const displayBoard: Board = room ? toDisplayBoard(room.board, myMark) : Array(9).fill(null) as Board;
  const winningLine = room?.winningLine ?? [];
  const isMyTurn    = room?.status === "playing" && room?.turn === myMark;
  const isWaiting   = !room || room.status === "waiting";

  const opponentLabel = opponentPhone.slice(-8);

  return (
    <div className="min-h-screen bg-suco-cream flex flex-col items-center justify-start p-4 pt-6">
      <div className="w-full max-w-sm space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={onGoHome}
            className="p-2 rounded-xl bg-white/50 hover:bg-white/80 text-suco-mid text-sm border border-suco-border/40 shadow-sm transition-all">
            ← Home
          </button>
          <div className="text-center">
            <p className="text-xs text-suco-muted font-medium">👥 vs Friend</p>
            <div className="flex items-center gap-1 justify-center mt-0.5">
              <PlayerIcon size={15} />
              <span className="text-[11px] text-suco-plum font-bold">{myPhone.slice(-8)}</span>
              <span className="text-suco-muted text-[10px] mx-0.5">vs</span>
              <FriendIcon size={15} />
              <span className="text-[11px] text-teal-600 font-bold">{opponentLabel}</span>
            </div>
          </div>
          <div className="w-14 flex justify-end">
            {triviaFetching && <div className="w-4 h-4 border-2 border-suco-plum border-t-transparent rounded-full animate-spin opacity-40" />}
          </div>
        </div>

        {/* Waiting overlay */}
        <AnimatePresence>
          {isWaiting && (
            <motion.div className="bg-white/80 border border-suco-plum/20 rounded-2xl p-5 text-center shadow-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-3xl mb-2">⏳</div>
              <p className="font-bold text-suco-dark text-sm">Waiting for your friend…</p>
              <p className="text-xs text-suco-muted mt-1">Share the link so they can join</p>
              <div className="flex justify-center mt-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div key={i} className="w-2 h-2 bg-suco-plum rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Turn indicator + Timer */}
        <div className="flex items-center justify-between">
          <motion.div
            animate={{ scale: flash ? [1, 1.06, 1] : 1 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all ${
              isMyTurn
                ? "bg-suco-plum/10 border-suco-plum/30 text-suco-plum"
                : "bg-teal-50 border-teal-300/40 text-teal-600"
            }`}>
            {isMyTurn ? <PlayerIcon size={22} /> : <FriendIcon size={22} />}
            <span className="text-xs font-bold truncate max-w-[90px]">{statusMsg}</span>
          </motion.div>
          <Timer seconds={timeLeft} totalSeconds={GAME_DURATION} onTick={handleTick}
            paused={timerPaused || isWaiting || !!displayResult} />
        </div>

        {/* Board */}
        <motion.div className="grid grid-cols-3 gap-2 p-3 bg-suco-beige/50 rounded-3xl border border-suco-border/40 shadow-sm"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {displayBoard.map((cell, i) => (
            <GameCell key={i} value={cell} index={i}
              isWinningCell={winningLine.includes(i)}
              onClick={handleCellClick}
              disabled={!isMyTurn || !!displayResult}
            />
          ))}
        </motion.div>

        {/* Legend */}
        <div className="flex justify-center gap-6 text-xs text-suco-muted">
          <div className="flex items-center gap-1.5"><PlayerIcon size={16} /><span className="font-medium">You</span></div>
          <div className="h-4 w-px bg-suco-border/50" />
          <div className="flex items-center gap-1.5"><FriendIcon size={16} /><span className="font-medium">Friend</span></div>
        </div>

        {/* Session mini-score */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Your wins", val: sessionWins, color: "text-suco-plum" },
            { label: "Friend wins", val: sessionLoses, color: "text-teal-600" },
          ].map(({ label, val, color }) => (
            <div key={label} className="bg-white/60 border border-suco-plum/15 rounded-xl p-3 text-center shadow-sm">
              <p className={`text-2xl font-black tabular-nums ${color}`}>{val}</p>
              <p className="text-xs text-suco-muted uppercase tracking-wide font-semibold">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Win/Lose popup */}
      <WinPopup
        result={displayResult}
        promoCode={promoCode}
        promoJustUnlocked={promoJustUnlocked}
        totalWins={totalWins}
        onPlayAgain={handlePlayAgain}
        onGoHome={onGoHome}
      />

      {/* Trivia */}
      <AnimatePresence>
        {triviaOpen && (
          <TriviaChallenge question={triviaQuestion} loading={triviaQuestion === null}
            onAnswer={handleTriviaAnswer} onSkip={handleTriviaSkip} />
        )}
      </AnimatePresence>
    </div>
  );
}
