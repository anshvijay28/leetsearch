"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLists } from "../hooks/useLists";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Question } from "../types";
import { useAuth } from "../contexts/AuthContext";

type AddToListDropdownProps = {
  question: Question;
};

export default function AddToListDropdown({ question }: AddToListDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showNoListsMessage, setShowNoListsMessage] = useState(false);
  const [showLoginMessage, setShowLoginMessage] = useState(false);
  const [addedToLists, setAddedToLists] = useState<Set<string>>(new Set());
  const [position, setPosition] = useState<{ top: number; right: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { lists, isLoading } = useLists();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: membership, isLoading: isLoadingMembership } = useQuery({
    queryKey: ["problem-lists", question.qid],
    queryFn: async () => {
      const response = await axios.get<Record<string, boolean>>(
        `/api/py/problems/${question.qid}/lists`
      );
      return response.data;
    },
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
  });

  const isProblemInList = (listId: string): boolean => {
    if (addedToLists.has(listId)) return true;
    if (membership?.[listId] === true) return true;
    return false;
  };

  const addMutation = useMutation({
    mutationFn: async ({ listId, qid }: { listId: string; qid: number }) => {
      const response = await axios.post(`/api/py/lists/${listId}/problems`, {
        problem_qid: qid,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["list-problems", variables.listId] });
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      queryClient.setQueryData<Record<string, boolean>>(
        ["problem-lists", question.qid],
        (old) => ({ ...old, [variables.listId]: true })
      );
    },
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowNoListsMessage(false);
        setShowLoginMessage(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8, // 8px = mt-2, fixed positioning is relative to viewport
        right: window.innerWidth - rect.right,
      });
    }
  };

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();

    if (!isAuthenticated) {
      updatePosition();
      setShowLoginMessage(true);
      setTimeout(() => setShowLoginMessage(false), 3000);
      return;
    }

    if (lists.length === 0 && !isLoading) {
      updatePosition();
      setShowNoListsMessage(true);
      setTimeout(() => setShowNoListsMessage(false), 3000);
      return;
    }

    updatePosition();
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (isOpen || showNoListsMessage || showLoginMessage) {
      updatePosition();
      const handleScroll = () => updatePosition();
      const handleResize = () => updatePosition();
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isOpen, showNoListsMessage, showLoginMessage]);

  const handleAddToList = async (e: React.MouseEvent, listId: string, listName: string) => {
    e.stopPropagation();

    if (isProblemInList(listId)) {
      return;
    }

    setAddedToLists((prev) => new Set(prev).add(listId));

    try {
      await addMutation.mutateAsync({ listId, qid: question.qid });
    } catch (error) {
      setAddedToLists((prev) => {
        const next = new Set(prev);
        next.delete(listId);
        return next;
      });
      if (axios.isAxiosError(error) && error.response?.status === 400 &&
        error.response?.data?.detail?.toLowerCase().includes("already exists")) {
        setAddedToLists((prev) => new Set(prev).add(listId));
      } else {
        console.error("Failed to add problem to list:", error);
      }
    }
  };

  const dropdownContent = (
    <>
      {showLoginMessage && position && (
        <div
          ref={dropdownRef}
          className="fixed z-[9999] w-64 rounded-xl border border-black/10 dark:border-gray-800/80 bg-white/95 text-gray-900 dark:bg-black/90 dark:text-gray-100 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.35)] backdrop-blur-xl"
          style={{ top: `${position.top}px`, right: `${position.right}px`, transform: "translateX(8px)" }}
        >
          <p className="text-sm text-gray-700 dark:text-gray-200">
            You must be logged in to add problems to lists. Please{" "}
            <a href="/login" className="font-medium text-teal-600 dark:text-teal-300 hover:underline">sign in</a>{" "}
            to continue.
          </p>
        </div>
      )}

      {showNoListsMessage && position && (
        <div
          ref={dropdownRef}
          className="fixed z-[9999] w-64 rounded-xl border border-black/10 dark:border-gray-800/80 bg-white/95 text-gray-900 dark:bg-black/90 dark:text-gray-100 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.35)] backdrop-blur-xl"
          style={{ top: `${position.top}px`, right: `${position.right}px`, transform: "translateX(8px)" }}
        >
          <p className="text-sm text-gray-700 dark:text-gray-200">
            You don&apos;t have any lists yet. Create a list first from the{" "}
            <span className="font-medium text-teal-600 dark:text-teal-300">Lists</span> page.
          </p>
        </div>
      )}

      {isOpen && lists.length > 0 && position && (
        <div
          ref={dropdownRef}
          className="fixed z-[9999] w-72 overflow-hidden rounded-xl border border-black/10 dark:border-gray-800/80 bg-white/95 text-gray-900 dark:bg-black/95 dark:text-gray-100 shadow-[0_18px_45px_rgba(0,0,0,0.45)] backdrop-blur-xl"
          style={{ top: `${position.top}px`, right: `${position.right}px`, transform: "translateX(8px)" }}
        >
          <div className="border-b border-black/10 dark:border-gray-800/80 px-4 py-2.5">
            <p className="text-xs font-medium tracking-[0.16em] text-gray-500 dark:text-gray-400 uppercase">
              Add to list
            </p>
          </div>
          {isLoadingMembership ? (
            <div className="px-4 py-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
            </div>
          ) : (
            <div className="max-h-56 overflow-y-auto scrollbar-hide py-1">
              {lists.map((list) => {
                const alreadyInList = isProblemInList(list.id);

                return (
                  <button
                    key={list.id}
                    onClick={(e) => handleAddToList(e, list.id, list.name)}
                    disabled={alreadyInList}
                    className={`group flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${alreadyInList
                        ? "cursor-not-allowed opacity-70"
                        : "hover:bg-black/5 dark:hover:bg-white/5"
                      }`}
                  >
                    <span
                      className={`truncate ${alreadyInList ? "text-gray-500" : "text-gray-900 dark:text-gray-100"
                        }`}
                    >
                      {list.name}
                    </span>
                    {alreadyInList ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Added
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                        {list.problem_count} problems
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );

  return (
    <div className="relative z-50" onClick={(e) => e.stopPropagation()}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleButtonClick}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors backdrop-blur-sm bg-black/5 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/20 pointer-events-auto relative z-50"
        title="Add to list"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>Add to List</span>
      </button>

      {(isOpen || showNoListsMessage || showLoginMessage) && typeof document !== 'undefined' && createPortal(dropdownContent, document.body)}
    </div>
  );
}
