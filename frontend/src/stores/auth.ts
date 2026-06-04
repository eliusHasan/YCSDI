import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "student" | "staff" | "admin";

export interface AuthUser {
  id: string;
  userId: string;
  role: Role;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  setSession: (token: string, user: AuthUser) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: (token, user) => set({ token, user }),
      clearSession: () => set({ token: null, user: null }),
    }),
    { name: "ycsdi-auth" },
  ),
);

/** The landing route for each role after login / when redirected. */
export function roleHome(role: Role): string {
  if (role === "admin") return "/admin";
  if (role === "staff") return "/staff";
  return "/student";
}

export function getAuthToken(): string | null {
  return useAuthStore.getState().token;
}

export function clearAuthSession() {
  useAuthStore.getState().clearSession();
}
