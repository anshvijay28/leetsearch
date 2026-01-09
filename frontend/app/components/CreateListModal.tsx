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
  const [qidInput, setQidInput] = useState("");
  const [qids, setQids] = useState<number[]>([]);
  const [error, setError] = useState("");

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setListName("");
      setDescription("");
      setQidInput("");
      setQids([]);
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddQid = () => {
    const trimmed = qidInput.trim();
    if (!trimmed) return;

    const qid = parseInt(trimmed, 10);
    if (isNaN(qid) || qid <= 0) {
      setError("Please enter a valid positive number for QID");
      return;
    }

    if (qids.includes(qid)) {
      setError("This QID is already in the list");
      return;
    }

    setQids([...qids, qid]);
    setQidInput("");
    setError("");
  };

  const handleRemoveQid = (qidToRemove: number) => {
    setQids(qids.filter((qid) => qid !== qidToRemove));
    setError("");
  };

  const handleSubmit = () => {
    if (!listName.trim()) {
      setError("List name is required");
      return;
    }

    // Call parent's onSubmit (which will close modal on success)
    onSubmit(listName.trim(), description.trim(), qids);
    // Form will be reset when modal closes via onClose
  };

  const handleClose = () => {
    // Reset form on close
    setListName("");
    setDescription("");
    setQidInput("");
    setQids([]);
    setError("");
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddQid();
    }
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

          {/* QIDs Input */}
          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-2">
              Problem IDs (QIDs)
            </label>
            <p className="text-xs text-zinc-500 mb-3">
              Add LeetCode question IDs to include in this list
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={qidInput}
                onChange={(e) => {
                  setQidInput(e.target.value);
                  setError("");
                }}
                onKeyPress={handleKeyPress}
                placeholder="Enter QID (e.g., 1, 2, 3)..."
                className="flex-1 px-4 py-3 rounded-lg bg-black/50 border border-[#06b6d4]/20 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#06b6d4]/40 transition-colors"
              />
              <button
                onClick={handleAddQid}
                className="px-6 py-3 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] text-white font-semibold transition-colors"
              >
                Add
              </button>
            </div>
            {error && (
              <p className="text-xs text-rose-400 mt-2">{error}</p>
            )}

            {/* QID Tags */}
            {qids.length > 0 && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {qids.map((qid) => (
                    <span
                      key={qid}
                      className="px-3 py-1.5 rounded-full text-sm bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-2"
                    >
                      {qid}
                      <button
                        onClick={() => handleRemoveQid(qid)}
                        className="hover:text-cyan-200 cursor-pointer"
                        type="button"
                      >
                        <svg
                          className="w-4 h-4"
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
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => setQids([])}
                  className="mt-3 text-xs text-zinc-400 hover:text-zinc-300 transition-colors"
                  type="button"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
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

