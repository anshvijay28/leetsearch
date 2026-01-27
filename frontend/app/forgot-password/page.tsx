"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/app/contexts/AuthContext";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error: resetError } = await resetPassword(email);

      if (resetError) {
        if (
          resetError.message.includes("network") ||
          resetError.message.includes("fetch") ||
          resetError.message.includes("Failed to fetch")
        ) {
          setError("Network error. Please check your connection and try again.");
        } else {
          setError(resetError.message || "Failed to send reset email. Please try again.");
        }
        setIsLoading(false);
        return;
      }

      setIsSubmitted(true);
      setIsLoading(false);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-gray-900 dark:text-white">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-colors mb-4">
              <div className="h-6 w-6 rounded-md bg-gradient-to-br from-cyan-600 via-blue-500 to-indigo-500 dark:from-cyan-500 dark:via-blue-400 dark:to-indigo-400" />
              <span className="font-semibold tracking-tight text-gray-900 dark:text-white">
                LeetSearch
              </span>
            </Link>
          </div>

          <div className={cn(
            "rounded-2xl border border-white/10 bg-white/95 dark:bg-black/95 backdrop-blur-xl",
            "shadow-[0_2px_8px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-[0_30px_90px_rgba(0,0,0,0.75)]",
            "p-6 md:p-8 text-center space-y-4"
          )}>
            <div className="w-16 h-16 mx-auto rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Check your email</h1>
            <p className="text-sm text-gray-600 dark:text-white/60">
              We&apos;ve sent a password reset link to <span className="text-gray-900 dark:text-white font-medium">{email}</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-white/50">
              Didn&apos;t receive the email? Check your spam folder or{" "}
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail("");
                }}
                className="text-gray-900 dark:text-white font-medium hover:underline"
              >
                try again
              </button>
            </p>
            <Link
              href="/login"
              className="inline-block mt-4 text-sm text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              ← Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-gray-900 dark:text-white">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-colors mb-4">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-cyan-600 via-blue-500 to-indigo-500 dark:from-cyan-500 dark:via-blue-400 dark:to-indigo-400" />
            <span className="font-semibold tracking-tight text-gray-900 dark:text-white">
              LeetSearch
            </span>
          </Link>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2 text-gray-900 dark:text-white">
            Reset your password
          </h1>
          <p className="text-sm text-gray-600 dark:text-white/60">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <div className={cn(
          "rounded-2xl border border-white/10 bg-white/95 dark:bg-black/95 backdrop-blur-xl",
          "shadow-[0_2px_8px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-[0_30px_90px_rgba(0,0,0,0.75)]",
          "p-6 md:p-8 space-y-6"
        )}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-xs font-semibold tracking-[0.18em] uppercase text-gray-500 dark:text-white/60">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-black/10 dark:focus:border-white/20 dark:focus:ring-white/10"
                placeholder="you@example.com"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="rounded-xl bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/30 px-3 py-2 flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0 text-rose-500 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-rose-500 dark:text-rose-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 inline-flex items-center justify-center rounded-xl bg-black text-white dark:bg-white dark:text-black text-sm font-semibold transition-colors hover:bg-black/90 dark:hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Sending..." : "Send reset link"}
            </button>
          </form>

          <p className="text-xs text-center text-gray-500 dark:text-white/50">
            Remember your password?{" "}
            <Link href="/login" className="text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-white/80 transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
