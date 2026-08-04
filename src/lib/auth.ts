/**
 * Centralized auth utilities.
 * Reads token/user from localStorage only on the client side.
 */

export interface AuthUser {
  email: string;
  role: string;
  name?: string;
  [key: string]: unknown;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
}

export function getAuthState(): AuthState {
  if (typeof window === "undefined") {
    return { token: null, user: null, isAuthenticated: false };
  }
  const token = localStorage.getItem("token");
  const raw = localStorage.getItem("user");
  let user: AuthUser | null = null;
  if (raw) {
    try {
      user = JSON.parse(raw) as AuthUser;
    } catch {
      // corrupt data — ignore
    }
  }
  return { token, user, isAuthenticated: !!token };
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

/** Derive initials from email, e.g. "john.doe@…" → "JD" */
export function getInitials(email: string): string {
  const parts = email.split("@")[0].split(".");
  return parts.length > 1
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : email.substring(0, 2).toUpperCase();
}
