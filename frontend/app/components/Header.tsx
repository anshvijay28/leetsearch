"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import LoginRequiredModal from "./LoginRequiredModal";
import { useTheme } from "../providers/ThemeProvider";

type HeaderProps = {
  onListsClick?: () => void;
};

export default function Header({ onListsClick }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { mode, toggle } = useTheme();

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
      <header className="fixed top-0 left-0 right-0 w-full border-b border-gray-100/80 dark:border-white/10 bg-white/95 dark:bg-black/95 backdrop-blur-xl z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-[#06b6d4] via-[#3b82f6] to-[#6366f1] shadow-[0_0_20px_rgba(6,182,212,0.4)]" />
            <span className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
              LeetSearch
            </span>
          </div>
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-6 text-xs md:text-sm font-medium">
              <Link
                href="/"
                className={`relative transition-colors ${pathname === "/"
                  ? "text-gray-900 dark:text-white font-semibold"
                  : "text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white"
                  }`}
              >
                Home
                {pathname === "/" && (
                  <span className="absolute -bottom-1 left-0 h-[2px] w-full bg-gray-900 dark:bg-white rounded-full" />
                )}
              </Link>
              <button
                onClick={handleListsClick}
                className={`relative transition-colors ${pathname === "/lists"
                  ? "text-gray-900 dark:text-white font-semibold"
                  : "text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white"
                  }`}
              >
                My Lists
                {pathname === "/lists" && (
                  <span className="absolute -bottom-1 left-0 h-[2px] w-full bg-gray-900 dark:bg-white rounded-full" />
                )}
              </button>
              {isAuthenticated && (
                <Link
                  href="/profile"
                  className={`relative transition-colors ${pathname === "/profile"
                    ? "text-gray-900 dark:text-white font-semibold"
                    : "text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white"
                    }`}
                >
                  Profile
                  {pathname === "/profile" && (
                    <span className="absolute -bottom-1 left-0 h-[2px] w-full bg-gray-900 dark:bg-white rounded-full" />
                  )}
                </Link>
              )}
            </nav>
            <div className="flex items-center gap-4">
              <button
                onClick={toggle}
                aria-label="Toggle theme"
                suppressHydrationWarning
                className="flex items-center gap-2"
              >
                {/* Icon container - both icons occupy the same space */}
                <div className="relative w-4 h-4 flex items-center justify-center">
                  {/* Sun icon for light mode */}
                  <svg
                    className={`absolute w-4 h-4 text-gray-700 dark:text-white/70 transition-opacity ${mode === "light" ? "opacity-100" : "opacity-0"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  {/* Moon icon for dark mode */}
                  <svg
                    className={`absolute w-4 h-4 text-gray-700 dark:text-white/70 transition-opacity ${mode === "dark" ? "opacity-100" : "opacity-0"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                </div>
                {/* Toggle switch */}
                <div
                  suppressHydrationWarning
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  border border-gray-200 dark:border-white/10
                  focus:outline-none focus:ring-2 focus:ring-gray-300/50 dark:focus:ring-white/15 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black
                  ${mode === "dark" ? "bg-black/70 dark:bg-white/25" : "bg-black/10 dark:bg-white/10"}`}
                >
                  <span
                    suppressHydrationWarning
                    className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-black transition-transform
                    ${mode === "dark" ? "translate-x-6" : "translate-x-1"}`}
                  />
                </div>
              </button>
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <span className="text-xs md:text-sm text-gray-600 dark:text-white/70 hidden md:block">
                    {user?.username || user?.email || user?.user_metadata?.name || "User"}
                  </span>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="px-4 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black text-sm font-semibold transition-colors hover:bg-black/90 dark:hover:bg-white/90 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  <button className="px-4 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black text-sm font-semibold transition-colors hover:bg-black/90 dark:hover:bg-white/90 cursor-pointer">
                    Sign in
                  </button>
                </Link>
              )}
            </div>
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

