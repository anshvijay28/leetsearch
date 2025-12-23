"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import QuestionCard from "../components/QuestionCard";
import ComingSoonModal from "../components/ComingSoonModal";
import { Question } from "../types";
import { SAMPLE_QUESTIONS } from "../data/sampleQuestions";

export default function ListsPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [hasStartedMakingList, setHasStartedMakingList] = useState(false);
  const [listName, setListName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [listQuestions, setListQuestions] = useState<Question[]>([]);
  const [searchResults, setSearchResults] = useState<Question[]>([]);
  const [showComingSoon, setShowComingSoon] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, loading, router]);

  const handleBeginMakingList = () => {
    setHasStartedMakingList(true);
  };

  const handleSearch = () => {
    // Dummy search - just show sample questions
    setSearchResults(SAMPLE_QUESTIONS);
  };

  const handleAddQuestion = (question: Question) => {
    // Check if question already in list
    if (!listQuestions.find((q) => q.id === question.id)) {
      setListQuestions([...listQuestions, question]);
    }
  };

  const handleRemoveQuestion = (questionId: number) => {
    setListQuestions(listQuestions.filter((q) => q.id !== questionId));
  };

  const handleRoadmapsClick = () => {
    setShowComingSoon(true);
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
      <Header
        onRoadmapsClick={handleRoadmapsClick}
      />

      {!hasStartedMakingList ? (
        <main className="flex-1 flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#164e63] bg-[#0a1a1f]/70 px-3 py-1 mb-8 w-max mx-auto">
              <span className="h-1.5 w-1.5 rounded-full bg-[#06b6d4] animate-pulse" />
              <span className="text-[11px] uppercase tracking-[0.2em] text-cyan-200/80">
                Create Your List
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6 leading-tight">
              Build Your{" "}
              <span className="text-[#06b6d4]">
                Custom
              </span>{" "}
              Practice List
            </h1>
            <p className="text-base md:text-lg text-zinc-400 max-w-2xl mx-auto mb-10">
              Create personalized lists of LeetCode problems tailored to your learning goals.
              Search for questions and add them to your list to track your progress.
            </p>
            <button
              onClick={handleBeginMakingList}
              className="rounded-full bg-[#06b6d4] hover:bg-[#0891b2] text-white text-base font-semibold px-8 py-4 transition-all shadow-[0_0_35px_rgba(6,182,212,0.5)] hover:shadow-[0_0_45px_rgba(6,182,212,0.7)] hover:scale-105"
            >
              Begin Making a List
            </button>
          </div>
        </main>
      ) : (
        <main className="flex-1 flex flex-col items-center px-4 py-6 md:py-10">
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 h-full">
            {/* List Name Input */}
            <div className="w-full max-w-3xl mx-auto">
              <input
                type="text"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                placeholder="Enter list name..."
                className="w-full bg-black/50 border border-[#06b6d4]/20 rounded-full px-6 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#06b6d4]/40 transition-colors mb-6"
              />
            </div>

            {/* Search Section */}
            <div className="w-full max-w-3xl mx-auto">
              <h2 className="text-xl font-semibold text-[#06b6d4] mb-4">
                Search Questions to Add
              </h2>
              <SearchBar
                query={searchQuery}
                onQueryChange={setSearchQuery}
                onSearch={handleSearch}
              />

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-3 max-h-[400px] overflow-y-auto overflow-x-hidden pr-1 mb-8">
                  <h3 className="text-sm font-medium text-zinc-400 mb-2">
                    Search Results
                  </h3>
                  {searchResults.map((question) => (
                    <div key={question.id} className="flex items-center gap-3">
                      <div className="flex-1">
                        <QuestionCard question={question} />
                      </div>
                      <button
                        onClick={() => handleAddQuestion(question)}
                        disabled={listQuestions.some((q) => q.id === question.id)}
                        className="shrink-0 px-4 py-2 rounded-full bg-[#06b6d4] hover:bg-[#0891b2] text-white text-sm font-semibold transition-colors disabled:bg-zinc-600 disabled:cursor-not-allowed"
                      >
                        {listQuestions.some((q) => q.id === question.id)
                          ? "Added"
                          : "Add"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Current List */}
            <div className="w-full max-w-3xl mx-auto">
              <h2 className="text-xl font-semibold text-[#06b6d4] mb-4">
                Your List ({listQuestions.length} {listQuestions.length === 1 ? "question" : "questions"})
              </h2>
              {listQuestions.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  <p>No questions added yet. Search and add questions above.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto overflow-x-hidden pr-1">
                  {listQuestions.map((question) => (
                    <div key={question.id} className="flex items-center gap-3">
                      <div className="flex-1">
                        <QuestionCard question={question} />
                      </div>
                      <button
                        onClick={() => handleRemoveQuestion(question.id)}
                        className="shrink-0 px-4 py-2 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-sm font-semibold transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      <ComingSoonModal
        isOpen={showComingSoon}
        feature="roadmaps"
        onClose={() => setShowComingSoon(false)}
      />
    </div>
  );
}

