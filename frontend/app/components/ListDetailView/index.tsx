"use client";

import { useEffect } from "react";
import { ListDetailViewProps } from "./types";
import { useListProblems, type AddProblemInput } from "../../hooks/useListProblems";
import { useListEdit } from "../../hooks/useListEdit";
import { useProblemSearch } from "../../hooks/useProblemSearch";
import { useSimilarProblems } from "../../hooks/useSimilarProblems";
import ListHeader from "./ListHeader";
import ProblemsPanel from "./ProblemsPanel";
import BrowsePanel from "./BrowsePanel";

export default function ListDetailView({
  listId,
  listName,
  listDescription,
  onDeleteList,
}: ListDetailViewProps) {
  // ============================================
  // React Query hooks - cache invalidation is automatic now!
  // No need for onListUpdated callback anymore
  // ============================================
  const {
    problems,
    isLoading: isLoadingProblems,
    error: problemsError,
    clearError: clearProblemsError,
    addProblem,
    removeProblem,
    isProblemInList,
  } = useListProblems(listId);

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
  } = useListEdit(listId, listName, listDescription || "");

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

  const {
    similarQid,
    similarTitle,
    similarResults,
    isLoadingSimilar,
    error: similarError,
    setError: setSimilarError,
    findSimilar,
    clearSimilar,
  } = useSimilarProblems();

  useEffect(() => {
    resetSearch();
    clearSimilar();
  }, [listId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Calculate stats
  const easyCount = problems.filter((p) => p.difficulty === "Easy").length;
  const mediumCount = problems.filter((p) => p.difficulty === "Medium").length;
  const hardCount = problems.filter((p) => p.difficulty === "Hard").length;

  const displayError = problemsError || searchError || similarError;

  const handleAddProblem = async (input: AddProblemInput) => {
    await addProblem(input);
  };

  const handleRemoveProblem = async (qid: number) => {
    await removeProblem(qid);
  };

  const handleClearError = () => {
    clearProblemsError();
    setSearchError(null);
    setSimilarError(null);
  };

  const handleFindSimilar = (qid: number, title: string) => {
    resetSearch();
    findSimilar(qid, title);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">
      <ListHeader
        listName={listName}
        listDescription={listDescription}
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
          onFindSimilar={handleFindSimilar}
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
          similarQid={similarQid}
          similarTitle={similarTitle}
          similarResults={similarResults}
          isLoadingSimilar={isLoadingSimilar}
          onClearSimilar={clearSimilar}
        />
      </div>
    </div>
  );
}

// Re-export types for convenience
export type { ListDetailViewProps, ListProblem } from "./types";

