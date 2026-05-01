"use client";
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { Chess } from "chess.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CapybaraMascot, { type CapyMood } from "@/components/CapybaraMascot";
import {
  RotateCcw, Flag, Lightbulb, ChevronLeft, ChevronRight,
  Clock, Swords, Copy, Check
} from "lucide-react";

const Chessboard = dynamic(() => import("react-chessboard").then(m => m.Chessboard), { ssr: false });

type PieceDropHandlerArgs = {
  piece: { isSparePiece: boolean; position: string; pieceType: string };
  sourceSquare: string;
  targetSquare: string | null;
};

type Difficulty = "Beginner" | "Intermediate" | "Advanced";
type GameResult = "win" | "loss" | "draw" | null;

const DIFF_DEPTH: Record<Difficulty, number> = {
  Beginner:     1,
  Intermediate: 2,
  Advanced:     3,
};

const DIFF_MESSAGES: Record<Difficulty, string> = {
  Beginner:     "Take your time, I won't bite! 🐾",
  Intermediate: "Now we're talking! Show me what you've got 💪",
  Advanced:     "Bring it on — I'm at full strength! 🔥",
};

const RESULT_MESSAGES: Record<string, string> = {
  win:  "You beat me! I'll have to study harder! 👑",
  loss: "I got you this time, but practice makes perfect! 📚",
  draw: "A hard-fought draw! Well played! 🤝",
};

function makeRandomMove(game: Chess): Chess | null {
  const moves = game.moves();
  if (moves.length === 0) return null;
  const next = new Chess(game.fen());
  next.move(moves[Math.floor(Math.random() * moves.length)]);
  return next;
}

function makeWeightedMove(game: Chess, depth: number): Chess | null {
  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return null;

  // Prefer captures and checks for higher difficulties
  const captures = moves.filter(m => m.flags.includes("c") || m.flags.includes("e"));
  const checks   = moves.filter(m => {
    const test = new Chess(game.fen());
    test.move(m);
    return test.inCheck();
  });

  let candidates = depth >= 2 && (captures.length + checks.length) > 0
    ? [...captures, ...checks]
    : moves;

  const chosen = candidates[Math.floor(Math.random() * candidates.length)];
  const next = new Chess(game.fen());
  next.move(chosen);
  return next;
}

