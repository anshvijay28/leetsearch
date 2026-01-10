"use client";

import { useState, useEffect } from "react";

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
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      onClick={handleClose}
    >
      <div
        className="bg-[#050507] border border-[#2a2a2f] max-w-2xl w-full p-6 md:p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-[#06b6d4]">
            Create New List
          </h2>
          <button
            onClick={handleClose}
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

        <div className="space-y-6">
          {/* List Name */}
          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-2">
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
              className="w-full px-4 py-3 rounded-lg bg-black/50 border border-[#06b6d4]/20 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#06b6d4]/40 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter list description (optional)..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-black/50 border border-[#06b6d4]/20 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#06b6d4]/40 transition-colors resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-400 mt-2">{error}</p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-[#2a2a2f]">
          <button
            onClick={handleClose}
            className="px-6 py-2.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 text-white font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] text-white font-semibold transition-colors"
          >
            Create List
          </button>
        </div>
      </div>
    </div>
  );
}

