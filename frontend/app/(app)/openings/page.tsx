"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import CapybaraMascot from "@/components/CapybaraMascot";
import { Lock, CheckCircle2, ChevronRight, Star, Zap, BookOpen, Trophy } from "lucide-react";

type Difficulty = "Beginner" | "Intermediate" | "Advanced";

interface Opening {
  id: number;
  name: string;
  eco: string;
  difficulty: Difficulty;
  description: string;
  lessons: number;
  completed: number;
  locked: boolean;
  color: string;
  moves: string;
}

const OPENINGS: Opening[] = [
  { id: 1, name: "Italian Game",          eco: "C50", difficulty: "Beginner",     description: "A classical opening focusing on quick development and central control.",          lessons: 5, completed: 5, locked: false, color: "bg-lime/40",       moves: "1.e4 e5 2.Nf3 Nc6 3.Bc4" },
  { id: 2, name: "Ruy López",             eco: "C60", difficulty: "Beginner",     description: "One of the oldest and most respected chess openings.",                           lessons: 6, completed: 4, locked: false, color: "bg-sage/30",       moves: "1.e4 e5 2.Nf3 Nc6 3.Bb5" },
  { id: 3, name: "Sicilian Defense",      eco: "B20", difficulty: "Intermediate", description: "The most popular response to 1.e4. Highly combative and asymmetrical.",         lessons: 8, completed: 2, locked: false, color: "bg-teal/20",       moves: "1.e4 c5" },
  { id: 4, name: "Queen's Gambit",        eco: "D06", difficulty: "Intermediate", description: "White offers a pawn to gain central control in this classical opening.",         lessons: 7, completed: 0, locked: false, color: "bg-gold/20",       moves: "1.d4 d5 2.c4" },
  { id: 5, name: "King's Indian Defense", eco: "E60", difficulty: "Advanced",     description: "A hypermodern opening where Black allows White to occupy the center.",          lessons: 9, completed: 0, locked: true,  color: "bg-olive/10",      moves: "1.d4 Nf6 2.c4 g6" },
  { id: 6, name: "Nimzo-Indian Defense",  eco: "E20", difficulty: "Advanced",     description: "Black pins the knight and fights for the center with pieces rather than pawns.", lessons: 8, completed: 0, locked: true,  color: "bg-primary/10",    moves: "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4" },
];

const DIFF_COLORS: Record<Difficulty, string> = {
  Beginner:     "sage",
  Intermediate: "accent",
  Advanced:     "default",
};

const PATH_MESSAGES: Record<string, string> = {
  default:  "Choose an opening to start your journey! Each one unlocks the next 🗺️",
  locked:   "Complete the previous opening to unlock this one! You've got this 💪",
  active:   "Let's dive in! I'll guide you through every move 🎓",
  complete: "Excellent! You've mastered this opening! Onto the next one 🏆",
};

