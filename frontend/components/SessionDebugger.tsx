"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

/**
 * Debug component to track session and token issues
 * Remove in production when authentication is working properly
 */
export default function SessionDebugger() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      const hasBackendToken = !!session?.user?.token;
      console.group("🔐 Session Authentication Status");
      console.log("Status:", "✅ Authenticated");
      console.log("User ID:", session?.user?.id);
      console.log("User Name:", session?.user?.name);
      console.log("Has Backend Token:", hasBackendToken ? "✅ Yes" : "❌ No");
      if (hasBackendToken) {
        console.log("Token Length:", session.user.token.length);
        console.log("Token Preview:", session.user.token.substring(0, 20) + "...");
      }
      console.groupEnd();
    } else if (status === "unauthenticated") {
      console.warn("❌ User not authenticated");
    } else {
      console.log("⏳ Session loading...");
    }
  }, [session, status]);

  return null; // This is a debug component, no visible output
}
