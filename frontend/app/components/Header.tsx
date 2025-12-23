"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import GoogleAuthButton from "./GoogleAuthButton";

type HeaderProps = {
  onListsClick?: () => void;
  onRoadmapsClick: () => void;
};

export default function Header({ onListsClick, onRoadmapsClick }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleListsClick = () => {
    if (isAuthenticated) {
      router.push("/lists");
    } else if (onListsClick) {
      onListsClick();
    }
  };

  return (
    <header className="w-full border-b border-[#27272f] bg-black/80 backdrop-blur-md sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-gradient-to-br from-[#06b6d4] via-[#3b82f6] to-[#6366f1] shadow-[0_0_35px_rgba(6,182,212,0.5)]" />
          <span className="text-lg font-semibold tracking-tight text-[#06b6d4]">
            LeetSearch
          </span>
        </div>
        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-6 text-xs md:text-sm font-medium">
            <Link
              href="/"
              className="relative text-[#06b6d4]"
            >
              Home
              <span className="absolute -bottom-1 left-0 h-[2px] w-full bg-gradient-to-r from-[#06b6d4] via-[#3b82f6] to-transparent" />
            </Link>
            <button
              onClick={handleListsClick}
              className="text-zinc-400 hover:text-[#06b6d4] transition-colors"
            >
              My Lists
            </button>
            <button
              onClick={onRoadmapsClick}
              className="text-zinc-400 hover:text-[#06b6d4] transition-colors"
            >
              My Roadmaps
            </button>
          </nav>
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-xs md:text-sm text-zinc-300 hidden md:block">
                {user?.email || user?.user_metadata?.name || "User"}
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              >
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#06b6d4] via-[#3b82f6] to-[#6366f1] flex items-center justify-center text-xs font-semibold text-white">
                  {(user?.email?.[0] || user?.user_metadata?.name?.[0] || "U").toUpperCase()}
                </div>
                <span className="text-xs md:text-sm text-zinc-300 hidden md:block">
                  Log out
                </span>
              </button>
            </div>
          ) : (
            <GoogleAuthButton />
          )}
        </div>
      </div>
    </header>
  );
}

