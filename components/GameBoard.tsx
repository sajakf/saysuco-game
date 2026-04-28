"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameCell } from "./GameCell";
import { Timer } from "./Timer";
import { ScoreBoard } from "./ScoreBoard";
import { WinPopup } from "./WinPopup";
import { TriviaChallenge } from "./TriviaChallenge";
import { PlayerIcon, AIIcon } from "./SucoLogo";
import { createEmptyBoard, getBestMove, checkWinner, isBoardFull, type Board } from "@/lib/gameLogic";
import { recordGameResult, canPlayToday, getPlayerData } from "@/lib/storage";
import { sounds } from "@/lib/sounds";
import { getRandomTrivia, type TriviaQuestion } from "@/lib/trivia";

const GAME_DURATION = 180;
const TRIVIA_BONUS = 15;
const TRIVIA_EVERY_N_GAMES = 3;

interface GameBoardProps {
  phone: string;
  onGoHome: () => void;
}

export function GameBoard({ phone, onGoHome }: GameBoardProps) {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [timerPaused, setTimerPaused] = useState(false);
  const [gameResult, setGameResult] = useState<"win" | "lose" | "draw" | null>(null);
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [sessionWins, setSessionWins] = useState(0);
  const [sessionLoses, setSessionLoses] = useState(0);
  const [sessionDraws, setSessionDraws] = useState(0);
  const [totalWins, setTotalWins] = useState(0);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [promoJustUnlocked, setPromoJustUnlocked] = useState(false);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [triviaQuestion, setTriviaQuestion] = useState<TriviaQuestion | null>(null);
  const [askedTriviaIds, setAskedTriviaIds] = useState<number[]>([]);
  const [statusMsg, setStatusMsg] = useState("Your move!");
  const [showPlayerTurnFlash, setShowPlayerTurnFlash] = useState(false);
  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resultRecordedRef = useRef(false);

  useEffect(() => {
    const data = getPlayerData(phone);
    if (data) { setTotalWins(data.totalWins); setPromoCode(data.promoCode); }
  }, [phone]);

  const handleTick = useCallback(() => {
    setTimeLeft((t) => {
      if (t <= 1) { endGame("lose", true); return 0; }
      return t - 1;
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function endGame(result: "win" | "lose" | "draw", _fromTimer = false) {
    if (resultRecordedRef.current) return;
    resultRecordedRef.current = true;
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    setTimerPaused(true);
    setGameResult(result);

    const { promoUnlocked, promoCode: newCode, totalWins: newTotal } = recordGameResult(phone, result);
    if (result === "win") setSessionWins((w) => w + 1);
    else if (result === "lose") setSessionLoses((l) => l + 1);
    else setSessionDraws((d) => d + 1);
    setTotalWins(newTotal);
    if (newCode) setPromoCode(newCode);
    if (promoUnlocked && !promoCode) setPromoJustUnlocked(true);
  }

  function makeAiMove(currentBoard: Board) {
    setStatusMsg("AI is thinking... 🤔");
    aiTimeoutRef.current = setTimeout(() => {
      const move = getBestMove([...currentBoard], "medium");
      if (move === -1) return;
      const newBoard = [...currentBoard] as Board;
      newBoard[move] = "ai";
      sounds.aiMove();
      setBoard(newBoard);
      const result = checkWinner(newBoard);
      if (result) {
        setWinningLine(result.line);
        sounds.winLine();
        setTimeout(() => endGame("lose"), 400);
      } else if (isBoardFull(newBoard)) {
        setTimeout(() => endGame("draw"), 400);
      } else {
        setIsPlayerTurn(true);
        setStatusMsg("Your move!");
        setShowPlayerTurnFlash(true);
        setTimeout(() => setShowPlayerTurnFlash(false), 800);
      }
    }, 600 + Math.random() * 400);
  }

  function handleCellClick(index: number) {
    if (!isPlayerTurn || board[index] !== null || gameResult || timerPaused) return;
    const newBoard = [...board] as Board;
    newBoard[index] = "player";
    sounds.place();
    setBoard(newBoard);
    setIsPlayerTurn(false);
    const result = checkWinner(newBoard);
    if (result) {
      setWinningLine(result.line);
      sounds.winLine();
      setTimeout(() => endGame("win"), 400);
    } else if (isBoardFull(newBoard)) {
      setTimeout(() => endGame("draw"), 400);
    } else {
      makeAiMove(newBoard);
    }
  }

  function startNextGame() {
    const nextGameNum = gamesPlayed + 1;
    const { canPlay } = canPlayToday(phone);
    if (!canPlay) { onGoHome(); return; }
    if (nextGameNum % TRIVIA_EVERY_N_GAMES === 0) {
      const q = getRandomTrivia(askedTriviaIds);
      setTriviaQuestion(q);
      setTimerPaused(true);
    } else {
      resetGame();
    }
    setGamesPlayed(nextGameNum);
  }

  function handleTriviaAnswer(correct: boolean) {
    setTriviaQuestion(null);
    if (correct) setTimeLeft((t) => Math.min(t + TRIVIA_BONUS, GAME_DURATION));
    if (triviaQuestion) setAskedTriviaIds((ids) => [...ids, triviaQuestion.id]);
    resetGame();
  }

  function handleTriviaSkip() {
    if (triviaQuestion) setAskedTriviaIds((ids) => [...ids, triviaQuestion.id]);
    setTriviaQuestion(null);
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
    setStatusMsg("Your move!");
    setTimerPaused(false);
  }

  const isDisabled = !isPlayerTurn || !!gameResult;

  return (
    <div className="min-h-screen bg-suco-cream flex flex-col items-center justify-start p-4 pt-6">
      <div className="w-full max-w-sm space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onGoHome}
            className="p-2 rounded-xl bg-white/50 hover:bg-white/80 text-suco-mid hover:text-suco-dark transition-all text-sm border border-suco-border/40 shadow-sm"
          >
            ← Home
          </button>
          <div className="text-center">
            <p className="text-xs text-suco-muted">Playing as</p>
            <div className="flex items-center gap-1 justify-center">
              <PlayerIcon size={18} />
              <span className="text-xs text-suco-plum font-bold">{phone}</span>
            </div>
          </div>
          <div className="w-16" />
        </div>

        {/* Turn indicator + Timer */}
        <div className="flex items-center justify-between">
          <motion.div
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all ${
              isPlayerTurn && !gameResult
                ? "bg-suco-plum/10 border-suco-plum/30 text-suco-plum"
                : "bg-suco-gold/10 border-suco-gold/30 text-suco-gold"
            }`}
            animate={{ scale: showPlayerTurnFlash ? [1, 1.05, 1] : 1 }}
          >
            {isPlayerTurn || gameResult ? <PlayerIcon size={22} /> : <AIIcon size={22} />}
            <span className="text-xs font-bold truncate max-w-[80px]">{statusMsg}</span>
          </motion.div>

          <Timer seconds={timeLeft} totalSeconds={GAME_DURATION} onTick={handleTick} paused={timerPaused || !!gameResult} />
        </div>

        {/* Board */}
        <motion.div
          className="grid grid-cols-3 gap-2 p-3 bg-suco-beige/50 rounded-3xl border border-suco-border/40 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {board.map((cell, i) => (
            <GameCell
              key={i}
              value={cell}
              index={i}
              isWinningCell={winningLine.includes(i)}
              onClick={handleCellClick}
              disabled={isDisabled}
            />
          ))}
        </motion.div>

        {/* Legend */}
        <div className="flex justify-center gap-6 text-xs text-suco-muted">
          <div className="flex items-center gap-1.5">
            <PlayerIcon size={16} />
            <span className="font-medium">You</span>
          </div>
          <div className="h-4 w-px bg-suco-border/50" />
          <div className="flex items-center gap-1.5">
            <AIIcon size={16} />
            <span className="font-medium">AI</span>
          </div>
        </div>

        {/* Score */}
        <ScoreBoard playerWins={sessionWins} aiWins={sessionLoses} draws={sessionDraws} totalWins={totalWins} />
      </div>

      <WinPopup
        result={gameResult}
        promoCode={promoCode}
        promoJustUnlocked={promoJustUnlocked}
        totalWins={totalWins}
        onPlayAgain={startNextGame}
        onGoHome={onGoHome}
      />

      <AnimatePresence>
        {triviaQuestion && (
          <TriviaChallenge question={triviaQuestion} onAnswer={handleTriviaAnswer} onSkip={handleTriviaSkip} />
        )}
      </AnimatePresence>
    </div>
  );
}
