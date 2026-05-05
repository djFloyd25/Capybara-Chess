"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import CapybaraMascot from "@/components/CapybaraMascot";
import { getUsernameFromToken, getProvider, importGames, generateStudyPlan, getStudyPlan, ApiError, type StudyPlan } from "@/lib/api";
import {
  Flame, Trophy, BookOpen, Brain, Swords, ChevronRight,
  Upload, CheckCircle2, TrendingUp, Calendar, Star, Zap, AlertTriangle, Target
} from "lucide-react";

const MODULE_ICON: Record<string, React.ElementType> = {
  Weakness: AlertTriangle,
  Tactics:  Brain,
  Endgame:  Target,
  Opening:  BookOpen,
};

const PLACEHOLDER_LESSONS = [
  { id: 1, title: "Sicilian Defense",        type: "Opening",  xp: 20, done: false, icon: BookOpen },
  { id: 2, title: "Pin Tactics",             type: "Tactics",  xp: 30, done: false, icon: Brain },
  { id: 3, title: "Rook Endgames",           type: "Endgame",  xp: 25, done: false, icon: Trophy },
  { id: 4, title: "Pawn Structure Analysis", type: "Strategy", xp: 20, done: false, icon: TrendingUp },
];

const STREAK_DAYS = ["M","T","W","T","F","S","S"];
const completedDays = [0, 1, 2, 3, 4];

const ACHIEVEMENTS = [
  { label: "First Win",      icon: "🏆", earned: true  },
  { label: "7-Day Streak",   icon: "🔥", earned: true  },
  { label: "50 Puzzles",     icon: "🧩", earned: false },
  { label: "Opening Master", icon: "📖", earned: false },
];

type Platform = "lichess" | "chess.com";

