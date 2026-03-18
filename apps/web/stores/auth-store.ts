"use client";

import { create } from "zustand";
import { apiRequest } from "../lib/api";
import type { SignInResponse, User } from "../types/auth";

type AuthState = {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hydrateFromStorage: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  isHydrated: false,

  signIn: async (email, password) => {
    try {
      set({ isLoading: true, error: null });

      const res = await apiRequest<SignInResponse>("/signin", {
        method: "POST",
        body: { email, password },
      });

      const token = res.data?.accessToken ?? null;
      const user = res.data?.user ?? null;

      if (!token || !user) {
        throw new Error("Invalid signin response");
      }

      localStorage.setItem("runstate_token", token);
      localStorage.setItem("runstate_user", JSON.stringify(user));

      set({
        token,
        user,
        isAuthenticated: true,
        isHydrated: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Signin failed",
        isLoading: false,
        isHydrated: true,
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem("runstate_token");
    localStorage.removeItem("runstate_user");

    set({
      token: null,
      user: null,
      isAuthenticated: false,
      isHydrated: true,
      error: null,
    });
  },

  hydrateFromStorage: () => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("runstate_token");
    const userRaw = localStorage.getItem("runstate_user");

    let user: User | null = null;

    try {
      user = userRaw ? JSON.parse(userRaw) : null;
    } catch {
      user = null;
    }

    set({
      token,
      user,
      isAuthenticated: !!token,
      isHydrated: true,
    });
  },
}));