export default function OpeningsPage() {
  const [selected, setSelected] = useState<Opening | null>(null);
  const [capyMessage, setCapyMessage] = useState(PATH_MESSAGES.default);
  const [activeTab, setActiveTab] = useState<Difficulty | "All">("All");

  const filtered = activeTab === "All" ? OPENINGS : OPENINGS.filter(o => o.difficulty === activeTab);

  const handleSelect = (o: Opening) => {
    if (o.locked) { setCapyMessage(PATH_MESSAGES.locked); return; }
    setSelected(o);
    setCapyMessage(o.completed === o.lessons ? PATH_MESSAGES.complete : PATH_MESSAGES.active);
  };

  const totalCompleted = OPENINGS.reduce((a, o) => a + o.completed, 0);
  const totalLessons   = OPENINGS.reduce((a, o) => a + o.lessons, 0);

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
            <BookOpen className="text-primary" size={28} />
            Opening Library
          </h1>
          <p className="text-text-muted mt-1">Master the fundamentals — opening by opening.</p>
        </div>
        <CapybaraMascot mood="teaching" size={90} message={capyMessage} />
      </motion.div>

      {/* Overall progress */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 p-5 bg-surface rounded-[var(--radius)] border border-border"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-semibold text-text">Your Journey Progress</p>
            <p className="text-sm text-text-muted">{totalCompleted} of {totalLessons} lessons completed</p>
          </div>
          <Badge variant="accent"><Trophy size={12} /> {OPENINGS.filter(o=>o.completed===o.lessons).length} Mastered</Badge>
        </div>
        <Progress value={(totalCompleted / totalLessons) * 100} shimmer />
      </motion.div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(["All", "Beginner", "Intermediate", "Advanced"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer border ${
              activeTab === tab
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-surface border-border text-text-muted hover:text-text hover:border-primary/40"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Opening cards — journey path */}
        <div className="col-span-2">
          <div className="relative">
            {/* Path line */}
            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary via-sage to-border z-0" />

            <div className="space-y-4 relative z-10">
              {filtered.map((opening, i) => {
                const progress = (opening.completed / opening.lessons) * 100;
                const isComplete = opening.completed === opening.lessons;
                const isActive = !opening.locked && opening.completed < opening.lessons;

                return (
                  <motion.div
                    key={opening.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <div className="flex gap-4">
                      {/* Node */}
                      <motion.div
                        whileHover={!opening.locked ? { scale: 1.15 } : {}}
                        className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center border-2 z-10 shadow-sm cursor-pointer ${
                          isComplete  ? "bg-primary border-primary text-white"
                          : isActive  ? "bg-surface border-primary text-primary pulse-glow"
                          : opening.locked ? "bg-surface-alt border-border text-text-muted"
                          : "bg-surface border-border text-text-muted"
                        }`}
                        onClick={() => handleSelect(opening)}
                      >
                        {isComplete ? <CheckCircle2 size={20} />
                          : opening.locked ? <Lock size={16} />
                          : <span className="font-bold text-sm">{opening.eco}</span>
                        }
                      </motion.div>

                      {/* Card */}
                      <motion.div
                        whileHover={!opening.locked ? { y: -2 } : {}}
                        onClick={() => handleSelect(opening)}
                        className={`flex-1 p-4 rounded-[var(--radius)] border transition-all duration-200 cursor-pointer ${
                          opening.locked
                            ? "bg-surface-alt border-border opacity-60"
                            : selected?.id === opening.id
                            ? "bg-surface border-primary shadow-md"
                            : "bg-surface border-border hover:border-primary/50 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-text">{opening.name}</h3>
                              <Badge variant={DIFF_COLORS[opening.difficulty] as "sage" | "accent" | "default"}>
                                {opening.difficulty}
                              </Badge>
                              {isComplete && <Star size={14} className="text-accent fill-accent" />}
                            </div>
                            <p className="text-xs font-mono text-text-muted mb-1.5">{opening.moves}</p>
                            <p className="text-sm text-text-muted line-clamp-1">{opening.description}</p>
                            {!opening.locked && (
                              <div className="flex items-center gap-2 mt-2">
                                <Progress value={progress} className="flex-1 h-1.5" />
                                <span className="text-xs text-text-muted">{opening.completed}/{opening.lessons}</span>
                              </div>
                            )}
                          </div>
                          {!opening.locked && (
                            <ChevronRight size={16} className="text-text-muted flex-shrink-0 mt-1" />
                          )}
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detail panel */}
        <div>
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="sticky top-8"
              >
                <Card>
                  <div className={`${selected.color} rounded-t-[var(--radius)] p-5 border-b border-border`}>
                    <p className="text-xs font-mono font-bold text-text-muted mb-1">{selected.eco}</p>
                    <h2 className="text-xl font-bold text-text">{selected.name}</h2>
                    <p className="text-sm font-mono text-text-muted mt-1">{selected.moves}</p>
                  </div>
                  <CardContent className="pt-5 space-y-4">
                    <p className="text-sm text-text-muted">{selected.description}</p>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-muted">Progress</span>
                      <span className="font-semibold text-text">{selected.completed}/{selected.lessons} lessons</span>
                    </div>
                    <Progress value={(selected.completed / selected.lessons) * 100} shimmer />

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-surface-alt rounded-[var(--radius-sm)] border border-border text-center">
                        <p className="text-lg font-bold text-primary">{selected.lessons}</p>
                        <p className="text-xs text-text-muted">Lessons</p>
                      </div>
                      <div className="p-3 bg-surface-alt rounded-[var(--radius-sm)] border border-border text-center">
                        <p className="text-lg font-bold text-accent">{selected.lessons * 20}</p>
                        <p className="text-xs text-text-muted">Total XP</p>
                      </div>
                    </div>

                    <Button variant="default" size="lg" className="w-full">
                      <Zap size={16} />
                      {selected.completed > 0 ? "Continue" : "Start"} Opening
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full" onClick={() => setSelected(null)}>
                      Back to list
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="sticky top-8 flex flex-col items-center justify-center gap-4 p-8 bg-surface rounded-[var(--radius)] border border-border text-center"
              >
                <Image
                  src="/images/SwimmingCapybara.png"
                  alt="Capy swimming"
                  width={100}
                  height={100}
                  className="rounded-full border-2 border-border float object-contain bg-white p-1"
                />
                <p className="text-text-muted text-sm">Click an opening to see details and start learning!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