export default function HomePage() {
  const [username, setUsername] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [platform, setPlatform] = useState<Platform>("lichess");
  const [importUsername, setImportUsername] = useState("");
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [capyMessage, setCapyMessage] = useState("Good morning! Ready to improve your chess? 🎯");

  useEffect(() => {
    const u = getUsernameFromToken();
    const p = getProvider();
    setUsername(u);
    setProvider(p);
    if (p === "lichess" && u) setImportUsername(u);
  }, []);

  useEffect(() => {
    getStudyPlan().then((plan) => {
      if (plan) {
        setStudyPlan(plan);
        setImported(true);
        setCapyMessage(`You have ${plan.modules.length} modules ready. Let's train! 🎯`);
      }
    }).catch((err) => {
      console.error("[home] getStudyPlan on mount failed:", err);
    });
  }, []);

  const isLichess = provider === "lichess";

  const handlePlatformSwitch = (p: Platform) => {
    setPlatform(p);
    setImported(false);
    setImportUsername(p === "lichess" && isLichess ? (username ?? "") : "");
  };

  const handleImport = async () => {
    if (!importUsername.trim()) return;
    setImporting(true);
    setImportError(null);
    try {
      const result = await importGames(platform, importUsername);
      console.log("[import] importGames succeeded:", result);
      try {
        const plan = await generateStudyPlan();
        setStudyPlan(plan);
        setCapyMessage(`Imported ${result.gameCount} games from ${platform}! Study plan ready. 🎉`);
      } catch (err) {
        console.error("[import] generateStudyPlan failed:", err);
        setImportError(`[generateStudyPlan] status=${err instanceof ApiError ? err.status : "?"} msg=${err instanceof Error ? err.message : String(err)}`);
        setCapyMessage(`Imported ${result.gameCount} games! Generate step failed — see error above.`);
      }
      setImported(true);
    } catch (err) {
      console.error("[import] importGames failed:", err);
      setImportError(`[importGames] status=${err instanceof ApiError ? err.status : "?"} msg=${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setImporting(false);
    }
  };

  const dailyLessons = studyPlan?.modules.slice(0, 4).map((mod, i) => ({
    id: i + 1,
    title: mod.title,
    type: mod.type,
    xp: mod.xp,
    done: false,
    icon: MODULE_ICON[mod.type] ?? Brain,
  })) ?? PLACEHOLDER_LESSONS;

  const completedCount = dailyLessons.filter((l) => l.done).length;
  const dailyProgress = (completedCount / dailyLessons.length) * 100;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-text">
            Good morning, <span className="text-primary">{username ?? "Player"}</span> 👋
          </h1>
          <p className="text-text-muted mt-1">Your chess journey continues. Keep the streak alive!</p>
        </div>
        <CapybaraMascot mood="watermelon" size={90} message={capyMessage} />
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Day Streak",   value: "—",                                                          icon: Flame,  color: "text-orange-500", bg: "bg-orange-50" },
          { label: "Win Rate",     value: studyPlan ? `${Math.round(studyPlan.stats.win_rate * 100)}%` : "—", icon: Zap,    color: "text-accent",      bg: "bg-amber-50"  },
          { label: "Games Played", value: studyPlan ? String(studyPlan.stats.total_games) : "—",              icon: Swords, color: "text-primary",     bg: "bg-teal/10"   },
          { label: "Avg Accuracy", value: studyPlan?.stats.avg_accuracy != null ? `${Math.round(studyPlan.stats.avg_accuracy)}%` : "—", icon: Brain, color: "text-sage", bg: "bg-sage/10" },
        ].map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="pt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-muted text-xs font-medium">{label}</p>
                    <p className="text-2xl font-bold text-text mt-0.5">{value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-[var(--radius-sm)] ${bg} flex items-center justify-center`}>
                    <Icon size={20} className={color} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left column */}
        <div className="col-span-2 space-y-6">
          {/* Daily lessons */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar size={18} className="text-primary" />
                    Daily Lessons
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">{completedCount}/{dailyLessons.length} done</span>
                    <Progress value={dailyProgress} className="w-20 h-2" shimmer />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dailyLessons.map((lesson, i) => (
                    <motion.div
                      key={lesson.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.07 }}
                      whileHover={{ x: 3 }}
                      className={`flex items-center gap-4 p-3.5 rounded-[var(--radius-sm)] border transition-all duration-200 cursor-pointer ${
                        lesson.done
                          ? "bg-surface-alt border-border opacity-70"
                          : "bg-surface border-border hover:border-primary hover:shadow-sm"
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center flex-shrink-0 ${
                        lesson.done ? "bg-success/20" : "bg-primary/10"
                      }`}>
                        {lesson.done
                          ? <CheckCircle2 size={18} className="text-success" />
                          : <lesson.icon size={18} className="text-primary" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${lesson.done ? "line-through text-text-muted" : "text-text"}`}>
                          {lesson.title}
                        </p>
                        <p className="text-xs text-text-muted">{lesson.type}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={lesson.done ? "outline" : "default"}>
                          <Zap size={10} /> +{lesson.xp} XP
                        </Badge>
                        {!lesson.done && <ChevronRight size={14} className="text-text-muted" />}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <Link href="/study">
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    View full study plan
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Game import */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Upload size={18} className="text-primary" />
                    Import Your Games
                  </CardTitle>
                  {/* Platform toggle */}
                  <div className="flex bg-surface-alt border border-border rounded-[var(--radius-sm)] p-0.5 gap-0.5">
                    {(["lichess", "chess.com"] as Platform[]).map((p) => (
                      <button
                        key={p}
                        onClick={() => handlePlatformSwitch(p)}
                        className={`px-3 py-1 rounded-[6px] text-xs font-semibold transition-all duration-200 cursor-pointer ${
                          platform === p
                            ? "bg-primary text-white shadow-sm"
                            : "text-text-muted hover:text-text"
                        }`}
                      >
                        {p === "lichess" ? "Lichess" : "Chess.com"}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  {imported ? (
                    <motion.div
                      key="done"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-4 p-4 bg-success/10 rounded-[var(--radius-sm)] border border-success/30"
                    >
                      <CheckCircle2 size={24} className="text-success flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-text">Games imported!</p>
                        <p className="text-sm text-text-muted">Your personalized study plan is ready.</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto"
                        onClick={() => { setImported(false); setImportUsername(isLichess && platform === "lichess" ? (username ?? "") : ""); }}
                      >
                        Re-import
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div key={platform} initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }}>
                      {isLichess && platform === "lichess" && (
                        <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-primary/8 border border-primary/20 rounded-[var(--radius-sm)]">
                          <CheckCircle2 size={14} className="text-primary flex-shrink-0" />
                          <p className="text-xs text-primary font-medium">Signed in with Lichess — your username is pre-filled.</p>
                        </div>
                      )}
                      <p className="text-sm text-text-muted mb-4">
                        {platform === "lichess"
                          ? "Pull your recent Lichess games to generate a personalized study plan."
                          : "Enter your Chess.com username to pull your recent games and generate a personalized study plan."}
                      </p>
                      {importError && (
                        <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-[var(--radius-sm)] px-3 py-2 mb-3">
                          {importError}
                        </p>
                      )}
                      <div className="flex gap-3">
                        <Input
                          placeholder={platform === "lichess" ? "Your Lichess username" : "Your Chess.com username"}
                          value={importUsername}
                          onChange={(e) => setImportUsername(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleImport()}
                        />
                        <Button
                          onClick={handleImport}
                          disabled={importing || !importUsername.trim()}
                          className="flex-shrink-0"
                        >
                          {importing ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                            />
                          ) : <>Import</>}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Weekly streak */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame size={18} className="text-orange-500" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between gap-1.5">
                  {STREAK_DAYS.map((day, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5">
                      <p className="text-xs text-text-muted">{day}</p>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 + i * 0.06, type: "spring" }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          completedDays.includes(i)
                            ? "bg-primary text-white shadow-sm"
                            : i === 5
                            ? "bg-lime border-2 border-primary/40 text-text pulse-glow"
                            : "bg-surface-alt border border-border text-text-muted"
                        }`}
                      >
                        {completedDays.includes(i) ? "✓" : i === 5 ? "•" : ""}
                      </motion.div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-text-muted text-center mt-3">🔥 Keep the streak going today!</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick actions */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
            <Card>
              <CardHeader>
                <CardTitle>Quick Play</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {[
                  { label: "Play vs Engine",    href: "/play",     icon: Swords,   variant: "default" as const },
                  { label: "Study Openings",    href: "/openings", icon: BookOpen, variant: "lime"    as const },
                  { label: "Personalized Plan", href: "/study",    icon: Brain,    variant: "outline" as const },
                ].map(({ label, href, icon: Icon, variant }) => (
                  <Link key={href} href={href}>
                    <Button variant={variant} size="md" className="w-full justify-start gap-3">
                      <Icon size={16} />
                      {label}
                    </Button>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Achievements */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star size={16} className="text-accent" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {ACHIEVEMENTS.map((a) => (
                    <motion.div
                      key={a.label}
                      whileHover={a.earned ? { scale: 1.05 } : {}}
                      className={`p-3 rounded-[var(--radius-sm)] border text-center transition-all duration-200 ${
                        a.earned
                          ? "bg-accent/10 border-accent/30"
                          : "bg-surface-alt border-border opacity-50 grayscale"
                      }`}
                    >
                      <div className="text-2xl mb-1">{a.icon}</div>
                      <p className="text-xs font-medium text-text leading-tight">{a.label}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
