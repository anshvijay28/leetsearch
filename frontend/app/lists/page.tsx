"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import CreateListModal from "../components/CreateListModal";
import ListDetailView from "../components/ListDetailView";
import { useLists, type List } from "../hooks/useLists";

export default function ListsPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedList, setSelectedList] = useState<List | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  // ============================================
  // React Query hook - replaces useState + useEffect + axios
  // ============================================
  const {
    lists,
    isLoading,
    error: listsError,
    createList,
    deleteList,
  } = useLists();

  // Combined error from query or mutations
  const error = listsError || mutationError;

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, loading, router]);

  // Sync selectedList with cache when lists updates (e.g., after editing name/description)
  useEffect(() => {
    if (selectedList && lists.length > 0) {
      const updatedList = lists.find((l) => l.id === selectedList.id);
      if (updatedList && (updatedList.name !== selectedList.name || updatedList.description !== selectedList.description)) {
        setSelectedList(updatedList);
      }
    }
  }, [lists, selectedList]);

  const handleListClick = (list: List) => {
    setSelectedList(list);
  };

  // ============================================
  // DELETE: Now uses React Query mutation
  // ============================================
  const handleDeleteList = async () => {
    if (!selectedList) return;
    setMutationError(null);

    try {
      await deleteList(selectedList.id);

      // React Query will refetch lists automatically (via invalidateQueries)
      // We just need to update the selection
      const remainingLists = lists.filter((list) => list.id !== selectedList.id);
      if (remainingLists.length > 0) {
        setSelectedList(remainingLists[0]);
      } else {
        setSelectedList(null);
      }
    } catch (err) {
      console.error("Failed to delete list:", err);
      setMutationError("Failed to delete list. Please try again.");
    }
  };

  const handleCreateList = () => {
    setShowCreateModal(true);
  };

  // ============================================
  // CREATE: Now uses React Query mutation
  // ============================================
  const handleSubmitList = async (name: string, description: string, qids: number[]) => {
    setMutationError(null);

    try {
      const newList = await createList({
        name: name.trim(),
        description: description.trim() || undefined,
      });

      // React Query will refetch lists automatically
      // Just select the new list and close modal
      setSelectedList(newList);
      setShowCreateModal(false);
    } catch (err) {
      console.error("Failed to create list:", err);
      setMutationError("Failed to create list. Please try again.");
    }
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#06b6d4]">Loading...</div>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen text-white flex flex-col overflow-hidden">
      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Lists */}
        <aside className="w-64 border-r border-gray-100/80 dark:border-white/10 bg-white/95 dark:bg-black/95 backdrop-blur-xl overflow-y-auto flex flex-col">
          <div className="p-5 border-b border-gray-100/80 dark:border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Lists</h2>
              <button
                onClick={handleCreateList}
                className="h-9 w-9 inline-flex items-center justify-center rounded-xl bg-black/5 dark:bg-white/10 text-gray-700 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
                title="Create new list"
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
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading && lists.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-600 dark:text-white/70">Loading lists...</p>
              </div>
            ) : lists.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-600 dark:text-white/60">
                  No lists yet. Create one to get started!
                </p>
              </div>
            ) : (
              <div className="py-2 px-2">
                {lists.map((list) => (
                  <button
                    key={list.id}
                    onClick={() => handleListClick(list)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${selectedList?.id === list.id
                      ? "bg-black/5 dark:bg-white/10 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10"
                      : "hover:bg-black/5 dark:hover:bg-white/5 text-gray-700 dark:text-white/70"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">{list.name}</p>
                        <p className="text-xs text-gray-500 dark:text-white/50 mt-0.5">
                          {list.problem_count} {list.problem_count === 1 ? "question" : "questions"}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Error State */}
          {error && (
            <div className="p-4 border-t border-gray-100/80 dark:border-white/10">
              <p className="text-xs text-rose-500 dark:text-rose-400">{error}</p>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {selectedList ? (
            <div className="flex-1 p-6 overflow-hidden">
              {/* React Query handles cache sync - no onListUpdated needed! */}
              <ListDetailView
                listId={selectedList.id}
                listName={selectedList.name}
                listDescription={selectedList.description}
                onDeleteList={handleDeleteList}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center max-w-md">
                {lists.length === 0 ? (
                  <div className="rounded-2xl border border-gray-100/80 dark:border-white/10 bg-white/95 dark:bg-black/95 backdrop-blur-xl p-8 shadow-lg">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-gray-600 dark:text-white/70"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Create Your First List
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-white/60 mb-6">
                      Organize your LeetCode problems into custom lists. Click the + button in the sidebar to create a new list.
                    </p>
                    <button
                      onClick={handleCreateList}
                      className="px-4 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black text-sm font-semibold transition-colors hover:bg-black/90 dark:hover:bg-white/90"
                    >
                      Create List
                    </button>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-gray-100/80 dark:border-white/10 bg-white/95 dark:bg-black/95 backdrop-blur-xl p-8 shadow-lg">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-gray-600 dark:text-white/70"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Select a List
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-white/60 mb-1">
                      Choose a list from the sidebar to view and manage its problems.
                    </p>
                    <p className="text-xs text-gray-500 dark:text-white/50">
                      You have {lists.length} {lists.length === 1 ? "list" : "lists"} available.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <CreateListModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleSubmitList}
      />
    </div>
  );
}

