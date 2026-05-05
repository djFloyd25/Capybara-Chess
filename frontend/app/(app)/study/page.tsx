"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CapybaraMascot from "@/components/CapybaraMascot";
import {
  getStudyPlan, generateStudyPlan, ApiError,
  type StudyPlan,
} from "@/lib/api";
import {
  Brain, TrendingUp, AlertTriangle, Target, ChevronRight,
  Zap, BarChart2, RefreshCw, ArrowUpRight, ArrowDownRight, BookOpen,
} from "lucide-react";

const MODULE_STYLE: Record<string, { icon: React.ElementType; color: string; iconColor: string }> = {
  Weakness: { icon: AlertTriangle, color: "bg-danger/10 border-danger/30",   iconColor: "text-danger"  },
  Tactics:  { icon: Brain,         color: "bg-primary/10 border-primary/30", iconColor: "text-primary" },
  Endgame:  { icon: Target,        color: "bg-sage/10 border-sage/30",       iconColor: "text-sage"    },
  Opening:  { icon: BookOpen,      color: "bg-teal/10 border-teal/30",       iconColor: "text-teal"    },
};
const DEFAULT_STYLE = MODULE_STYLE.Tactics;

function normalize(p: StudyPlan): StudyPlan {
  return {
    modules:         p.modules         ?? [],
    weak_openings:   p.weak_openings   ?? [],
    strong_openings: p.strong_openings ?? [],
    stats: p.stats ?? { total_games: 0, win_rate: 0, avg_centipawn_loss: null, avg_accuracy: null },
  };
}

