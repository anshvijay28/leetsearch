"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import Header from "../components/Header";
import CreateListModal from "../components/CreateListModal";
import ListDetailView from "../components/ListDetailView";

type List = {
  id: string;
  name: string;
  problem_count: number;
};

export default function ListsPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [lists, setLists] = useState<List[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedList, setSelectedList] = useState<List | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, loading, router]);

  // Fetch lists from backend
  useEffect(() => {
    if (isAuthenticated && !loading) {
      fetchLists();
    }
  }, [isAuthenticated, loading]);

  const fetchLists = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get<List[]>('/api/py/lists');
      setLists(response.data);
    } catch (err) {
      console.error('Failed to fetch lists:', err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError("Please log in to view your lists");
      } else {
        setError("Failed to load lists. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleListClick = (list: List) => {
    setSelectedList(list);
  };

  const handleDeleteList = async () => {
    if (!selectedList) return;

    setIsLoading(true);
    setError(null);

    try {
      await axios.delete(`/api/py/lists/${selectedList.id}`);

      // Remove list from state (optimistic update)
      const updatedLists = lists.filter((list) => list.id !== selectedList.id);
      setLists(updatedLists);
      
      // Select first list if available, otherwise clear selection
      if (updatedLists.length > 0) {
        setSelectedList(updatedLists[0]);
      } else {
        setSelectedList(null);
      }
    } catch (err) {
      console.error("Failed to delete list:", err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError("Please log in to delete a list");
        } else if (err.response?.status === 404) {
          setError("List not found or you don't have permission to delete it");
        } else {
          setError("Failed to delete list. Please try again.");
        }
      } else {
        setError("Failed to delete list. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };


  const handleCreateList = () => {
    setShowCreateModal(true);
  };


  const handleSubmitList = async (name: string, description: string, qids: number[]) => {
    // Note: qids are for show only, not sent to backend
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post<List>('/api/py/lists', {
        name: name.trim(),
        description: description.trim() || undefined,
      });
      
      // Add new list to state (optimistic update)
      const newList = response.data;
      setLists([newList, ...lists]);
      // Auto-select the newly created list
      setSelectedList(newList);
      setShowCreateModal(false);
    } catch (err) {
      console.error('Failed to create list:', err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError("Please log in to create a list");
        } else if (err.response?.status === 400) {
          setError(err.response.data?.detail || "Invalid list data. Please check your input.");
        } else {
          setError("Failed to create list. Please try again.");
        }
      } else {
        setError("Failed to create list. Please try again.");
      }
    } finally {
      setIsLoading(false);
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
    <div className="min-h-screen text-white flex flex-col">
      <Header />

      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Lists */}
        <aside className="w-64 border-r border-zinc-800 bg-[#050507] overflow-y-auto flex flex-col">
          <div className="p-4 border-b border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">My Lists</h2>
              <button
                onClick={handleCreateList}
                className="p-1.5 text-zinc-400 hover:text-[#06b6d4] transition-colors"
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
                <p className="text-sm text-[#06b6d4]">Loading lists...</p>
              </div>
            ) : lists.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-sm text-zinc-400">
                  No lists yet. Create one to get started!
                </p>
              </div>
            ) : (
              <div className="py-2">
                {lists.map((list) => (
                  <button
                    key={list.id}
                    onClick={() => handleListClick(list)}
                    className={`w-full text-left px-4 py-3 transition-colors border-l-2 ${
                      selectedList?.id === list.id
                        ? "bg-[#06b6d4]/10 border-[#06b6d4] text-[#06b6d4]"
                        : "border-transparent hover:bg-black/30 text-zinc-300 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{list.name}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">
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
            <div className="p-4 border-t border-zinc-800">
              <p className="text-xs text-rose-400">{error}</p>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {selectedList ? (
            <div className="flex-1 p-6 overflow-hidden">
              <ListDetailView
                listId={selectedList.id}
                listName={selectedList.name}
                onDeleteList={handleDeleteList}
                onListUpdated={fetchLists}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center max-w-md">
                {lists.length === 0 ? (
                  <>
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#06b6d4]/20 flex items-center justify-center">
                      <svg
                        className="w-10 h-10 text-[#06b6d4]"
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
                    <h2 className="text-2xl font-semibold text-white mb-3">
                      Create Your First List
                    </h2>
                    <p className="text-zinc-400 mb-6">
                      Organize your LeetCode problems into custom lists. Click the + button in the sidebar to create a new list.
                    </p>
                    <button
                      onClick={handleCreateList}
                      className="px-6 py-3 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] text-white font-semibold transition-colors"
                    >
                      Create List
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#06b6d4]/20 flex items-center justify-center">
                      <svg
                        className="w-10 h-10 text-[#06b6d4]"
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
                    <h2 className="text-2xl font-semibold text-white mb-3">
                      Select a List
                    </h2>
                    <p className="text-zinc-400 mb-2">
                      Choose a list from the sidebar to view and manage its problems.
                    </p>
                    <p className="text-sm text-zinc-500">
                      You have {lists.length} {lists.length === 1 ? "list" : "lists"} available.
                    </p>
                  </>
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

