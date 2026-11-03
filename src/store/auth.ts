"use client";

import { create } from "zustand";
import { SessionUser } from "@/types";

interface AuthModalState {
  user: SessionUser | null;
  isOpen: boolean;
  redirectAfterLogin: string | null;
  setUser: (user: SessionUser | null) => void;
  openAuthModal: (redirectPath?: string) => void;
  closeAuthModal: () => void;
}

export const useAuthStore = create<AuthModalState>((set) => ({
  user: null,
  isOpen: false,
  redirectAfterLogin: null,
  setUser: (user) => set({ user }),
  openAuthModal: (redirectPath) =>
    set({ isOpen: true, redirectAfterLogin: redirectPath || null }),
  closeAuthModal: () => set({ isOpen: false, redirectAfterLogin: null }),
}));
