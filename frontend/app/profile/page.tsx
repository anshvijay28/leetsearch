"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { updateProfile, checkUsernameAvailability } from "@/lib/profile";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading, refreshUserProfile } = useAuth();
  const [username, setUsername] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [availabilityCheck, setAvailabilityCheck] = useState<{
    checking: boolean;
    available: boolean | null;
  }>({ checking: false, available: null });

  // Initialize username from user profile
  useEffect(() => {
    if (user?.username) {
      setUsername(user.username);
    }
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  // Debounced username availability check
  useEffect(() => {
    if (!username || username === user?.username) {
      setAvailabilityCheck({ checking: false, available: null });
      return;
    }

    // Validate format first
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      setAvailabilityCheck({ checking: false, available: null });
      return;
    }

    const timeoutId = setTimeout(async () => {
      setAvailabilityCheck({ checking: true, available: null });
      try {
        const isAvailable = await checkUsernameAvailability(username);
        setAvailabilityCheck({ checking: false, available: isAvailable });
      } catch (error) {
        console.error("Error checking username availability:", error);
        setAvailabilityCheck({ checking: false, available: null });
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [username, user?.username]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      setError("Username must be 3-20 characters and contain only letters, numbers, and underscores");
      return;
    }

    if (username === user?.username) {
      setError("This is already your current username");
      return;
    }

    if (availabilityCheck.available === false) {
      setError("Username is already taken");
      return;
    }

    if (availabilityCheck.checking) {
      setError("Please wait while we check username availability");
      return;
    }

    if (!user?.id) {
      setError("User not found. Please try logging in again.");
      return;
    }

    setIsUpdating(true);

    try {
      await updateProfile(user.id, username, user.username);
      setSuccess(true);
      // Refresh user profile in AuthContext
      await refreshUserProfile();
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      if (err.message.includes("already taken")) {
        setError("Username is already taken");
      } else if (err.message.includes("network") || err.message.includes("fetch")) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(err.message || "Failed to update username. Please try again.");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 dark:border-white/40"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 pt-32">
      <div className="w-full max-w-md mx-auto">
        <div className="rounded-2xl border border-gray-100/80 dark:border-white/10 bg-white/95 dark:bg-black/95 backdrop-blur-xl shadow-lg p-6 md:p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="current-username" className="block text-xs font-semibold tracking-[0.18em] uppercase text-gray-500 dark:text-white/60 mb-3">
                Current Username
              </label>
              <input
                id="current-username"
                type="text"
                value={user?.username || ""}
                disabled
                className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 text-sm text-gray-500 dark:text-white/50 cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-xs font-semibold tracking-[0.18em] uppercase text-gray-500 dark:text-white/60 mb-3">
                New Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(null);
                  setSuccess(false);
                }}
                className={cn(
                  "w-full rounded-xl border px-4 py-3 text-sm transition-colors",
                  "bg-white dark:bg-white/5",
                  "border-black/10 dark:border-white/10",
                  "text-gray-900 dark:text-white",
                  "placeholder:text-gray-400 dark:placeholder:text-white/30",
                  "focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-black/10",
                  "dark:focus:border-white/20 dark:focus:ring-white/10",
                  error && error.includes("Username") ? "border-rose-500/30 focus:border-rose-500/50" : "",
                  availabilityCheck.available === false ? "border-rose-500/30 focus:border-rose-500/50" : "",
                  availabilityCheck.available === true ? "border-emerald-500/30 focus:border-emerald-500/50" : ""
                )}
                placeholder="yourusername"
                disabled={isUpdating}
              />
              <div className="flex items-center gap-2 text-xs mt-2">
                {availabilityCheck.checking && (
                  <span className="text-gray-600 dark:text-white/70">Checking availability...</span>
                )}
                {!availabilityCheck.checking && availabilityCheck.available === true && (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Username available
                  </span>
                )}
                {!availabilityCheck.checking && availabilityCheck.available === false && (
                  <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Username taken
                  </span>
                )}
                {!username && (
                  <span className="text-gray-500 dark:text-white/50">
                    3-20 characters, letters, numbers, and underscores only
                  </span>
                )}
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

            {success && (
              <div className="rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 px-3 py-2 flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0 text-emerald-500 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-xs text-emerald-500 dark:text-emerald-400">
                  Username updated successfully!
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Link href="/" className="flex-1">
                <button
                  type="button"
                  className="w-full h-9 inline-flex items-center justify-center rounded-lg bg-black/5 dark:bg-white/10 text-gray-800 dark:text-white/80 text-sm font-medium transition-colors hover:bg-black/10 dark:hover:bg-white/20 cursor-pointer"
                >
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={isUpdating || availabilityCheck.checking || username === user?.username || availabilityCheck.available !== true}
                className="flex-1 h-9 inline-flex items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black text-sm font-semibold transition-colors hover:bg-black/90 dark:hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? "Saving..." : availabilityCheck.available === true ? "Save" : "Update Username"}
              </button>
            </div>

            {success && (
              <Link href="/">
                <button
                  type="button"
                  className="w-full h-9 inline-flex items-center justify-center rounded-lg bg-black/5 dark:bg-white/10 text-gray-800 dark:text-white/80 text-sm font-medium transition-colors hover:bg-black/10 dark:hover:bg-white/20 cursor-pointer"
                >
                  Go Home
                </button>
              </Link>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

