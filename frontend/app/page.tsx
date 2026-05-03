"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/api";

export default function Root() {
  const router = useRouter();

  useEffect(() => {
    router.replace(isLoggedIn() ? "/home" : "/login");
  }, []);

  return null;
}
