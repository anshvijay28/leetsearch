"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { updateProfile, checkUsernameAvailability } from "@/lib/profile";

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
      <div className="min-h-screen flex items-center justify-center bg-[#020205] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-white">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-[#06b6d4] transition-colors mb-4"
          >
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-[#06b6d4] via-[#3b82f6] to-[#6366f1]" />
            <span className="font-semibold tracking-tight text-[#06b6d4]">
              LeetSearch
            </span>
          </Link>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">
            Profile Settings
          </h1>
          <p className="text-sm text-zinc-400">
            Update your username
          </p>
        </div>

        <div className="rounded-2xl border border-[#27272f] bg-black/70 backdrop-blur-md shadow-[0_0_60px_rgba(15,23,42,0.75)] p-6 md:p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="current-username" className="text-sm font-medium text-zinc-200">
                Current Username
              </label>
              <input
                id="current-username"
                type="text"
                value={user?.username || ""}
                disabled
                className="w-full rounded-lg border border-[#27272f] bg-zinc-950/60 px-3 py-2.5 text-sm text-zinc-400 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-zinc-200">
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
                className={`w-full rounded-lg border ${
                  error && error.includes("Username")
                    ? "border-red-500/50"
                    : availabilityCheck.available === false
                    ? "border-red-500/50"
                    : availabilityCheck.available === true
                    ? "border-green-500/50"
                    : "border-[#27272f]"
                } bg-zinc-950/60 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent`}
                placeholder="yourusername"
                disabled={isUpdating}
              />
              <div className="flex items-center gap-2 text-xs">
                {availabilityCheck.checking && (
                  <span className="text-zinc-400">Checking availability...</span>
                )}
                {!availabilityCheck.checking && availabilityCheck.available === true && (
                  <span className="text-green-400">✓ Username available</span>
                )}
                {!availabilityCheck.checking && availabilityCheck.available === false && (
                  <span className="text-red-400">✗ Username taken</span>
                )}
                {!username && (
                  <span className="text-zinc-500">
                    3-20 characters, letters, numbers, and underscores only
                  </span>
                )}
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            {success && (
              <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-2">
                <p className="text-xs text-green-400">
                  Username updated successfully!
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isUpdating || availabilityCheck.checking || username === user?.username}
              className="w-full inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#06b6d4] via-[#3b82f6] to-[#6366f1] px-3 py-2.5 text-sm font-medium text-white shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:brightness-110 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isUpdating ? "Updating..." : "Update Username"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

