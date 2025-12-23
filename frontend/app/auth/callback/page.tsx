"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        // Supabase handles the OAuth callback and extracts the session from URL hash
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          setError(`Authentication error: ${error.message}`);
          setTimeout(() => router.push("/"), 10000);
          return;
        }

        if (data.session) {
          // Session is automatically stored by Supabase
          // AuthContext will pick it up via onAuthStateChange
          // Redirect to home page
          router.push("/");
        } else {
          setError("No session found. Please try signing in again.");
          setTimeout(() => router.push("/"), 10000);
        }
      } catch (err: any) {
        console.error("Auth callback error:", err);
        setError("Authentication failed. Please try again.");
        setTimeout(() => router.push("/"), 10000);
      }
    }

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020205] text-white">
      <div className="text-center">
        {error ? (
          <>
            <div className="text-red-400 mb-4 text-lg font-semibold">❌ {error}</div>
            <p className="text-zinc-400 mb-2">Redirecting to home page in 10 seconds...</p>
            <p className="text-zinc-500 text-sm">Check the browser console for more details.</p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-zinc-300">Signing you in...</p>
          </>
        )}
      </div>
    </div>
  );
}
