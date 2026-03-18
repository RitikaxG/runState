"use client";

import { create } from "zustand";
import { apiRequest } from "../lib/api";
import { useAuthStore } from "./auth-store";
import type { Website, WebsitesResponse } from "../types/website";

type WebsitesState = {
  websites: Website[];
  isLoading: boolean;
  error: string | null;
  fetchWebsites: () => Promise<void>;
};

export const useWebsitesStore = create<WebsitesState>((set) => ({
  websites: [],
  isLoading: false,
  error: null,

  fetchWebsites: async () => {
    try {
      set({ isLoading: true, error: null });

      const token = useAuthStore.getState().token;

      const res = await apiRequest<WebsitesResponse>("/websites", {
        method: "GET",
        token,
      });

      set({
        websites: res.data ?? [],
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch websites",
        isLoading: false,
      });
    }
  },
}));