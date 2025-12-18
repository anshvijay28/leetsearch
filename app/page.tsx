"use client";

import { useState } from "react";
import { Question } from "./types";
import { SAMPLE_QUESTIONS } from "./data/sampleQuestions";
import Header from "./components/Header";
import LandingPage from "./components/LandingPage";
import SearchBar from "./components/SearchBar";
import BackButton from "./components/BackButton";
import ResultsList from "./components/ResultsList";
import ComingSoonModal from "./components/ComingSoonModal";

export default function Home() {
  const [hasStartedSearching, setHasStartedSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Question[]>([]);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState<"lists" | "roadmaps" | null>(null);
  const [hoveredQuestionId, setHoveredQuestionId] = useState<number | null>(null);

  const handleSearch = () => {
    setResults(SAMPLE_QUESTIONS);
  };

  const handleBackToHome = () => {
    setHasStartedSearching(false);
    setResults([]);
    setQuery("");
  };

  const handleListsClick = () => {
    setComingSoonFeature("lists");
    setShowComingSoon(true);
  };

  const handleRoadmapsClick = () => {
    setComingSoonFeature("roadmaps");
    setShowComingSoon(true);
  };

  return (
    <div className="min-h-screen text-white flex flex-col">
      <Header
        onListsClick={handleListsClick}
        onRoadmapsClick={handleRoadmapsClick}
      />

      {!hasStartedSearching ? (
        <LandingPage onBeginSearch={() => setHasStartedSearching(true)} />
      ) : (
        <main className="flex-1 flex flex-col items-center px-4 py-6 md:py-10">
          <div className={`w-full max-w-6xl mx-auto flex flex-col gap-8 ${results.length === 0 ? 'h-full justify-center' : 'h-full'}`}>
            <div className="w-full max-w-3xl mx-auto">
              <BackButton onClick={handleBackToHome} />
              <SearchBar
                query={query}
                onQueryChange={setQuery}
                onSearch={handleSearch}
              />
              <ResultsList
                results={results}
                hoveredQuestionId={hoveredQuestionId}
                onQuestionHover={setHoveredQuestionId}
              />
            </div>
          </div>
        </main>
      )}

      <ComingSoonModal
        isOpen={showComingSoon}
        feature={comingSoonFeature}
        onClose={() => setShowComingSoon(false)}
      />
    </div>
  );
}
