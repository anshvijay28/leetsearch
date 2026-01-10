"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { getUserProfile, Profile } from "@/lib/profile";
import axios from "axios";

interface User {
  id: string;
  email: string | null;
  username?: string;
  user_metadata?: Record<string, any>;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  session: Session | null;
  logout: () => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<{ error: any; data?: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  refreshUserProfile: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to map SupabaseUser to our User interface
  // Prefers email from profile if available, falls back to auth.users email
  const mapSupabaseUser = (supabaseUser: SupabaseUser, profile?: Profile): User => {
    return {
      id: supabaseUser.id,
      // Use email from profile first, fallback to supabaseUser.email for safety
      email: profile?.email || supabaseUser.email || null,
      user_metadata: supabaseUser.user_metadata,
      username: profile?.username || undefined,
    };
  };

  // Fetch profile and update user with username and email
  const fetchUserWithProfile = async (supabaseUser: SupabaseUser): Promise<User> => {
    // Fetch profile to get username and email
    const profile = await getUserProfile(supabaseUser.id);
    const mappedUser = mapSupabaseUser(supabaseUser, profile || undefined);

    return mappedUser;
  };

  // Initialize auth state and listen for changes
  useEffect(() => {
    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);

        // Defer async operations outside the callback using setTimeout to prevent deadlocks
        // This allows the auth state change to finish processing before we make database queries
        setTimeout(async () => {
          try {
            if (session?.user) {
              const userWithProfile = await fetchUserWithProfile(session.user);
              setUser(userWithProfile);
            } else {
              setUser(null);
            }
          } catch (err) {
            console.error("Auth flow failed", err);
            setUser(null);
          } finally {
            // ALWAYS stop loading — even if profile fetch fails
            setLoading(false);
          }
        }, 0);
      });
  
    return () => subscription.unsubscribe();
  }, []);
  

  // Set up axios interceptor to include Supabase token in requests
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        if (session?.access_token) {
          config.headers.Authorization = `Bearer ${session.access_token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, [session]);

  const signup = async (
    email: string,
    password: string,
    username: string
  ): Promise<{ error: any; data?: any }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          data: {
            username: username, // This will be used by the trigger to create profile
          },
        },
      });

      if (error) {
        return { error };
      }

      // Profile will be created automatically by the database trigger
      return { error: null, data: data };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: any }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      // User and profile will be loaded via onAuthStateChange
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const refreshUserProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const userWithProfile = await fetchUserWithProfile(session.user);
        setUser(userWithProfile);
      }
    } catch (error) {
      console.error("Error refreshing user profile:", error);
    }
  };

  const resetPassword = async (email: string): Promise<{ error: any }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        session,
        logout,
        signup,
        signIn,
        resetPassword,
        refreshUserProfile,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
