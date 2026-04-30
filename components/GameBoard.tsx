"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameCell } from "./GameCell";
import { Timer } from "./Timer";
import { ScoreBoard } from "./ScoreBoard";
import { WinPopup } from "./WinPopup";
import { TriviaChallenge } from "./TriviaChallenge";
import { PlayerIcon, AIIcon, FriendIcon } from "./SucoLogo";
import { createEmptyBoard, getBestMove, checkWinner, isBoardFull, type Board } from "@/lib/gameLogic";
import { recordGameResult, getPlayerData, getWeeklyPromoStatus } from "@/lib/storage";
import { sounds } from "@/lib/sounds";
import {
  fetchTriviaFromAPI, fetchSpotifyTrivia, pickFromPool, getRandomTrivia,
  FALLBACK_QUESTIONS, type TriviaQuestion,
} from "@/lib/trivia";
import type { GameMode } from "./LandingScreen";

const GAME_DURATION        = 60;   // 1 minute
const TRIVIA_BONUS         = 15;
const POOL_REFETCH_AT      = 3;

interface GameBoardProps {
  phone: string;
  gameMode: GameMode;
  friendPhone?: string;
  onGoHome: () => void;
}

export function GameBoard({ phone, gameMode, friendPhone, onGoHome }: GameBoardProps) {
  const [board, setBoard]                     = useState<Board>(createEmptyBoard());
  const [isPlayerTurn, setIsPlayerTurn]       = useState(true);   // true = registered user
  const [timeLeft, setTimeLeft]               = useState(GAME_DURATION);
  const [timerPaused, setTimerPaused]         = useState(false);
  const [gameResult, setGameResult]           = useState<"win" | "lose" | "draw" | null>(null);
  const [winningLine, setWinningLine]         = useState<number[]>([]);
  const [sessionWins, setSessionWins]         = useState(0);
  const [sessionLoses, setSessionLoses]       = useState(0);
  const [sessionDraws, setSessionDraws]       = useState(0);
  const [totalWins, setTotalWins]             = useState(0);
  const [weeklyWins, setWeeklyWins]           = useState(0);
  const [promoCode, setPromoCode]             = useState<string | null>(null);
  const [promoJustUnlocked, setPromoJustUnlocked] = useState(false);
  const [promoEarnedThisWeek, setPromoEarnedThisWeek] = useState(false);

  // Trivia pool
  const [triviaPool, setTriviaPool]           = useState<TriviaQuestion[]>([...FALLBACK_QUESTIONS]);
  const [triviaFetching, setTriviaFetching]   = useState(false);
  const [triviaOpen, setTriviaOpen]           = useState(false);
  const [triviaQuestion, setTriviaQuestion]   = useState<TriviaQuestion | null>(null);
  const [askedTriviaIds, setAskedTriviaIds]   = useState<number[]>([]);

  const [statusMsg, setStatusMsg]             = useState("");
  const [showTurnFlash, setShowTurnFlash]     = useState(false);

  const aiTimeoutRef     = useRef<NodeJS.Timeout | null>(null);
  const resultRecordedRef = useRef(false);
  const fetchingRef      = useRef(false);

  // ── Initial load ────────────────────────────────────────────────────────────
  useEffect(() => {
    const data = getPlayerData(phone);
    if (data) setTotalWins(data.totalWins);
    const { weeklyWins: ww, promoEarnedThisWeek: pe, promoCode: pc } = getWeeklyPromoStatus(phone);
    setWeeklyWins(ww);
    setPromoEarnedThisWeek(pe);
    if (pc) setPromoCode(pc);
    updateStatusMsg(true);
    fetchPool();
  }, [phone]); // eslint-disable-line react-hooks/exhaustive-deps

  function updateStatusMsg(isPlayer: boolean) {
    if (gameMode === "ai") {
      setStatusMsg(isPlayer ? "Your move!" : "AI thinking… 🤔");
    } else {
      setStatusMsg(isPlayer ? "Your turn 🥤" : `Friend's turn 🫱`);
    }
  }

  // ── Trivia pool fetch (OpenTDB + Spotify mixed) ────────────────────────────
  async function fetchPool() {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setTriviaFetching(true);
    try {
      // Fetch both sources in parallel; Spotify silently returns [] if unconfigured
      const [otdbQs, spotifyQs] = await Promise.allSettled([
        fetchTriviaFromAPI(15),
        fetchSpotifyTrivia(),
      ]);
      const newQs = [
        ...(otdbQs.status === "fulfilled" ? otdbQs.value : []),
        ...(spotifyQs.status === "fulfilled" ? spotifyQs.value : []),
      ];
      setTriviaPool((prev) => {
        const ids = new Set(prev.map((q) => q.id));
        return [...prev, ...newQs.filter((q) => !ids.has(q.id))];
      });
    } catch { /* fallback already in pool */ }
    finally { setTriviaFetching(false); fetchingRef.current = false; }
  }

  // ── Timer ───────────────────────────────────────────────────────────────────
  const handleTick = useCallback(() => {
    setTimeLeft((t) => {
      if (t <= 1) { endGame("lose"); return 0; }
      return t - 1;
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── End game ────────────────────────────────────────────────────────────────
  function endGame(result: "win" | "lose" | "draw") {
    if (resultRecordedRef.current) return;
    resultRecordedRef.current = true;
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    setTimerPaused(true);
    setGameResult(result);

    const { promoJustUnlocked: unlocked, promoCode: newCode,
            totalWins: newTotal, weeklyWins: newWeekly } = recordGameResult(phone, result);

    if (result === "win")       setSessionWins((w) => w + 1);
    else if (result === "lose") setSessionLoses((l) => l + 1);
    else                        setSessionDraws((d) => d + 1);

    setTotalWins(newTotal);
    setWeeklyWins(newWeekly);
    if (newCode) setPromoCode(newCode);
    if (unlocked) { setPromoJustUnlocked(true); setPromoEarnedThisWeek(true); }

    // Trigger trivia on every WIN or DRAW (not on lose / timeout)
    if (result === "win" || result === "draw") {
      setTimeout(() => openTrivia(), 1800);
    }
  }

  // ── AI move ─────────────────────────────────────────────────────────────────
  function makeAiMove(currentBoard: Board) {
    updateStatusMsg(false);
    aiTimeoutRef.current = setTimeout(() => {
      const move = getBestMove([...currentBoard], "medium");
      if (move === -1) return;
      const nb = [...currentBoard] as Board;
      nb[move] = "ai";
      sounds.aiMove();
      setBoard(nb);
      const result = checkWinner(nb);
      if (result) {
        setWinningLine(result.line); sounds.winLine();
        setTimeout(() => endGame("lose"), 400);
      } else if (isBoardFull(nb)) {
        setTimeout(() => endGame("draw"), 400);
      } else {
        setIsPlayerTurn(true); updateStatusMsg(true);
        setShowTurnFlash(true); setTimeout(() => setShowTurnFlash(false), 800);
      }
    }, 600 + Math.random() * 400);
  }

  // ── Cell click ───────────────────────────────────────────────────────────────
  function handleCellClick(index: number) {
    if (board[index] !== null || gameResult || timerPaused) return;
    // In AI mode, only accept clicks on player's turn
    if (gameMode === "ai" && !isPlayerTurn) return;

    const mark: "player" | "ai" = isPlayerTurn ? "player" : "ai"; // "ai" = friend's mark
    const nb = [...board] as Board;
    nb[index] = mark;
    sounds.place();
    setBoard(nb);

    const result = checkWinner(nb);
    if (result) {
      setWinningLine(result.line); sounds.winLine();
      // In friend mode: player wins if mark === "player", friend wins = "lose" for registered user
      const outcome = mark === "player" ? "win" : "lose";
      setTimeout(() => endGame(outcome), 400);
    } else if (isBoardFull(nb)) {
      setTimeout(() => endGame("draw"), 400);
    } else {
      const nextPlayer = !isPlayerTurn;
      setIsPlayerTurn(nextPlayer);
      if (gameMode === "ai" && !nextPlayer) {
        makeAiMove(nb);
      } else {
        updateStatusMsg(nextPlayer);
        setShowTurnFlash(true); setTimeout(() => setShowTurnFlash(false), 800);
      }
    }
  }

  // ── Trivia ──────────────────────────────────────────────────────────────────
  function openTrivia() {
    setTriviaOpen(true);
    const q = pickFromPool(triviaPool, askedTriviaIds) ?? getRandomTrivia(askedTriviaIds);
    setTriviaQuestion(q);
    const remaining = triviaPool.filter((x) => !askedTriviaIds.includes(x.id)).length;
    if (remaining <= POOL_REFETCH_AT) fetchPool();
  }

  function handleTriviaAnswer(correct: boolean) {
    if (triviaQuestion) setAskedTriviaIds((ids) => [...ids, triviaQuestion.id]);
    if (correct) setTimeLeft((t) => Math.min(t + TRIVIA_BONUS, GAME_DURATION));
    setTriviaOpen(false); setTriviaQuestion(null);
    resetGame();
  }

  function handleTriviaSkip() {
    if (triviaQuestion) setAskedTriviaIds((ids) => [...ids, triviaQuestion.id]);
    setTriviaOpen(false); setTriviaQuestion(null);
    resetGame();
  }

  // ── Play again ──────────────────────────────────────────────────────────────
  function startNextGame() {
    // Trivia already triggered inside endGame; here we just reset the board
    // (trivia overlay handles its own dismiss via handleTriviaAnswer/Skip)
    resetGame();
  }

  function resetGame() {
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    resultRecordedRef.current = false;
    setBoard(createEmptyBoard());
    setIsPlayerTurn(true);
    setWinningLine([]);
    setGameResult(null);
    setPromoJustUnlocked(false);
    updateStatusMsg(true);
    setTimerPaused(false);
  }

  // ── Turn label ───────────────────────────────────────────────────────────────
  const turnIcon = isPlayerTurn
    ? <PlayerIcon size={22} />
    : gameMode === "friend" ? <FriendIcon size={22} /> : <AIIcon size={22} />;

  const turnBorder = isPlayerTurn
    ? "bg-suco-plum/10 border-suco-plum/30 text-suco-plum"
    : gameMode === "friend"
    ? "bg-teal-50 border-teal-400/40 text-teal-600"
    : "bg-suco-gold/10 border-suco-gold/30 text-suco-gold";

  return (
    <div className="min-h-screen bg-suco-cream flex flex-col items-center justify-start p-4 pt-6">
      <div className="w-full max-w-sm space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={onGoHome}
            className="p-2 rounded-xl bg-white/50 hover:bg-white/80 text-suco-mid hover:text-suco-dark transition-all text-sm border border-suco-border/40 shadow-sm">
            ← Home
          </button>
          <div className="text-center">
            <p className="text-xs text-suco-muted">
              {gameMode === "friend" ? "Pass & Play 👥" : "vs AI 🤖"}
            </p>
            <div className="flex items-center gap-1 justify-center">
              <PlayerIcon size={16} />
              <span className="text-xs text-suco-plum font-bold">{phone.slice(-8)}</span>
              {gameMode === "friend" && friendPhone && (
                <>
                  <span className="text-suco-muted text-xs mx-0.5">vs</span>
                  <FriendIcon size={16} />
                  <span className="text-xs text-teal-600 font-bold">{friendPhone.slice(-8)}</span>
                </>
              )}
            </div>
          </div>
          <div className="w-14 flex justify-end">
            {triviaFetching && (
              <div title="Loading trivia…" className="w-4 h-4 border-2 border-suco-plum border-t-transparent rounded-full animate-spin opacity-40" />
            )}
          </div>
        </div>

        {/* Turn indicator + Timer */}
        <div className="flex items-center justify-between">
          <motion.div
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all ${turnBorder}`}
            animate={{ scale: showTurnFlash ? [1, 1.06, 1] : 1 }}
          >
            {turnIcon}
            <span className="text-xs font-bold truncate max-w-[90px]">{statusMsg}</span>
          </motion.div>
          <Timer seconds={timeLeft} totalSeconds={GAME_DURATION} onTick={handleTick} paused={timerPaused || !!gameResult} />
        </div>

        {/* Board */}
        <motion.div className="grid grid-cols-3 gap-2 p-3 bg-suco-beige/50 rounded-3xl border border-suco-border/40 shadow-sm"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {board.map((cell, i) => (
            <GameCell key={i} value={cell} index={i}
              isWinningCell={winningLine.includes(i)}
              onClick={handleCellClick}
              disabled={!!gameResult || timerPaused}
            />
          ))}
        </motion.div>

        {/* Legend */}
        <div className="flex justify-center gap-6 text-xs text-suco-muted">
          <div className="flex items-center gap-1.5"><PlayerIcon size={16} /><span className="font-medium">You</span></div>
          <div className="h-4 w-px bg-suco-border/50" />
          <div className="flex items-center gap-1.5">
            {gameMode === "friend" ? <FriendIcon size={16} /> : <AIIcon size={16} />}
            <span className="font-medium">{gameMode === "friend" ? "Friend" : "AI"}</span>
          </div>
        </div>

        {/* Scoreboard */}
        <ScoreBoard
          playerWins={sessionWins} aiWins={sessionLoses} draws={sessionDraws}
          weeklyWins={weeklyWins} gameMode={gameMode} friendPhone={friendPhone}
          promoEarnedThisWeek={promoEarnedThisWeek}
        />
      </div>

      {/* Win/Lose popup */}
      <WinPopup
        result={gameResult}
        promoCode={promoCode}
        promoJustUnlocked={promoJustUnlocked}
        totalWins={totalWins}
        onPlayAgain={startNextGame}
        onGoHome={onGoHome}
      />

      {/* Trivia challenge (shows after every win or draw) */}
      <AnimatePresence>
        {triviaOpen && (
          <TriviaChallenge
            question={triviaQuestion}
            loading={triviaQuestion === null}
            onAnswer={handleTriviaAnswer}
            onSkip={handleTriviaSkip}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
