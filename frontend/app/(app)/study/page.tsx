"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CapybaraMascot from "@/components/CapybaraMascot";
import {
  Brain, TrendingUp, AlertTriangle, Target, ChevronRight,
  Zap, BarChart2, RefreshCw, ArrowUpRight, ArrowDownRight
} from "lucide-react";

const WEAK_OPENINGS = [
  { name: "Caro-Kann Defense",   winRate: 28, games: 14, trend: "down" },
  { name: "French Defense",      winRate: 33, games: 9,  trend: "down" },
  { name: "King's Indian Attack", winRate: 45, games: 22, trend: "up"  },
];

const STRONG_OPENINGS = [
  { name: "Sicilian Najdorf",   winRate: 72, games: 31, trend: "up"   },
  { name: "Italian Game",       winRate: 68, games: 19, trend: "up"   },
  { name: "Queen's Gambit Dec.", winRate: 61, games: 12, trend: "down" },
];

const STUDY_MODULES = [
  {
    id: 1, title: "Fix Your Caro-Kann",     type: "Weakness",  xp: 40,
    description: "You've lost 72% of your games with the Caro-Kann. Let's fix that.",
    icon: AlertTriangle, color: "bg-danger/10 border-danger/30", iconColor: "text-danger",
    lessons: [
      "Why your 3...c5 plan is failing",
      "Classical vs Advance variation",
      "Key pawn structures",
      "Model games analysis",
    ],
    progress: 0,
  },
  {
    id: 2, title: "Tactical Patterns",     type: "Tactics",   xp: 30,
    description: "You missed 8 forks and 5 pins in your last 20 games.",
    icon: Brain, color: "bg-primary/10 border-primary/30", iconColor: "text-primary",
    lessons: ["Fork puzzles (lvl 1)", "Pin tactics drill", "Skewer patterns", "Mixed tactics"],
    progress: 50,
  },
  {
    id: 3, title: "Endgame Technique",     type: "Endgame",   xp: 35,
    description: "You converted only 40% of winning endgame positions.",
    icon: Target, color: "bg-sage/10 border-sage/30", iconColor: "text-sage",
    lessons: ["King + Pawn vs King", "Rook endgames", "Opposition & zugzwang", "Practical technique"],
    progress: 25,
  },
];

const RECENT_GAMES = [
  { opponent: "DragonSlayer99", result: "Win",  opening: "Sicilian Najdorf",  accuracy: 87, date: "Apr 17" },
  { opponent: "KnightRider42",  result: "Loss", opening: "Caro-Kann Defense", accuracy: 62, date: "Apr 17" },
  { opponent: "PawnPusher7",    result: "Win",  opening: "Italian Game",      accuracy: 79, date: "Apr 16" },
  { opponent: "ChessWizard",    result: "Draw", opening: "French Defense",    accuracy: 71, date: "Apr 16" },
  { opponent: "RookMaster",     result: "Loss", opening: "King's Gambit",     accuracy: 55, date: "Apr 15" },
];

