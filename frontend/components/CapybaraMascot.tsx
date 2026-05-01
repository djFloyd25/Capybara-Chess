"use client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export type CapyMood =
  | "teaching"
  | "working"
  | "crown"
  | "celebration"
  | "pleased"
  | "watermelon"
  | "swimming"
  | "bathing"
  | "sleeping";

const moodMap: Record<CapyMood, { src: string; label: string }> = {
  teaching:    { src: "/images/TeachingCapybara.png",    label: "Capy teaching"    },
  working:     { src: "/images/WorkingCapybara.png",     label: "Capy studying"    },
  crown:       { src: "/images/KingCapybara.png",        label: "Capy crowned"     },
  celebration: { src: "/images/CelebrationCapybara.png", label: "Capy celebrating" },
  pleased:     { src: "/images/PleasedCapybara.png",     label: "Capy pleased"     },
  watermelon:  { src: "/images/WatermelonCapybara.png",  label: "Capy happy"       },
  swimming:    { src: "/images/SwimmingCapybara.png",    label: "Capy swimming"    },
  bathing:     { src: "/images/BathingCapybara.png",     label: "Capy relaxing"    },
  sleeping:    { src: "/images/SleepingCapybara.png",    label: "Capy sleeping"    },
};

interface Props {
  mood?: CapyMood;
  size?: number;
  message?: string;
  className?: string;
}

export default function CapybaraMascot({ mood = "teaching", size = 120, message, className = "" }: Props) {
  const { src, label } = moodMap[mood];

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        whileHover={{ scale: 1.06, rotate: [0, -3, 3, 0] }}
        className="relative rounded-full overflow-hidden border-4 border-teal shadow-lg bg-white"
        style={{ width: size, height: size }}
      >
        <Image
          src={src}
          alt={label}
          fill
          className="object-contain p-1"
          sizes={`${size}px`}
        />
      </motion.div>

      <AnimatePresence>
        {message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="relative max-w-[220px] bg-surface rounded-[var(--radius)] border border-border px-4 py-2.5 shadow-sm text-sm text-text text-center"
          >
            <span
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0"
              style={{
                borderLeft: "8px solid transparent",
                borderRight: "8px solid transparent",
                borderBottom: "8px solid var(--border)",
              }}
            />
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
