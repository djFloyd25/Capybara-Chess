"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { completeLichessOAuth } from "@/lib/lichess";
import { oauthLogin, ApiError } from "@/lib/api";

function LichessCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const handled = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const code = searchParams.get("code");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError(`Lichess declined access: ${errorParam}`);
      return;
    }
    if (!code) {
      setError("No authorization code received from Lichess.");
      return;
    }

    completeLichessOAuth(code)
      .then(({ id, username }) =>
        oauthLogin({ provider: "lichess", providerId: id, email: null, username })
      )
      .then(() => router.replace("/home"))
      .catch((err: unknown) => {
        if (err instanceof ApiError) {
          setError(`Backend error HTTP ${err.status}: ${err.message || "empty response"}`);
        } else if (err instanceof Error) {
          setError(`Sign-in failed: ${err.message}`);
        } else {
          setError("Sign-in failed: unknown error");
        }
      });
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-sm w-full text-center space-y-4">
          <p className="text-danger text-sm bg-danger/10 border border-danger/20 rounded-lg px-4 py-3">{error}</p>
          <button
            onClick={() => router.replace("/login")}
            className="text-sm text-primary hover:underline cursor-pointer"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-text-muted text-sm">Connecting with Lichess...</p>
      </div>
    </div>
  );
}

export default function LichessCallback() {
  return (
    <Suspense>
      <LichessCallbackInner />
    </Suspense>
  );
}
