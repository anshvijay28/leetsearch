"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type LoginRequiredModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function LoginRequiredModal({
  isOpen,
  onClose,
}: LoginRequiredModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Invisible overlay to close on click outside */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      {/* Modal */}
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center px-4"
        )}
        onClick={onClose}
      >
        <div
          className={cn(
            "max-w-md w-full rounded-2xl",
            "border border-white/10 bg-white/95 dark:bg-black/95 backdrop-blur-xl",
            "shadow-[0_30px_90px_rgba(0,0,0,0.75)]",
            "p-6 md:p-8"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold tracking-tight text-gray-900 dark:text-white">
              Login Required
            </h2>
            <button
              onClick={onClose}
              className="h-9 w-9 inline-flex items-center justify-center rounded-xl bg-black/5 text-gray-700 hover:bg-black/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
              aria-label="Close"
            >
              <svg
                className="h-4 w-4"
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
            </button>
          </div>

          {/* Content */}
          <p className="text-sm text-gray-600 dark:text-white/60 mb-6">
            You must be logged in to view your lists.
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 h-9 inline-flex items-center justify-center rounded-lg bg-black/5 dark:bg-white/10 text-gray-800 dark:text-white/80 text-sm font-medium transition-colors hover:bg-black/10 dark:hover:bg-white/20 cursor-pointer"
            >
              Cancel
            </button>
            <Link href="/login" className="flex-1">
              <button className="w-full h-9 inline-flex items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black text-sm font-semibold transition-colors hover:bg-black/90 dark:hover:bg-white/90 cursor-pointer">
                Sign in
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

