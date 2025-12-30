"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { checkUsernameAvailability } from "@/lib/profile";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const router = useRouter();
  const { signup } = useAuth();

  const handleEmailSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setUsernameError(null);

    // Client-side validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      setError("Username must be 3-20 characters and contain only letters, numbers, and underscores");
      return;
    }

    setIsLoading(true);

    try {
      // Check username availability
      const isAvailable = await checkUsernameAvailability(username);
      if (!isAvailable) {
        setUsernameError("Username is already taken");
        setIsLoading(false);
        return;
      }

      // Sign up with Supabase
      const { error: signupError, data: signupData } = await signup(email, password, username);

      if (signupError) {
        // Handle specific Supabase errors
        if (
          signupError.message.includes("already registered") ||
          signupError.message.includes("already exists") ||
          signupError.message.includes("User already registered")
        ) {
          setError("An account with this email already exists. Please sign in instead.");
        } else if (
          signupError.message.includes("invalid") ||
          signupError.message.includes("Invalid email")
        ) {
          setError("Invalid email address. Please check and try again.");
        } else if (signupError.message.includes("Password")) {
          setError("Password does not meet requirements. Please use a stronger password.");
        } else if (
          signupError.message.includes("network") ||
          signupError.message.includes("fetch") ||
          signupError.message.includes("Failed to fetch")
        ) {
          setError("Network error. Please check your connection and try again.");
        } else {
          setError(signupError.message || "Failed to create account. Please try again.");
        }
        setIsLoading(false);
        return;
      }

      // Check if email confirmation is needed
      if (signupData?.user && !signupData?.session) {
        // Email confirmation required - redirect to verification page
        setIsLoading(false);
        router.push(`/signup/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }

      // This shouldn't happen if email confirmation is enabled, but handle it just in case
      if (signupData?.session) {
        // User is auto-confirmed (shouldn't happen with email confirmation enabled)
        setIsLoading(false);
        router.push("/");
        return;
      }

      if (!signupData?.user) {
        setError("Signup completed but user data is missing. Please try again.");
        setIsLoading(false);
        return;
      }

      // Default Behavior - should not reach here, but handle it
      setError("Unexpected signup response. Please try again.");
      setIsLoading(false);
      
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
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
        console.error("Error signing up with Google:", oauthError);
        setError("Failed to sign up with Google. Please try again.");
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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-white">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-[#06b6d4] transition-colors mb-4">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-[#06b6d4] via-[#3b82f6] to-[#6366f1]" />
            <span className="font-semibold tracking-tight text-[#06b6d4]">
              LeetSearch
            </span>
          </Link>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">
            Create your account
          </h1>
          <p className="text-sm text-zinc-400">
            Sign up to get started with LeetSearch
          </p>
        </div>

        <div className="rounded-2xl border border-[#27272f] bg-black/70 backdrop-blur-md shadow-[0_0_60px_rgba(15,23,42,0.75)] p-6 md:p-8 space-y-6">
          <button
            onClick={handleGoogleSignup}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg bg-white hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
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
            <span className="text-gray-700 font-medium text-base">
              {isLoading ? "Signing up..." : "Sign up with Google"}
            </span>
          </button>

          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <div className="h-px flex-1 bg-[#27272f]" />
            <span>or continue with email</span>
            <div className="h-px flex-1 bg-[#27272f]" />
          </div>

          <form onSubmit={handleEmailSignup} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-zinc-200">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[#27272f] bg-zinc-950/60 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent"
                placeholder="you@example.com"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-zinc-200">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameError(null);
                }}
                className={`w-full rounded-lg border ${
                  usernameError ? "border-red-500/50" : "border-[#27272f]"
                } bg-zinc-950/60 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent`}
                placeholder="yourusername"
                disabled={isLoading}
              />
              {usernameError && (
                <p className="text-xs text-red-400">{usernameError}</p>
              )}
              <p className="text-xs text-zinc-500">
                3-20 characters, letters, numbers, and underscores only
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-zinc-200">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[#27272f] bg-zinc-950/60 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-200">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-[#27272f] bg-zinc-950/60 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#06b6d4] via-[#3b82f6] to-[#6366f1] px-3 py-2.5 text-sm font-medium text-white shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:brightness-110 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating account..." : "Sign up"}
            </button>
          </form>

          <p className="text-xs text-center text-zinc-500">
            Already have an account?{" "}
            <Link href="/login" className="text-zinc-300 hover:text-[#06b6d4] transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
