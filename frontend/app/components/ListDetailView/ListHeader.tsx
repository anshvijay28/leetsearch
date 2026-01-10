"use client";

import { useState } from "react";

type ListHeaderProps = {
  listName: string;
  listDescription?: string;
  problemCount: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  // Edit mode props
  isEditing: boolean;
  editName: string;
  editDescription: string;
  isSaving: boolean;
  editError: string | null;
  onEditNameChange: (name: string) => void;
  onEditDescriptionChange: (description: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  // Delete props
  onDelete: () => void;
};

export default function ListHeader({
  listName,
  listDescription,
  problemCount,
  easyCount,
  mediumCount,
  hardCount,
  isEditing,
  editName,
  editDescription,
  isSaving,
  editError,
  onEditNameChange,
  onEditDescriptionChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
}: ListHeaderProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = () => setShowDeleteConfirm(true);
  const handleCancelDelete = () => setShowDeleteConfirm(false);
  const handleConfirmDelete = () => {
    onDelete();
    setShowDeleteConfirm(false);
  };

  if (isEditing) {
    return (
      <div className="border-b border-zinc-800 pb-4 mb-4 flex-shrink-0">
        <div className="space-y-3">
          <input
            type="text"
            value={editName}
            onChange={(e) => onEditNameChange(e.target.value)}
            placeholder="List name"
            className="w-full px-4 py-2 text-xl font-semibold rounded-lg bg-black/50 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#06b6d4]/40 transition-colors"
            autoFocus
          />
          <input
            type="text"
            value={editDescription}
            onChange={(e) => onEditDescriptionChange(e.target.value)}
            placeholder="Description (optional)"
            className="w-full px-4 py-2 rounded-lg bg-black/50 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#06b6d4]/40 transition-colors"
          />
          {editError && <p className="text-sm text-rose-400">{editError}</p>}
          <div className="flex items-center gap-3">
            <button
              onClick={onSaveEdit}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={onCancelEdit}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-zinc-800 pb-4 mb-4 flex-shrink-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h1 className="text-3xl font-semibold text-white mb-1">{listName}</h1>
          {listDescription && (
            <p className="text-sm text-zinc-400 mb-1">{listDescription}</p>
          )}
          <p className="text-xs text-zinc-500">{problemCount} questions</p>
        </div>
        <div className="flex items-center gap-3">
          {showDeleteConfirm ? (
            <>
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold transition-colors"
              >
                Confirm Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onStartEdit}
                className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-semibold transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleDeleteClick}
                className="px-4 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-sm font-semibold transition-colors"
              >
                Delete List
              </button>
            </>
          )}
        </div>
      </div>

      {/* Progress Stats */}
      {problemCount > 0 && (
        <div className="flex items-center gap-6">
          <div className="text-sm text-zinc-400">
            <span className="text-green-400">Easy:</span> {easyCount}
          </div>
          <div className="text-sm text-zinc-400">
            <span className="text-yellow-400">Medium:</span> {mediumCount}
          </div>
          <div className="text-sm text-zinc-400">
            <span className="text-rose-400">Hard:</span> {hardCount}
          </div>
        </div>
      )}
    </div>
  );
}