export default function StudyPage() {
  const [activeModule, setActiveModule] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [capyMessage] = useState("I've analyzed your last 50 games. Here's where we need to work! 🔍");

  const handleSync = async () => {
    setSyncing(true);
    await new Promise((r) => setTimeout(r, 2000));
    setSyncing(false);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-text flex items-center gap-2">
            <Brain className="text-primary" size={28} />
            Personalized Study
          </h1>
          <p className="text-text-muted mt-1">Based on your chess.com games — AI-powered insights.</p>
        </div>
        <div className="flex items-start gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={syncing}
            className="flex-shrink-0"
          >
            <motion.div animate={syncing ? { rotate: 360 } : {}} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
              <RefreshCw size={14} />
            </motion.div>
            {syncing ? "Syncing..." : "Sync games"}
          </Button>
          <CapybaraMascot mood="working" size={90} message={capyMessage} />
        </div>
      </motion.div>

      <Tabs defaultValue="plan">
        <TabsList className="mb-6">
          <TabsTrigger value="plan">Study Plan</TabsTrigger>
          <TabsTrigger value="analysis">Game Analysis</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>

        {/* Study Plan Tab */}
        <TabsContent value="plan">
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-4">
              {STUDY_MODULES.map((mod, i) => (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md border ${
                      activeModule === mod.id ? "border-primary shadow-md" : mod.color
                    }`}
                    onClick={() => setActiveModule(activeModule === mod.id ? null : mod.id)}
                  >
                    <CardContent className="pt-5">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-[var(--radius-sm)] ${mod.color} border flex items-center justify-center flex-shrink-0`}>
                          <mod.icon size={20} className={mod.iconColor} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-text">{mod.title}</h3>
                              <Badge variant="outline">{mod.type}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="default"><Zap size={10} />+{mod.xp} XP</Badge>
                              <motion.div
                                animate={{ rotate: activeModule === mod.id ? 90 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronRight size={16} className="text-text-muted" />
                              </motion.div>
                            </div>
                          </div>
                          <p className="text-sm text-text-muted mb-3">{mod.description}</p>
                          <div className="flex items-center gap-2">
                            <Progress value={mod.progress} className="flex-1 h-1.5" shimmer={mod.progress > 0} />
                            <span className="text-xs text-text-muted">{mod.progress}%</span>
                          </div>
                        </div>
                      </div>

                      <AnimatePresence>
                        {activeModule === mod.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4 pt-4 border-t border-border space-y-2">
                              {mod.lessons.map((lesson, li) => (
                                <motion.div
                                  key={lesson}
                                  initial={{ opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: li * 0.06 }}
                                  className="flex items-center gap-3 p-3 rounded-[var(--radius-sm)] bg-surface-alt border border-border hover:border-primary/40 cursor-pointer transition-colors group"
                                >
                                  <div className="w-6 h-6 rounded-full bg-border text-text-muted flex items-center justify-center text-xs font-bold group-hover:bg-primary group-hover:text-white transition-colors">
                                    {li + 1}
                                  </div>
                                  <span className="text-sm text-text flex-1">{lesson}</span>
                                  <ChevronRight size={14} className="text-text-muted group-hover:text-primary transition-colors" />
                                </motion.div>
                              ))}
                            </div>
                            <Button variant="default" size="sm" className="w-full mt-4">
                              Start Module
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Sidebar stats */}
            <div className="space-y-5">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-success" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {STRONG_OPENINGS.map((o) => (
                    <div key={o.name} className="flex items-center gap-2">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-text truncate">{o.name}</p>
                        <p className="text-xs text-text-muted">{o.games} games</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-success">{o.winRate}%</span>
                        {o.trend === "up"
                          ? <ArrowUpRight size={12} className="text-success" />
                          : <ArrowDownRight size={12} className="text-danger" />
                        }
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-danger" />
                    Weaknesses
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {WEAK_OPENINGS.map((o) => (
                    <div key={o.name} className="flex items-center gap-2">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-text truncate">{o.name}</p>
                        <p className="text-xs text-text-muted">{o.games} games</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-danger">{o.winRate}%</span>
                        {o.trend === "up"
                          ? <ArrowUpRight size={12} className="text-success" />
                          : <ArrowDownRight size={12} className="text-danger" />
                        }
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Game Analysis Tab */}
        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 size={18} className="text-primary" />
                Recent Games
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {RECENT_GAMES.map((game, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-4 p-4 rounded-[var(--radius-sm)] border border-border bg-surface hover:border-primary/40 hover:shadow-sm transition-all duration-200 cursor-pointer group"
                  >
                    <div className={`w-16 text-center py-1 rounded-full text-xs font-bold ${
                      game.result === "Win"  ? "bg-success/20 text-success border border-success/30" :
                      game.result === "Loss" ? "bg-danger/20 text-danger border border-danger/30" :
                      "bg-gold/20 text-olive border border-gold/30"
                    }`}>
                      {game.result}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-text">vs {game.opponent}</p>
                      <p className="text-xs text-text-muted">{game.opening}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-text">{game.accuracy}%</p>
                      <p className="text-xs text-text-muted">accuracy</p>
                    </div>
                    <p className="text-xs text-text-muted w-12 text-right">{game.date}</p>
                    <ChevronRight size={14} className="text-text-muted group-hover:text-primary transition-colors" />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats">
          <div className="grid grid-cols-2 gap-6">
            {[
              { label: "Win Rate",       value: "57%",  sub: "+3% this month",   color: "text-success"  },
              { label: "Avg Accuracy",   value: "71%",  sub: "Top 30% of users", color: "text-primary"  },
              { label: "Puzzle Rating",  value: "1340", sub: "↑ 60 pts this week", color: "text-accent"  },
              { label: "Games Analyzed", value: "148",  sub: "Last 90 days",     color: "text-text"     },
            ].map(({ label, value, sub, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-6">
                  <p className="text-text-muted text-sm mb-1">{label}</p>
                  <p className={`text-4xl font-bold ${color} mb-1`}>{value}</p>
                  <p className="text-xs text-text-muted">{sub}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
