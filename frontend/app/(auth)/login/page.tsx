"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { publicFetch, setToken, ApiError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const capyMessage = mode === "login"
    ? "Welcome back! Ready to crush some openings? 🏆"
    : "Let's start your chess journey together! ♟️";

  const validate = (): string | null => {
    if (!email.trim()) return "Please enter your email.";
    if (!/\S+@\S+\.\S+/.test(email)) return "Please enter a valid email address.";
    if (!password) return "Please enter your password.";
    if (mode === "signup") {
      if (!username.trim()) return "Please enter your username.";
      if (password.length < 8) return "Password must be at least 8 characters.";
    }
    return null;
  };

  // Maps HTTP status codes to human-readable messages
  // Backend should return:
  //   401 → wrong password
  //   404 → username not found  (needs explicit handling in AuthController)
  //   409 → username or email already taken  (for register)
  //   400 → bad request / validation error
  const loginErrorMessage = (status: number): string => {
    switch (status) {
      case 403: return "No user found or incorrect password. Please try again.";
      case 400: return "Invalid details. Please check your input.";
      default:  return status.toString();
    }
  };

  const registerErrorMessage = (status: number): string => {
    switch (status) {
      case 409: return "That username or email is already taken.";
      case 400: return "Invalid details. Please check your input.";
      default:  return "Sign up failed. Please try again.";
    }
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        await publicFetch("/auth/register", {
          method: "POST",
          body: JSON.stringify({ username, email, password }),
        });
      }

      const data = await publicFetch("/auth/authenticate", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setToken(data.jwt);
      router.push("../openings");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(
          mode === "signup"
            ? registerErrorMessage(err.status)
            : loginErrorMessage(err.status)
        );
      } else {
        setError("Cannot connect to the server. Make sure the backend is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-teal via-sage to-lime p-12 relative overflow-hidden">
        {/* Decorative chess pattern */}
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 64 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-4xl text-text"
              style={{
                left: `${(i % 8) * 12.5}%`,
                top: `${Math.floor(i / 8) * 12.5}%`,
                opacity: Math.random() > 0.6 ? 1 : 0,
              }}
            >
              {["♟","♜","♞","♝","♛","♚"][Math.floor(Math.random()*6)]}
            </div>
          ))}
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/40">
              <Image src="/images/TeachingCapybara.png" alt="logo" width={48} height={48} className="object-contain p-0.5" />
            </div>
            <div>
              <p className="font-bold text-white text-lg">Capybara Chess</p>
              <p className="text-white/70 text-xs">Your personal chess coach</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
              Level up your<br />chess game
            </h1>
            <p className="text-white/80 text-lg">
              Personalized training powered by your games. Study openings, analyze mistakes, and play against a custom engine.
            </p>
          </motion.div>
        </div>

        {/* Capybara mascot */}
        <motion.div
          className="relative z-10 flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
        >
          <div className="relative">
            <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white/40 shadow-xl bg-white">
              <Image
                src="/images/KingCapybara.png"
                alt="Capy crowned"
                width={144}
                height={144}
                className="object-contain p-2"
              />
            </div>
            <motion.div
              className="absolute -bottom-2 -right-2 bg-accent rounded-full px-2 py-1 text-xs font-bold text-text shadow-md"
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              👑
            </motion.div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-[var(--radius)] px-5 py-3 text-white text-sm font-medium text-center max-w-xs">
            {capyMessage}
          </div>

          {/* Stats row */}
          <div className="flex gap-4 mt-2">
            {[["10K+","Players"], ["500+","Openings"], ["AI","Coach"]].map(([val, label]) => (
              <div key={label} className="text-center">
                <p className="font-bold text-white text-lg">{val}</p>
                <p className="text-white/70 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mode toggle */}
          <div className="flex bg-surface-alt border border-border rounded-[var(--radius)] p-1 mb-8">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2.5 rounded-[10px] text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  mode === m ? "bg-primary text-white shadow-sm" : "text-text-muted hover:text-text"
                }`}
              >
                {m === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-text mb-2">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="text-text-muted text-sm mb-8">
                {mode === "login"
                  ? "Log in to continue your training streak."
                  : "Join thousands of players improving with Capy."}
              </p>

              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                {mode === "signup" && (
                  <div>
                    <label className="block text-sm font-medium text-text mb-1.5">Username</label>
                    <Input
                      placeholder="e.g. capychess99"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">Email</label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">Password</label>
                  <div className="relative">
                    <Input
                      type={showPass ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors cursor-pointer"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {mode === "login" && (
                  <div className="flex justify-end">
                    <button type="button" className="text-sm text-primary hover:underline cursor-pointer">
                      Forgot password?
                    </button>
                  </div>
                )}

                {error && (
                  <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-[var(--radius-sm)] px-3 py-2">
                    {error}
                  </p>
                )}

                <Button
                  variant="default"
                  size="lg"
                  className="w-full mt-2"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : mode === "login" ? "Log In" : "Create Account"}
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs text-text-muted bg-background px-2">
                    or continue with
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full h-10 rounded-[var(--radius-sm)] border-2 border-border bg-surface flex items-center justify-center gap-2 text-sm font-medium text-text hover:border-primary hover:bg-surface-alt transition-all duration-200 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
              </form>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