export default function StudyPage() {
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [regenError, setRegenError] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState<number | null>(null);

  useEffect(() => {
    getStudyPlan()
      .then(p => {
        console.log("[study] getStudyPlan returned:", p);
        if (p) {
          const n = normalize(p);
          console.log("[study] after normalize:", n);
          setPlan(n);
        }
      })
      .catch(err => {
        console.error("[study] getStudyPlan on mount failed:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleRegenerate = async () => {
    setSyncing(true);
    setRegenError(null);
    try {
      const p = await generateStudyPlan();
      setPlan(normalize(p));
    } catch (err) {
      console.error("[study] handleRegenerate failed:", err);
      setRegenError(`status=${err instanceof ApiError ? err.status : "?"} — ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSyncing(false);
    }
  };

  const capyMessage = plan
    ? `I've analyzed your ${plan.stats.total_games} games. Here's where we need to work! 🔍`
    : loading
    ? "Loading your study plan..."
    : "Import your games from the home page to get started! 🎯";

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="p-8 max-w-6xl mx-auto flex flex-col items-center justify-center gap-5 h-80">
        <CapybaraMascot mood="working" size={100} message={capyMessage} />
        <p className="text-text-muted text-center text-sm">No study plan yet — import your games first.</p>
        <Link href="/home">
          <Button variant="default">Go to Home to Import Games</Button>
        </Link>
      </div>
    );
  }

  const allOpenings = [
    ...plan.strong_openings.map(o => ({ ...o, strong: true })),
    ...plan.weak_openings.map(o => ({ ...o, strong: false })),
  ].sort((a, b) => b.games - a.games);

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
          <p className="text-text-muted mt-1">
            Based on {plan.stats.total_games} games — AI-powered insights.
          </p>
        </div>
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-end gap-2">
            <Button variant="outline" size="sm" onClick={handleRegenerate} disabled={syncing} className="flex-shrink-0">
              <motion.div
                animate={syncing ? { rotate: 360 } : {}}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw size={14} />
              </motion.div>
              {syncing ? "Regenerating..." : "Regenerate plan"}
            </Button>
            {regenError && (
              <p className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-[var(--radius-sm)] px-3 py-1.5 max-w-xs text-right">
                {regenError}
              </p>
            )}
          </div>
          <CapybaraMascot mood="working" size={90} message={capyMessage} />
        </div>
      </motion.div>

      <Tabs defaultValue="plan">
        <TabsList className="mb-6">
          <TabsTrigger value="plan">Study Plan</TabsTrigger>
          <TabsTrigger value="analysis">Opening Analysis</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>

        {/* ── Study Plan ─────────────────────────────────────── */}
        <TabsContent value="plan">
          <div className="grid grid-cols-3 gap-6">
            {/* Modules */}
            <div className="col-span-2 space-y-4">
              {plan.modules.length === 0 ? (
                <div className="text-center text-text-muted py-12 text-sm">
                  No modules generated. Try re-importing your games.
                </div>
              ) : (
                plan.modules.map((mod, i) => {
                  const style = MODULE_STYLE[mod.type] ?? DEFAULT_STYLE;
                  const Icon = style.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md border ${
                          activeModule === i ? "border-primary shadow-md" : style.color
                        }`}
                        onClick={() => setActiveModule(activeModule === i ? null : i)}
                      >
                        <CardContent className="pt-5">
                          <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-[var(--radius-sm)] ${style.color} border flex items-center justify-center flex-shrink-0`}>
                              <Icon size={20} className={style.iconColor} />
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
                                    animate={{ rotate: activeModule === i ? 90 : 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <ChevronRight size={16} className="text-text-muted" />
                                  </motion.div>
                                </div>
                              </div>
                              <p className="text-sm text-text-muted mb-3">{mod.description}</p>
                              <div className="flex items-center gap-2">
                                <Progress value={0} className="flex-1 h-1.5" />
                                <span className="text-xs text-text-muted">0%</span>
                              </div>
                            </div>
                          </div>

                          <AnimatePresence>
                            {activeModule === i && (
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
                  );
                })
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-success" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {plan.strong_openings.length === 0 ? (
                    <p className="text-xs text-text-muted">Not enough data yet.</p>
                  ) : (
                    plan.strong_openings.map((o) => (
                      <div key={o.name} className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-text truncate">{o.name}</p>
                          <p className="text-xs text-text-muted">{o.games} games</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="text-sm font-bold text-success">{Math.round(o.win_rate * 100)}%</span>
                          <ArrowUpRight size={12} className="text-success" />
                        </div>
                      </div>
                    ))
                  )}
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
                  {plan.weak_openings.length === 0 ? (
                    <p className="text-xs text-text-muted">No major weaknesses found yet.</p>
                  ) : (
                    plan.weak_openings.map((o) => (
                      <div key={o.name} className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-text truncate">{o.name}</p>
                          <p className="text-xs text-text-muted">{o.games} games</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="text-sm font-bold text-danger">{Math.round(o.win_rate * 100)}%</span>
                          <ArrowDownRight size={12} className="text-danger" />
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── Opening Analysis ────────────────────────────────── */}
        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 size={18} className="text-primary" />
                Opening Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {allOpenings.length === 0 ? (
                <p className="text-text-muted text-sm text-center py-8">
                  Not enough games to analyse openings yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {allOpenings.map((o, i) => (
                    <motion.div
                      key={o.name}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-center gap-4 p-4 rounded-[var(--radius-sm)] border border-border bg-surface hover:border-primary/40 hover:shadow-sm transition-all duration-200"
                    >
                      <div className={`w-14 text-center py-1 rounded-full text-xs font-bold flex-shrink-0 ${
                        o.win_rate >= 0.55
                          ? "bg-success/20 text-success border border-success/30"
                          : o.win_rate < 0.45
                          ? "bg-danger/20 text-danger border border-danger/30"
                          : "bg-gold/20 text-olive border border-gold/30"
                      }`}>
                        {Math.round(o.win_rate * 100)}%
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text truncate">{o.name}</p>
                        <p className="text-xs text-text-muted">{o.eco || "—"} · {o.games} games</p>
                      </div>
                      <div className="flex gap-4 text-xs flex-shrink-0">
                        <div className="text-center">
                          <p className="font-bold text-success">{o.wins}</p>
                          <p className="text-text-muted">W</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-text">{o.draws}</p>
                          <p className="text-text-muted">D</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-danger">{o.losses}</p>
                          <p className="text-text-muted">L</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Stats ───────────────────────────────────────────── */}
        <TabsContent value="stats">
          <div className="grid grid-cols-2 gap-6">
            {(({ total_games, win_rate, avg_centipawn_loss, avg_accuracy }) => [
              {
                label: "Win Rate",
                value: `${Math.round(win_rate * 100)}%`,
                sub: `Across ${total_games} games`,
                color: win_rate >= 0.5 ? "text-success" : "text-danger",
              },
              {
                label: "Games Analyzed",
                value: total_games.toString(),
                sub: "Used to build your plan",
                color: "text-primary",
              },
              {
                label: "Avg Centipawn Loss",
                value: avg_centipawn_loss != null ? avg_centipawn_loss.toFixed(0) : "N/A",
                sub: avg_centipawn_loss != null
                  ? avg_centipawn_loss < 40 ? "Excellent accuracy"
                  : avg_centipawn_loss < 70 ? "Good accuracy"
                  : "Room for improvement"
                  : "Stockfish not installed",
                color: avg_centipawn_loss != null
                  ? avg_centipawn_loss < 40 ? "text-success"
                  : avg_centipawn_loss < 70 ? "text-accent"
                  : "text-danger"
                  : "text-text-muted",
              },
              {
                label: "Avg Accuracy",
                value: avg_accuracy != null ? `${Math.round(avg_accuracy)}%` : "N/A",
                sub: avg_accuracy != null ? "Engine-calculated accuracy" : "Stockfish not installed",
                color: "text-text",
              },
            ])(plan.stats).map(({ label, value, sub, color }, i) => (
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
