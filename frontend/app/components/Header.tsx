"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import LoginRequiredModal from "./LoginRequiredModal";

type HeaderProps = {
  onListsClick?: () => void;
  onRoadmapsClick: () => void;
};

export default function Header({ onListsClick, onRoadmapsClick }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleListsClick = () => {
    if (isAuthenticated) {
      router.push("/lists");
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    // Add a small delay to make the logout feel more natural
    await new Promise(resolve => setTimeout(resolve, 500));
    await logout();
    setIsLoggingOut(false);
  };

  return (
    <>
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
                className={`relative transition-colors ${
                  pathname === "/" ? "text-[#06b6d4]" : "text-zinc-400 hover:text-[#06b6d4]"
                }`}
              >
                Home
                {pathname === "/" && (
                  <span className="absolute -bottom-1 left-0 h-[2px] w-full bg-gradient-to-r from-[#06b6d4] via-[#3b82f6] to-transparent" />
                )}
              </Link>
              <button
                onClick={handleListsClick}
                className={`relative transition-colors ${
                  pathname === "/lists" ? "text-[#06b6d4]" : "text-zinc-400 hover:text-[#06b6d4]"
                }`}
              >
                My Lists
                {pathname === "/lists" && (
                  <span className="absolute -bottom-1 left-0 h-[2px] w-full bg-gradient-to-r from-[#06b6d4] via-[#3b82f6] to-transparent" />
                )}
              </button>
              <button
                onClick={onRoadmapsClick}
                className="text-zinc-400 hover:text-[#06b6d4] transition-colors"
              >
                My Roadmaps
              </button>
              {isAuthenticated && (
                <Link
                  href="/profile"
                  className={`relative transition-colors ${
                    pathname === "/profile" ? "text-[#06b6d4]" : "text-zinc-400 hover:text-[#06b6d4]"
                  }`}
                >
                  Profile
                  {pathname === "/profile" && (
                    <span className="absolute -bottom-1 left-0 h-[2px] w-full bg-gradient-to-r from-[#06b6d4] via-[#3b82f6] to-transparent" />
                  )}
                </Link>
              )}
            </nav>
            {isAuthenticated ? (
              <div className="flex items-center gap-6">
                <span className="text-xs md:text-sm text-zinc-300 hidden md:block">
                  {user?.username || user?.email || user?.user_metadata?.name || "User"}
                </span>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#06b6d4] via-[#3b82f6] to-[#6366f1] hover:brightness-110 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] text-sm font-semibold text-white cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoggingOut ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Logging out...
                    </>
                  ) : (
                    "Log out"
                  )}
                </button>
              </div>
            ) : (
              <Link href="/login">
                <button className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#06b6d4] via-[#3b82f6] to-[#6366f1] hover:brightness-110 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] text-sm font-semibold text-white cursor-pointer">
                  Sign in
                </button>
              </Link>
            )}
          </div>
        </div>
      </header>
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
}

