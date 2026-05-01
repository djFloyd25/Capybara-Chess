"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home, BookOpen, Brain, Swords, Settings, Flame, Trophy
} from "lucide-react";
import Image from "next/image";

const navItems = [
  { href: "/",          label: "Home",        icon: Home },
  { href: "/openings",  label: "Openings",    icon: BookOpen },
  { href: "/study",     label: "My Study",    icon: Brain },
  { href: "/play",      label: "Play",        icon: Swords },
  { href: "/settings",  label: "Settings",    icon: Settings },
];

interface SidebarProps {
  streak?: number;
  xp?: number;
  level?: number;
}

export default function Sidebar({ streak = 0, xp = 0, level = 1 }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface border-r border-border flex flex-col z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-teal">
          <Image src="/images/TeachingCapybara.png" alt="logo" fill className="object-contain p-0.5" />
        </div>
        <div>
          <p className="font-bold text-text text-sm leading-tight">Capybara</p>
          <p className="text-xs text-text-muted">Chess</p>
        </div>
      </div>

      {/* Streak + XP */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="streak-flame text-lg">🔥</span>
            <span className="font-bold text-text text-sm">{streak} day streak</span>
          </div>
          <div className="flex items-center gap-1">
            <Trophy size={13} className="text-accent" />
            <span className="text-xs font-semibold text-text-muted">Lvl {level}</span>
          </div>
        </div>
        <div className="h-2 w-full bg-surface-alt rounded-full overflow-hidden border border-border">
          <motion.div
            className="h-full rounded-full xp-shimmer"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(xp % 100, 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <p className="text-[10px] text-text-muted mt-1">{xp % 100}/100 XP to next level</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}>
              <motion.div
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium transition-colors duration-150 cursor-pointer ${
                  active
                    ? "bg-primary text-white shadow-sm"
                    : "text-text-muted hover:bg-surface-alt hover:text-text"
                }`}
              >
                <Icon size={18} />
                {label}
                {active && (
                  <motion.div
                    layoutId="active-pill"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User avatar placeholder */}
      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-sage/30 border border-border flex items-center justify-center text-sm font-bold text-text">
            U
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text truncate">Player</p>
            <p className="text-xs text-text-muted truncate">chess.com linked</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
