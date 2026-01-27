"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

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
      <div className="border-b border-gray-100/80 dark:border-white/10 pb-4 mb-4 flex-shrink-0">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold tracking-[0.18em] uppercase text-gray-500 dark:text-white/60 mb-3">
              List Name
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => onEditNameChange(e.target.value)}
              placeholder="List name"
              className={cn(
                "w-full rounded-xl border px-4 py-3 text-lg font-semibold transition-colors",
                "bg-white dark:bg-white/5",
                "border-black/10 dark:border-white/10",
                "text-gray-900 dark:text-white",
                "placeholder:text-gray-400 dark:placeholder:text-white/30",
                "focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-black/10",
                "dark:focus:border-white/20 dark:focus:ring-white/10",
                editError ? "border-rose-500/30 focus:border-rose-500/50" : ""
              )}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-[0.18em] uppercase text-gray-500 dark:text-white/60 mb-3">
              Description
            </label>
            <input
              type="text"
              value={editDescription}
              onChange={(e) => onEditDescriptionChange(e.target.value)}
              placeholder="Description (optional)"
              className={cn(
                "w-full rounded-xl border px-4 py-3 text-sm transition-colors",
                "bg-white dark:bg-white/5",
                "border-black/10 dark:border-white/10",
                "text-gray-900 dark:text-white",
                "placeholder:text-gray-400 dark:placeholder:text-white/30",
                "focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-black/10",
                "dark:focus:border-white/20 dark:focus:ring-white/10"
              )}
            />
          </div>
          {editError && (
            <div className="flex items-center gap-2 text-rose-500 dark:text-rose-400 text-sm">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{editError}</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={onSaveEdit}
              disabled={isSaving}
              className="h-9 px-4 rounded-lg bg-black text-white dark:bg-white dark:text-black text-sm font-semibold transition-colors hover:bg-black/90 dark:hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={onCancelEdit}
              disabled={isSaving}
              className="h-9 px-4 rounded-lg bg-black/5 dark:bg-white/10 text-gray-800 dark:text-white/80 text-sm font-medium transition-colors hover:bg-black/10 dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-gray-100/80 dark:border-white/10 pb-4 mb-4 flex-shrink-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-1">{listName}</h1>
          {listDescription && (
            <p className="text-sm text-gray-600 dark:text-white/60 mb-1">{listDescription}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-white/50">{problemCount} questions</p>
        </div>
        <div className="flex items-center gap-3">
          {showDeleteConfirm ? (
            <>
              <button
                onClick={handleCancelDelete}
                className="h-9 px-4 rounded-lg bg-black/5 dark:bg-white/10 text-gray-800 dark:text-white/80 text-sm font-medium transition-colors hover:bg-black/10 dark:hover:bg-white/20"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="h-9 px-4 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold transition-colors"
              >
                Confirm Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onStartEdit}
                className="h-9 px-4 rounded-lg bg-black/5 dark:bg-white/10 text-gray-800 dark:text-white/80 text-sm font-medium transition-colors hover:bg-black/10 dark:hover:bg-white/20"
              >
                Edit
              </button>
              <button
                onClick={handleDeleteClick}
                className="h-9 px-4 rounded-lg bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-semibold transition-colors hover:bg-rose-500/20 dark:hover:bg-rose-500/30"
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
          <div className="text-sm text-gray-600 dark:text-white/60">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Easy:</span> {easyCount}
          </div>
          <div className="text-sm text-gray-600 dark:text-white/60">
            <span className="text-amber-600 dark:text-amber-400 font-medium">Medium:</span> {mediumCount}
          </div>
          <div className="text-sm text-gray-600 dark:text-white/60">
            <span className="text-rose-600 dark:text-rose-400 font-medium">Hard:</span> {hardCount}
          </div>
        </div>
      )}
    </div>
  );
}

