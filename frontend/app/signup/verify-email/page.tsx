"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const RESEND_COOLDOWN = 60; // seconds
const PENDING_EMAIL_KEY = "pending_verification_email";
const PENDING_EMAIL_TIMESTAMP_KEY = "pending_verification_email_timestamp";
const MAX_EMAIL_AGE = 24 * 60 * 60 * 1000; // 24 hours

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email") || "";

  const [email, setEmail] = useState("");
  const [emailInput, setEmailInput] = useState(""); // Separate state for the input field
  const [isResending, setIsResending] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Initialize email from URL params or localStorage
  useEffect(() => {
    if (emailFromUrl) {
      // Email from URL takes precedence
      setEmail(emailFromUrl);
      // Store in localStorage for future use
      localStorage.setItem(PENDING_EMAIL_KEY, emailFromUrl);
      localStorage.setItem(PENDING_EMAIL_TIMESTAMP_KEY, Date.now().toString());
    } else {
      // Try to get email from localStorage
      const storedEmail = localStorage.getItem(PENDING_EMAIL_KEY);
      const timestamp = localStorage.getItem(PENDING_EMAIL_TIMESTAMP_KEY);
      
      if (storedEmail && timestamp) {
        // Check if stored email is not too old
        const age = Date.now() - parseInt(timestamp);
        if (age < MAX_EMAIL_AGE) {
          setEmail(storedEmail);
        } else {
          // Clean up old stored email
          localStorage.removeItem(PENDING_EMAIL_KEY);
          localStorage.removeItem(PENDING_EMAIL_TIMESTAMP_KEY);
        }
      }
    }
  }, [emailFromUrl]);

  // Check rate limit on mount and set up countdown
  useEffect(() => {
    if (!email) return;

    const lastResendKey = `resend_${email}`;
    const lastResend = localStorage.getItem(lastResendKey);

    if (lastResend) {
      const timeSinceLastResend = (Date.now() - parseInt(lastResend)) / 1000;
      const remainingCooldown = Math.max(0, RESEND_COOLDOWN - timeSinceLastResend);

      if (remainingCooldown > 0) {
        setCooldownSeconds(Math.ceil(remainingCooldown));
      }
    }
  }, [email]);

  // Countdown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const timer = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const handleResend = async (emailToResend?: string) => {
    const emailToUse = emailToResend || email;
    if (!emailToUse || cooldownSeconds > 0) return;

    setIsResending(true);
    setResendError(null);
    setResendSuccess(false);

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: emailToUse,
      });

      if (error) {
        // Handle specific errors
        if (
          error.message.includes("already confirmed") ||
          error.message.includes("already verified") ||
          error.message.includes("email address is already confirmed")
        ) {
          setResendError("This email is already confirmed. You can sign in now.");
        } else if (
          error.message.includes("rate limit") ||
          error.message.includes("too many") ||
          error.message.includes("rate_limit_exceeded")
        ) {
          setResendError("Please wait a few minutes before requesting another email.");
        } else if (error.message.includes("invalid") || error.message.includes("not found")) {
          setResendError("Invalid email address. Please check and try again.");
        } else if (error.message.includes("network") || error.message.includes("fetch")) {
          setResendError("Network error. Please check your connection and try again.");
        } else {
          setResendError(error.message || "Failed to resend email. Please try again.");
        }
        setIsResending(false);
        return;
      }

      // Success - update rate limit and store email in localStorage
      const lastResendKey = `resend_${emailToUse}`;
      localStorage.setItem(lastResendKey, Date.now().toString());
      localStorage.setItem(PENDING_EMAIL_KEY, emailToUse);
      localStorage.setItem(PENDING_EMAIL_TIMESTAMP_KEY, Date.now().toString());
      setCooldownSeconds(RESEND_COOLDOWN);
      setResendSuccess(true);
      setIsResending(false);

      // Clear success message after 5 seconds
      setTimeout(() => {
        setResendSuccess(false);
      }, 5000);
    } catch (err: any) {
      setResendError("An unexpected error occurred. Please try again.");
      setIsResending(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput) {
      // Set the actual email state from the input and store in localStorage
      setEmail(emailInput);
      localStorage.setItem(PENDING_EMAIL_KEY, emailInput);
      localStorage.setItem(PENDING_EMAIL_TIMESTAMP_KEY, Date.now().toString());
      // Trigger resend with the input email
      await handleResend(emailInput);
    }
  };

  // Show form for email entry if no email is available
  if (!email) {
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
            <div className="text-center space-y-4 mb-6">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Request confirmation email
              </h1>
              <p className="text-sm text-zinc-400">
                Enter your email address to receive a new confirmation email
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label htmlFor="email-input" className="block text-sm font-medium text-zinc-200 mb-2">
                  Email address
                </label>
                <input
                  id="email-input"
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full rounded-lg border border-[#27272f] bg-zinc-950/60 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent"
                  placeholder="you@example.com"
                  required
                />
              </div>

              {resendError && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
                  <p className="text-xs text-red-400">{resendError}</p>
                </div>
              )}

              {resendSuccess && (
                <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-2">
                  <p className="text-xs text-green-400">
                    Confirmation email sent! Please check your inbox.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isResending || !emailInput}
                className="w-full inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#06b6d4] via-[#3b82f6] to-[#6366f1] px-3 py-2.5 text-sm font-medium text-white shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:brightness-110 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isResending ? "Sending..." : "Send confirmation email"}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-[#27272f]">
              <p className="text-xs text-center text-zinc-500">
                Need to sign up?{" "}
                <Link
                  href="/signup"
                  className="text-zinc-300 hover:text-[#06b6d4] transition-colors"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
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
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-[#06b6d4] via-[#3b82f6] to-[#6366f1] flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">
            Check your email
          </h1>
          <p className="text-sm text-zinc-400">
            We&apos;ve sent a confirmation email to:
          </p>
          <p className="text-base font-medium text-[#06b6d4] mt-2 break-all">
            {email}
          </p>
        </div>

        <div className="rounded-2xl border border-[#27272f] bg-black/70 backdrop-blur-md shadow-[0_0_60px_rgba(15,23,42,0.75)] p-6 md:p-8 space-y-6">
          <div className="space-y-4">
            <div className="bg-zinc-900/50 rounded-lg p-4 space-y-2">
              <p className="text-sm text-zinc-300">
                Click the confirmation link in the email to verify your account.
              </p>
              <ul className="text-xs text-zinc-400 space-y-1 list-disc list-inside">
                <li>Didn&apos;t receive it? Check your spam folder</li>
                <li>Make sure you entered the correct email address</li>
              </ul>
            </div>

            {resendSuccess && (
              <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-2">
                <p className="text-xs text-green-400">
                  Confirmation email sent! Please check your inbox.
                </p>
              </div>
            )}

            {resendError && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
                <p className="text-xs text-red-400">{resendError}</p>
              </div>
            )}

            <button
              onClick={() => handleResend()}
              disabled={isResending || cooldownSeconds > 0}
              className="w-full inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#06b6d4] via-[#3b82f6] to-[#6366f1] px-3 py-2.5 text-sm font-medium text-white shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:brightness-110 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isResending
                ? "Sending..."
                : cooldownSeconds > 0
                ? `Resend email (${cooldownSeconds}s)`
                : "Resend confirmation email"}
            </button>
          </div>

          <div className="pt-4 border-t border-[#27272f]">
            <p className="text-xs text-center text-zinc-500">
              Already confirmed?{" "}
              <Link
                href="/login"
                className="text-zinc-300 hover:text-[#06b6d4] transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

