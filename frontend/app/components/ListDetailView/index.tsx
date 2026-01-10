"use client";

import { useEffect } from "react";
import { ListDetailViewProps } from "./types";
import { useListProblems } from "../../hooks/useListProblems";
import { useListEdit } from "../../hooks/useListEdit";
import { useProblemSearch } from "../../hooks/useProblemSearch";
import ListHeader from "./ListHeader";
import ProblemsPanel from "./ProblemsPanel";
import BrowsePanel from "./BrowsePanel";

export default function ListDetailView({
  listId,
  listName,
  listDescription,
  onDeleteList,
  onListUpdated,
}: ListDetailViewProps) {
  // Custom hooks for managing state and logic
  const {
    problems,
    isLoading: isLoadingProblems,
    error: problemsError,
    setError: setProblemsError,
    addProblem,
    removeProblem,
    isProblemInList,
  } = useListProblems(listId, onListUpdated);

  const {
    isEditing,
    editName,
    editDescription,
    isSaving,
    error: editError,
    setEditName,
    setEditDescription,
    startEditing,
    cancelEditing,
    saveEdit,
  } = useListEdit(listId, listName, listDescription || "", onListUpdated);

  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    browseMode,
    error: searchError,
    setError: setSearchError,
    resetSearch,
  } = useProblemSearch();

  // Reset search when listId changes
  useEffect(() => {
    resetSearch();
  }, [listId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Calculate stats
  const easyCount = problems.filter((p) => p.difficulty === "Easy").length;
  const mediumCount = problems.filter((p) => p.difficulty === "Medium").length;
  const hardCount = problems.filter((p) => p.difficulty === "Hard").length;

  // Combined error from all sources
  const displayError = problemsError || searchError;

  const handleAddProblem = async (qid: number) => {
    await addProblem(qid);
  };

  const handleRemoveProblem = async (qid: number) => {
    await removeProblem(qid);
  };

  const handleClearError = () => {
    setProblemsError(null);
    setSearchError(null);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">
      <ListHeader
        listName={listName}
        problemCount={problems.length}
        easyCount={easyCount}
        mediumCount={mediumCount}
        hardCount={hardCount}
        isEditing={isEditing}
        editName={editName}
        editDescription={editDescription}
        isSaving={isSaving}
        editError={editError}
        onEditNameChange={setEditName}
        onEditDescriptionChange={setEditDescription}
        onStartEdit={startEditing}
        onCancelEdit={cancelEditing}
        onSaveEdit={saveEdit}
        onDelete={onDeleteList}
      />

      {/* Side-by-Side Layout */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        <ProblemsPanel
          problems={problems}
          isLoading={isLoadingProblems}
          onRemove={handleRemoveProblem}
        />

        <BrowsePanel
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchResults={searchResults}
          isSearching={isSearching}
          browseMode={browseMode}
          error={displayError}
          onClearError={handleClearError}
          isProblemInList={isProblemInList}
          onAddProblem={handleAddProblem}
        />
      </div>
    </div>
  );
}

// Re-export types for convenience
export type { ListDetailViewProps, ListProblem } from "./types";

