"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type CreateListModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, description: string, qids: number[]) => void;
};

export default function CreateListModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateListModalProps) {
  const [listName, setListName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setListName("");
      setDescription("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!listName.trim()) {
      setError("List name is required");
      return;
    }

    onSubmit(listName.trim(), description.trim(), []);
  };

  const handleClose = () => {
    setListName("");
    setDescription("");
    setError("");
    onClose();
  };

  return (
    <>
      {/* Invisible overlay to close on click outside */}
      <div
        className="fixed inset-0 z-40"
        onClick={handleClose}
      />
      {/* Modal */}
      <div
        className={cn(
          "fixed z-50",
          "w-[calc(100vw-2rem)] sm:w-[32rem] max-w-2xl",
          "max-h-[90vh] overflow-hidden",
          "rounded-2xl",
          "border border-white/10 bg-white/95 dark:bg-black/95 backdrop-blur-xl",
          "shadow-[0_30px_90px_rgba(0,0,0,0.75)]",
          "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-white/10 bg-white/95 dark:bg-black/95 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold tracking-tight text-gray-900 dark:text-white">
                Create New List
              </h2>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-white/50">
                Organize your LeetCode problems into custom lists.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="h-9 w-9 inline-flex items-center justify-center rounded-xl bg-black/5 text-gray-700 hover:bg-black/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
              aria-label="Close modal"
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
        </div>

        {/* Scrollable body */}
        <div className="max-h-[calc(90vh-140px)] overflow-y-auto scrollbar-hide px-5 py-5">
          <div className="space-y-6">
            {/* List Name */}
            <div>
              <label className="block text-xs font-semibold tracking-[0.18em] uppercase text-gray-500 dark:text-white/60 mb-3">
                List Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={listName}
                onChange={(e) => {
                  setListName(e.target.value);
                  setError("");
                }}
                placeholder="Enter list name..."
                className={cn(
                  "w-full rounded-xl border px-4 py-3 text-sm transition-colors",
                  "bg-white dark:bg-white/5",
                  "border-black/10 dark:border-white/10",
                  "text-gray-900 dark:text-white",
                  "placeholder:text-gray-400 dark:placeholder:text-white/30",
                  "focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-black/10",
                  "dark:focus:border-white/20 dark:focus:ring-white/10",
                  error ? "border-rose-500/30 focus:border-rose-500/50" : ""
                )}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold tracking-[0.18em] uppercase text-gray-500 dark:text-white/60 mb-3">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter list description (optional)..."
                rows={3}
                className={cn(
                  "w-full rounded-xl border px-4 py-3 text-sm transition-colors resize-none",
                  "bg-white dark:bg-white/5",
                  "border-black/10 dark:border-white/10",
                  "text-gray-900 dark:text-white",
                  "placeholder:text-gray-400 dark:placeholder:text-white/30",
                  "focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-black/10",
                  "dark:focus:border-white/20 dark:focus:ring-white/10"
                )}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-rose-500 dark:text-rose-400 text-sm">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 border-t border-white/10 bg-white/95 dark:bg-black/95 px-5 py-4">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={handleClose}
              className="h-9 rounded-xl px-4 text-xs font-medium transition-colors bg-black/5 text-gray-800 hover:bg-black/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="h-9 rounded-xl px-4 text-xs font-semibold transition-colors bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
            >
              Create List
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

