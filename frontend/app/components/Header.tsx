"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

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
            {isAuthenticated && (
              <Link
                href="/profile"
                className="text-zinc-400 hover:text-[#06b6d4] transition-colors"
              >
                Profile
              </Link>
            )}
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
            <Link href="/login">
              <button className="flex items-center gap-2 px-3 py-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors">
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#06b6d4] via-[#3b82f6] to-[#6366f1] flex items-center justify-center">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </div>
                <span className="text-xs md:text-sm text-zinc-300 hidden md:block">
                  Sign in
                </span>
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

