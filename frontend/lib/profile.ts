import { supabase } from "./supabase";

export interface Profile {
  id: string;
  username: string;
  email: string | null;
  provider: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Get user profile by user ID
 */
export async function getUserProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return data;
}

/**
 * Check if a username is available
 */
export async function checkUsernameAvailability(
  username: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .single();

    // If error is "PGRST116" (no rows returned), username is available
    if (error && error.code === "PGRST116") {
      return true;
    }

    // If we got data, username is taken
    if (data) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking username availability:", error);
    return false;
  }
}

/**
 * Update user's profile (username)
 */
export async function updateProfile(
  userId: string,
  username: string,
  currentUsername?: string
): Promise<Profile | null> {
  try {
    // Only check availability if username is actually changing
    if (currentUsername && username === currentUsername) {
      // Username hasn't changed, just return current profile
      return await getUserProfile(userId);
    }

    // Check if username is available
    const isAvailable = await checkUsernameAvailability(username);
    if (!isAvailable) {
      throw new Error("Username is already taken");
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({ username })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
}

