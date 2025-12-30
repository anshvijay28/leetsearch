"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const POLL_INTERVAL = 500; // milliseconds
const TIMEOUT = 30000; // 30 seconds
const PENDING_EMAIL_KEY = "pending_verification_email";
const PENDING_EMAIL_TIMESTAMP_KEY = "pending_verification_email_timestamp";
const MAX_EMAIL_AGE = 24 * 60 * 60 * 1000; // 24 hours

export default function ConfirmEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"checking" | "success" | "error" | "timeout" | "expired_no_email">("checking");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  // Check localStorage for pending email verification
  useEffect(() => {
    const storedEmail = localStorage.getItem(PENDING_EMAIL_KEY);
    const timestamp = localStorage.getItem(PENDING_EMAIL_TIMESTAMP_KEY);
    
    if (storedEmail && timestamp) {
      // Check if stored email is not too old
      const age = Date.now() - parseInt(timestamp);
      if (age < MAX_EMAIL_AGE) {
        setPendingEmail(storedEmail);
      } else {
        // Clean up old stored email
        localStorage.removeItem(PENDING_EMAIL_KEY);
        localStorage.removeItem(PENDING_EMAIL_TIMESTAMP_KEY);
      }
    }
  }, []);

  useEffect(() => {
    // Check URL hash and search params for errors first, before starting session polling
    let hasError = false;

    // Check hash parameters (most common for Supabase auth errors)
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      
      if (hash) {
        const hashParams = new URLSearchParams(hash.substring(1)); // Remove the '#'
        const error = hashParams.get("error");
        const errorCode = hashParams.get("error_code");

        if (error || errorCode) {
          hasError = true;
        }
      }

      // Also check search params (in case errors are there instead)
      const errorParam = searchParams.get("error");
      const errorCodeParam = searchParams.get("error_code");
      
      if (errorParam || errorCodeParam) {
        hasError = true;
      }
    }

    // If error detected, check if we have email in localStorage
    if (hasError) {
      const storedEmail = localStorage.getItem(PENDING_EMAIL_KEY);
      const timestamp = localStorage.getItem(PENDING_EMAIL_TIMESTAMP_KEY);
      let hasValidEmail = false;
      
      if (storedEmail && timestamp) {
        const age = Date.now() - parseInt(timestamp);
        if (age < MAX_EMAIL_AGE) {
          hasValidEmail = true;
        }
      }

      // If we don't have a valid email, use special status to show different message
      if (!hasValidEmail) {
        setStatus("expired_no_email");
        setErrorMessage("Verification link has expired. You'll need to enter your email address to request a new confirmation email.");
        // Don't redirect automatically, let user click the button
        return;
      } else {
        // We have email, so this is a regular error (network issue, etc.)
        setStatus("error");
        setErrorMessage("Verification link has expired. Please request a new confirmation email.");
        // For regular errors, still show the button (no auto-redirect)
        return;
      }
    }

    // No error found, proceed with session polling
    let pollInterval: NodeJS.Timeout | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    async function checkSession() {
      try {
        // Supabase automatically processes the token from URL when the page loads
        // We just need to poll for the session to appear
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          setStatus("error");
          setErrorMessage(error.message || "Failed to verify email. The link may be invalid or expired.");
          return;
        }

        if (session) {
          // User is confirmed and logged in
          setStatus("success");
          
          // Clear any intervals/timeouts
          if (pollInterval) clearInterval(pollInterval);
          if (timeoutId) clearTimeout(timeoutId);

          // Clean up stored email on successful verification
          localStorage.removeItem(PENDING_EMAIL_KEY);
          localStorage.removeItem(PENDING_EMAIL_TIMESTAMP_KEY);

          // Redirect to home after a brief delay to show success message
          setTimeout(() => {
            router.push("/");
          }, 1500);
          return;
        }

        // No session yet, continue polling
      } catch (err: any) {
        console.error("Session check error:", err);
        setStatus("error");
        setErrorMessage("An unexpected error occurred. Please try again.");
        
        if (pollInterval) clearInterval(pollInterval);
        if (timeoutId) clearTimeout(timeoutId);
      }
    }

    // Start polling for session
    checkSession(); // Initial check
    pollInterval = setInterval(checkSession, POLL_INTERVAL);

    // Set timeout
    timeoutId = setTimeout(() => {
      if (pollInterval) clearInterval(pollInterval);
      setStatus("timeout");
      setErrorMessage("Verification timed out. The link may have expired. Please request a new confirmation email.");
    }, TIMEOUT);

    // Cleanup
    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-white bg-[#020205]">
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
        </div>

        <div className="rounded-2xl border border-[#27272f] bg-black/70 backdrop-blur-md shadow-[0_0_60px_rgba(15,23,42,0.75)] p-6 md:p-8">
          {status === "checking" && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-[#06b6d4] via-[#3b82f6] to-[#6366f1] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Verifying your email
              </h1>
              <p className="text-sm text-zinc-400">
                Please wait while we confirm your email address...
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-green-400">
                Email confirmed!
              </h1>
              <p className="text-sm text-zinc-400">
                Your account has been verified. Redirecting you now...
              </p>
            </div>
          )}

          {status === "expired_no_email" && (
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-orange-400 mb-2">
                  Verification link expired
                </h1>
                <p className="text-sm text-zinc-400 mb-2">
                  {errorMessage}
                </p>
                <p className="text-xs text-zinc-500 mb-4">
                  We don't have your email address saved, so you'll need to enter it manually.
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#27272f]">
                <Link
                  href="/signup/verify-email"
                  className="block w-full inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#06b6d4] via-[#3b82f6] to-[#6366f1] px-3 py-2.5 text-sm font-medium text-white shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:brightness-110 transition"
                >
                  Enter email to request new confirmation link
                </Link>
                <Link
                  href="/login"
                  className="block text-sm text-zinc-400 hover:text-[#06b6d4] transition-colors"
                >
                  Back to sign in
                </Link>
              </div>
            </div>
          )}

          {(status === "error" || status === "timeout") && (
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-red-400 mb-2">
                  Verification failed
                </h1>
                <p className="text-sm text-zinc-400 mb-4">
                  {errorMessage}
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#27272f]">
                <Link
                  href={pendingEmail 
                    ? `/signup/verify-email?email=${encodeURIComponent(pendingEmail)}`
                    : "/signup/verify-email"}
                  className="block w-full inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#06b6d4] via-[#3b82f6] to-[#6366f1] px-3 py-2.5 text-sm font-medium text-white shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:brightness-110 transition"
                >
                  Request new confirmation email
                </Link>
                <Link
                  href="/login"
                  className="block text-sm text-zinc-400 hover:text-[#06b6d4] transition-colors"
                >
                  Back to sign in
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

