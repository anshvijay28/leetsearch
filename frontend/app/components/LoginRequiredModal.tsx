"use client";

import Link from "next/link";

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
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-[#050507] border border-[#2a2a2f] rounded-2xl max-w-md w-full p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#06b6d4]">
            Login Required
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <svg
              className="w-5 h-5"
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
        <p className="text-sm text-zinc-300 mb-6">
          You must be logged in to view your lists.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-[#27272f] text-sm font-medium text-zinc-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <Link href="/login" className="flex-1 flex">
            <button className="flex-1 w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#06b6d4] via-[#3b82f6] to-[#6366f1] hover:brightness-110 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] text-sm font-semibold text-white cursor-pointer">
              Sign in
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