export default function PlayPage() {
  const [game, setGame]               = useState(new Chess());
  const [playerColor, setPlayerColor] = useState<"white" | "black">("white");
  const [difficulty, setDifficulty]   = useState<Difficulty>("Beginner");
  const [gameStarted, setGameStarted] = useState(false);
  const [gameResult, setGameResult]   = useState<GameResult>(null);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [capyMood, setCapyMood]       = useState<CapyMood>("teaching");
  const [capyMessage, setCapyMessage] = useState("Choose your settings and let's play! ♟️");
  const [hint, setHint]               = useState<string | null>(null);
  const [copied, setCopied]           = useState(false);
  const [thinking, setThinking]       = useState(false);

  const checkGameOver = useCallback((g: Chess): GameResult => {
    if (g.isCheckmate()) return g.turn() === (playerColor[0] as "w" | "b") ? "loss" : "win";
    if (g.isDraw() || g.isStalemate() || g.isInsufficientMaterial() || g.isThreefoldRepetition()) return "draw";
    return null;
  }, [playerColor]);

  const triggerEngineMove = useCallback(async (currentGame: Chess) => {
    setThinking(true);
    setCapyMessage("Hmm, let me think... 🤔");
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 600));

    const next = DIFF_DEPTH[difficulty] === 1
      ? makeRandomMove(currentGame)
      : makeWeightedMove(currentGame, DIFF_DEPTH[difficulty]);

    setThinking(false);

    if (!next) return;

    const result = checkGameOver(next);
    setGame(next);
    setMoveHistory(next.history());

    if (result) {
      setGameResult(result);
      setCapyMood(result === "win" ? "crown" : result === "loss" ? "sleeping" : "celebration");
      setCapyMessage(RESULT_MESSAGES[result]);
    } else {
      setCapyMood("teaching");
      setCapyMessage(next.inCheck() ? "Check! Be careful! ⚠️" : DIFF_MESSAGES[difficulty]);
    }
  }, [difficulty, checkGameOver]);

  const onDrop = useCallback(({ sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
    if (!targetSquare) return false;
    if (gameResult || !gameStarted || thinking) return false;
    if (game.turn() !== playerColor[0]) return false;

    const next = new Chess(game.fen());
    let move;
    try {
      move = next.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
    } catch {
      return false;
    }
    if (!move) return false;

    const result = checkGameOver(next);
    setGame(next);
    setMoveHistory(next.history());
    setHint(null);

    if (result) {
      setGameResult(result);
      setCapyMood(result === "win" ? "crown" : result === "loss" ? "sleeping" : "celebration");
      setCapyMessage(RESULT_MESSAGES[result]);
    } else {
      setTimeout(() => triggerEngineMove(next), 100);
    }

    return true;
  }, [game, gameResult, gameStarted, thinking, playerColor, checkGameOver, triggerEngineMove]);

  const startGame = () => {
    const fresh = new Chess();
    setGame(fresh);
    setMoveHistory([]);
    setGameResult(null);
    setHint(null);
    setCapyMood("teaching");
    setCapyMessage(DIFF_MESSAGES[difficulty]);
    setGameStarted(true);

    // If player chose black, engine plays first
    if (playerColor === "black") {
      setTimeout(() => triggerEngineMove(fresh), 500);
    }
  };

  const resign = () => {
    setGameResult("loss");
    setCapyMood("sleeping");
    setCapyMessage("Don't give up so easily! Rematch? 🐾");
  };

  const getHint = () => {
    const moves = game.moves({ verbose: true });
    if (moves.length === 0) return;
    const captures = moves.filter(m => m.flags.includes("c"));
    const best = captures.length > 0 ? captures[0] : moves[Math.floor(Math.random() * moves.length)];
    setHint(`Try: ${best.san}`);
    setCapyMessage(`Psst... ${best.san} looks promising! 🤫`);
  };

  const copyPGN = () => {
    navigator.clipboard.writeText(game.pgn());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Pair moves for display
  const movePairs: [string, string | undefined][] = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    movePairs.push([moveHistory[i], moveHistory[i + 1]]);
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-text flex items-center gap-2">
            <Swords className="text-primary" size={28} />
            Chess Engine
          </h1>
          <p className="text-text-muted mt-1">Play against the Capybara engine and review your games.</p>
        </div>
        <CapybaraMascot mood={capyMood} size={90} message={capyMessage} />
      </motion.div>

      <div className="flex gap-6">
        {/* Board */}
        <div className="flex-shrink-0">
          <div className="w-[520px]">
            {/* Opponent info */}
            <div className="flex items-center gap-3 mb-3 px-1">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-border bg-white">
                <img
                  src={thinking ? "/images/WorkingCapybara.png" : "/images/PleasedCapybara.png"}
                  alt="engine"
                  className="w-full h-full object-contain p-0.5"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-text">Capy Engine</p>
                <Badge variant={difficulty === "Beginner" ? "sage" : difficulty === "Intermediate" ? "accent" : "default"}>
                  {difficulty}
                </Badge>
              </div>
              {thinking && (
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="ml-auto flex items-center gap-1 text-xs text-text-muted"
                >
                  <Clock size={12} />
                  Thinking...
                </motion.div>
              )}
            </div>

            {/* Board */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-[var(--radius)] overflow-hidden shadow-lg border border-border"
            >
              <Chessboard
                options={{
                  position: game.fen(),
                  onPieceDrop: onDrop,
                  boardOrientation: playerColor,
                  boardStyle: { width: 520, height: 520 },
                  darkSquareStyle:  { backgroundColor: "#75B09C" },
                  lightSquareStyle: { backgroundColor: "#D8F793" },
                  allowDragging: gameStarted && !gameResult && !thinking,
                }}
              />
            </motion.div>

            {/* Player info */}
            <div className="flex items-center gap-3 mt-3 px-1">
              <div className="w-8 h-8 rounded-full bg-sage/30 border border-border flex items-center justify-center text-sm font-bold text-text">
                U
              </div>
              <div>
                <p className="text-sm font-semibold text-text">You ({playerColor})</p>
                <p className="text-xs text-text-muted">{moveHistory.length} moves played</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-5">
          {/* Game setup */}
          <AnimatePresence>
            {!gameStarted && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Game Setup</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div>
                      <p className="text-sm font-medium text-text mb-2">Difficulty</p>
                      <div className="flex gap-2">
                        {(["Beginner", "Intermediate", "Advanced"] as Difficulty[]).map((d) => (
                          <button
                            key={d}
                            onClick={() => { setDifficulty(d); setCapyMessage(DIFF_MESSAGES[d]); }}
                            className={`flex-1 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium border transition-all cursor-pointer ${
                              difficulty === d
                                ? "bg-primary text-white border-primary shadow-sm"
                                : "bg-surface border-border text-text-muted hover:border-primary/40"
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-text mb-2">Play as</p>
                      <div className="flex gap-2">
                        {(["white", "black"] as const).map((c) => (
                          <button
                            key={c}
                            onClick={() => setPlayerColor(c)}
                            className={`flex-1 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium border transition-all cursor-pointer capitalize ${
                              playerColor === c
                                ? "bg-primary text-white border-primary shadow-sm"
                                : "bg-surface border-border text-text-muted hover:border-primary/40"
                            }`}
                          >
                            {c === "white" ? "♔" : "♚"} {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button variant="default" size="lg" className="w-full" onClick={startGame}>
                      <Swords size={16} />
                      Start Game
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Game over card */}
          <AnimatePresence>
            {gameResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className={`border-2 ${
                  gameResult === "win"  ? "border-success bg-success/5" :
                  gameResult === "loss" ? "border-danger bg-danger/5"   :
                  "border-gold bg-gold/5"
                }`}>
                  <CardContent className="pt-5 text-center">
                    <p className="text-3xl mb-2">{gameResult === "win" ? "🏆" : gameResult === "loss" ? "😢" : "🤝"}</p>
                    <p className="font-bold text-text text-lg capitalize">{gameResult}!</p>
                    <p className="text-sm text-text-muted mb-4">{moveHistory.length} moves played</p>
                    <div className="flex gap-2">
                      <Button variant="default" size="sm" className="flex-1" onClick={startGame}>
                        <RotateCcw size={14} /> Rematch
                      </Button>
                      <Button variant="outline" size="sm" onClick={copyPGN}>
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? "Copied!" : "Copy PGN"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* In-game controls */}
          {gameStarted && !gameResult && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <CardContent className="pt-5 space-y-3">
                  <Button variant="lime" size="sm" className="w-full" onClick={getHint} disabled={thinking}>
                    <Lightbulb size={14} />
                    Get a Hint (-5 XP)
                  </Button>
                  <AnimatePresence>
                    {hint && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="p-3 bg-lime/30 rounded-[var(--radius-sm)] border border-lime text-sm font-mono text-text text-center"
                      >
                        💡 {hint}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <Button variant="danger" size="sm" className="w-full" onClick={resign} disabled={thinking}>
                    <Flag size={14} />
                    Resign
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Move history */}
          {moveHistory.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Move History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-48 overflow-y-auto space-y-1 font-mono text-sm">
                    {movePairs.map(([white, black], i) => (
                      <div key={i} className="flex gap-2 items-center py-0.5">
                        <span className="text-text-muted w-6 text-right">{i + 1}.</span>
                        <span className="flex-1 text-text">{white}</span>
                        <span className="flex-1 text-text-muted">{black ?? ""}</span>
                      </div>
                    ))}
                  </div>
                  {gameStarted && (
                    <Button variant="ghost" size="sm" className="w-full mt-3" onClick={copyPGN}>
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? "Copied!" : "Copy PGN"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
