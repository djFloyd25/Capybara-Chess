"use client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { MotionConfig } from "framer-motion";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""}>
      <MotionConfig reducedMotion="never">
        {children}
      </MotionConfig>
    </GoogleOAuthProvider>
  );
}
