"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CapybaraMascot from "@/components/CapybaraMascot";
import {
  User, Link2, Bell, CreditCard, Shield, CheckCircle2,
  ChevronRight, Zap, Crown, Star
} from "lucide-react";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    features: ["5 daily lessons", "Basic opening library", "Chess.com sync (last 30 games)", "Beginner engine"],
    cta: "Current Plan",
    current: true,
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$9",
    period: "per month",
    features: [
      "Unlimited daily lessons",
      "Full opening library (500+ openings)",
      "Full chess.com history",
      "Advanced engine (all difficulties)",
      "AI-powered personalized study plan",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    current: false,
    highlight: true,
  },
  {
    id: "annual",
    name: "Pro Annual",
    price: "$79",
    period: "per year",
    features: [
      "Everything in Pro",
      "2 months free",
      "Early access to new features",
      "Export study reports",
    ],
    cta: "Best Value",
    current: false,
    highlight: false,
  },
];

export default function SettingsPage() {
  const [chessUsername, setChessUsername] = useState("capychess99");
  const [displayName, setDisplayName]     = useState("Player");
  const [email, setEmail]                 = useState("player@example.com");
  const [saved, setSaved]                 = useState(false);
  const [notifications, setNotifications] = useState({ streaks: true, lessons: true, news: false });

  const handleSave = async () => {
    await new Promise((r) => setTimeout(r, 800));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-text">Settings</h1>
          <p className="text-text-muted mt-1">Manage your account, integrations, and billing.</p>
        </div>
        <CapybaraMascot
          mood="bathing"
          size={80}
          message="Keep your profile up to date for the best experience! 🛁"
        />
      </motion.div>

      <div className="space-y-6">
        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={18} className="text-primary" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-5 mb-6">
                <div className="w-20 h-20 rounded-full bg-sage/30 border-2 border-border flex items-center justify-center text-3xl font-bold text-text">
                  {displayName[0] ?? "U"}
                </div>
                <div>
                  <p className="font-semibold text-text">{displayName}</p>
                  <p className="text-sm text-text-muted">{email}</p>
                  <Badge variant="default" className="mt-1"><Zap size={10} /> Level 5 · 420 XP</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">Display Name</label>
                  <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">Email</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>

              <Button onClick={handleSave} variant={saved ? "lime" : "default"} size="sm">
                {saved ? <><CheckCircle2 size={14} /> Saved!</> : "Save Profile"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Chess.com integration */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 size={18} className="text-primary" />
                Chess.com Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-success/10 rounded-[var(--radius-sm)] border border-success/30">
                <CheckCircle2 size={20} className="text-success flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-text">Connected</p>
                  <p className="text-sm text-text-muted">@{chessUsername} · Last sync: today</p>
                </div>
                <Button variant="outline" size="sm">Disconnect</Button>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Chess.com Username</label>
                <div className="flex gap-3">
                  <Input value={chessUsername} onChange={(e) => setChessUsername(e.target.value)} />
                  <Button variant="default" size="md" className="flex-shrink-0">Re-sync</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell size={18} className="text-primary" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "streaks" as const, label: "Streak reminders",       sub: "Get notified before your streak expires" },
                { key: "lessons" as const, label: "Daily lesson available",  sub: "Know when your daily lessons are ready" },
                { key: "news"    as const, label: "Chess news & updates",    sub: "Opening theory updates and new features" },
              ].map(({ key, label, sub }) => (
                <div key={key} className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-sm font-medium text-text">{label}</p>
                    <p className="text-xs text-text-muted">{sub}</p>
                  </div>
                  <button
                    onClick={() => setNotifications(n => ({ ...n, [key]: !n[key] }))}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer border ${
                      notifications[key] ? "bg-primary border-primary" : "bg-surface-alt border-border"
                    }`}
                  >
                    <motion.div
                      animate={{ x: notifications[key] ? 20 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Billing */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard size={18} className="text-primary" />
                Billing & Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {PLANS.map((plan, i) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    whileHover={!plan.current ? { y: -3 } : {}}
                    className={`relative p-5 rounded-[var(--radius)] border-2 flex flex-col gap-3 transition-all duration-200 ${
                      plan.highlight
                        ? "border-primary bg-primary/5 shadow-md"
                        : plan.current
                        ? "border-border bg-surface-alt"
                        : "border-border bg-surface hover:border-primary/40"
                    }`}
                  >
                    {plan.highlight && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        Most Popular
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {plan.id === "free"   && <Star size={14} className="text-text-muted" />}
                        {plan.id === "pro"    && <Zap  size={14} className="text-primary" />}
                        {plan.id === "annual" && <Crown size={14} className="text-accent" />}
                        <p className="font-bold text-text">{plan.name}</p>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-text">{plan.price}</span>
                        <span className="text-xs text-text-muted">{plan.period}</span>
                      </div>
                    </div>
                    <ul className="space-y-1.5 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs text-text-muted">
                          <CheckCircle2 size={12} className="text-success flex-shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={plan.highlight ? "default" : plan.current ? "ghost" : "outline"}
                      size="sm"
                      className="w-full"
                      disabled={plan.current}
                    >
                      {plan.cta}
                      {!plan.current && <ChevronRight size={14} />}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield size={18} className="text-primary" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">New Password</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">Confirm Password</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
              </div>
              <Button variant="outline" size="sm">Change Password</Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
