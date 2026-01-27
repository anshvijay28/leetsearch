"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error: signInError } = await signIn(email, password);

      if (signInError) {
        console.error("Sign in error:", signInError);
        // Handle specific Supabase errors
        if (
          signInError.message.includes("Invalid login") ||
          signInError.message.includes("Invalid credentials") ||
          signInError.message.includes("Invalid login credentials")
        ) {
          setError("Invalid email or password. Please check and try again.");
        } else if (
          signInError.message.includes("Email not confirmed") ||
          signInError.message.includes("email address is not confirmed")
        ) {
          setError("Please check your email to confirm your account before signing in.");
        } else if (
          signInError.message.includes("network") ||
          signInError.message.includes("fetch") ||
          signInError.message.includes("Failed to fetch")
        ) {
          setError("Network error. Please check your connection and try again.");
        } else if (signInError.message.includes("User not found")) {
          setError("No account found with this email. Please sign up first.");
        } else {
          setError(signInError.message || "Failed to sign in. Please try again.");
        }
        setIsLoading(false);
        return;
      }

      // Successfully signed in - redirect to home
      router.push("/");
    } catch (err) {
      console.error("Error signing in:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (oauthError) {
        console.error("Error signing in with Google:", oauthError);
        setError("Failed to sign in with Google. Please try again.");
        setIsLoading(false);
      }
      // The redirect happens automatically via Supabase
    } catch (error) {
      console.error("Error initiating Google OAuth:", error);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 pt-20 pb-8">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2 text-gray-900 dark:text-white">
            Welcome back
          </h1>
          <p className="text-sm text-gray-600 dark:text-white/60">
            Sign in to continue to your account
          </p>
        </div>

        <div className={cn(
          "rounded-2xl border border-white/10 bg-white/95 dark:bg-black/95 backdrop-blur-xl",
          "shadow-[0_2px_8px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-[0_30px_90px_rgba(0,0,0,0.75)]",
          "p-6 md:p-8 space-y-6"
        )}>
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-white hover:bg-gray-50 dark:bg-white/10 dark:hover:bg-white/20 border border-black/10 dark:border-white/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-gray-700 dark:text-white font-medium text-sm">
              {isLoading ? "Signing in..." : "Sign in with Google"}
            </span>
          </button>

          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-white/50">
            <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
            <span>or continue with email</span>
            <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-5">
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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-semibold tracking-[0.18em] uppercase text-gray-500 dark:text-white/60">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 pr-10 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-black/10 dark:focus:border-white/20 dark:focus:ring-white/10"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-white/50 hover:text-gray-700 dark:hover:text-white/80 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
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
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-xs text-center text-gray-500 dark:text-white/50">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-white/80 transition-colors font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
