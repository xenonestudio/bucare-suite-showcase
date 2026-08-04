import { useState, useEffect } from "react";
import { getAuthState, type AuthState } from "@/lib/auth";

/**
 * Hook that reads authentication state from localStorage on mount.
 * Returns a stable AuthState object; updates if localStorage changes
 * (e.g. after login/logout in another tab).
 */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>(() => getAuthState());

  useEffect(() => {
    // Sync on mount (handles SSR hydration mismatch)
    setState(getAuthState());

    // Listen for storage events from other tabs
    function onStorage(e: StorageEvent) {
      if (e.key === "token" || e.key === "user") {
        setState(getAuthState());
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return state;
}
