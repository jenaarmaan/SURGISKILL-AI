import { create } from "zustand";
import { api } from "../lib/api";

interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: any, token: string) => void;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  login: (user, token) => {
    localStorage.setItem("surgiskill_token", token);
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem("surgiskill_token");
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  initialize: async () => {
    set({ isLoading: true });
    const storedToken = localStorage.getItem("surgiskill_token");
    if (!storedToken) {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const user = await api.me(storedToken);
      set({ user, token: storedToken, isAuthenticated: true, isLoading: false });
    } catch (err) {
      console.error("Token verification failed, logging out:", err);
      localStorage.removeItem("surgiskill_token");
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
