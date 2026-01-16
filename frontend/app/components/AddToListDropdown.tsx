"use client";

import { useState, useRef, useEffect } from "react";
import { useLists } from "../hooks/useLists";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Question } from "../types";

type AddToListDropdownProps = {
  question: Question;
};

export default function AddToListDropdown({ question }: AddToListDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showNoListsMessage, setShowNoListsMessage] = useState(false);
  const [addedToLists, setAddedToLists] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { lists, isLoading } = useLists();
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
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (lists.length === 0 && !isLoading) {
      setShowNoListsMessage(true);
      setTimeout(() => setShowNoListsMessage(false), 3000);
      return;
    }
    
    setIsOpen(!isOpen);
  };

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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleButtonClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#06b6d4]/20 hover:bg-[#06b6d4]/30 border border-[#06b6d4]/30 text-cyan-300 text-xs font-medium transition-colors"
        title="Add to list"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>Add to List</span>
      </button>

      {showNoListsMessage && (
        <div className="absolute right-0 mt-2 w-56 p-3 rounded-lg bg-zinc-900 border border-zinc-700 shadow-xl z-50">
          <p className="text-sm text-zinc-300">
            You don&apos;t have any lists yet. Create a list first from the{" "}
            <span className="text-cyan-400 font-medium">Lists</span> page.
          </p>
        </div>
      )}

      {isOpen && lists.length > 0 && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg bg-zinc-900 border border-zinc-700 shadow-xl z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-zinc-700">
            <p className="text-xs text-zinc-400 font-medium">Add to list</p>
          </div>
          {isLoadingMembership ? (
            <div className="px-3 py-4 text-center">
              <p className="text-sm text-zinc-400">Loading...</p>
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto">
              {lists.map((list) => {
                const alreadyInList = isProblemInList(list.id);
                
                return (
                  <button
                    key={list.id}
                    onClick={(e) => handleAddToList(e, list.id, list.name)}
                    disabled={alreadyInList}
                    className={`w-full px-3 py-2.5 text-left transition-colors flex items-center justify-between group ${
                      alreadyInList 
                        ? "opacity-60 cursor-not-allowed" 
                        : "hover:bg-zinc-800"
                    }`}
                  >
                    <span className={`text-sm truncate ${alreadyInList ? "text-zinc-400" : "text-zinc-200"}`}>
                      {list.name}
                    </span>
                    {alreadyInList ? (
                      <span className="text-xs text-emerald-400 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Added
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-500 group-hover:text-zinc-400">
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
    </div>
  );
}
