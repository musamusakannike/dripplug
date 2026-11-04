"use client";

import { create } from "zustand";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, logoutFirebaseClient } from "@/lib/firebase-client";
import { SessionUser } from "@/types";

interface AuthResult {
  success: boolean;
  user?: SessionUser;
  error?: string;
}

interface AuthModalState {
  user: SessionUser | null;
  isOpen: boolean;
  redirectAfterLogin: string | null;
  setUser: (user: SessionUser | null) => void;
  openAuthModal: (redirectPath?: string) => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (data: { name: string; email: string; password: string }) => Promise<AuthResult>;
  loginWithGoogle: () => Promise<AuthResult>;
  logout: () => Promise<void>;
}

async function postAuthSession(payload: Record<string, unknown>): Promise<AuthResult> {
  try {
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const rawText = await res.text();
    let json: { ok?: boolean; error?: string; data?: { user?: SessionUser; token?: string } } | null =
      null;
    if (rawText) {
      try {
        json = JSON.parse(rawText);
      } catch {
        // non-JSON response fallback
      }
    }

    if (!res.ok || !json?.ok || !json?.data?.user) {
      return {
        success: false,
        error: json?.error || "Authentication failed. Please try again.",
      };
    }

    const { user, token } = json.data;
    if (typeof window !== "undefined") {
      if (token) localStorage.setItem("dripplug_token", token);
      localStorage.setItem("dripplug_user", JSON.stringify(user));
    }

    return { success: true, user };
  } catch {
    return {
      success: false,
      error: "Network error. Please check your connection and try again.",
    };
  }
}

export const useAuthStore = create<AuthModalState>((set) => ({
  user: null,
  isOpen: false,
  redirectAfterLogin: null,
  setUser: (user) => set({ user }),
  openAuthModal: (redirectPath) =>
    set({ isOpen: true, redirectAfterLogin: redirectPath || null }),
  closeAuthModal: () => set({ isOpen: false, redirectAfterLogin: null }),

  login: async (email, password) => {
    const result = await postAuthSession({ mode: "signin", email, password });
    if (result.success && result.user) {
      set({ user: result.user });
    }
    return result;
  },

  register: async ({ name, email, password }) => {
    const result = await postAuthSession({ mode: "signup", name, email, password });
    if (result.success && result.user) {
      set({ user: result.user });
    }
    return result;
  },

  loginWithGoogle: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const sessionResult = await postAuthSession({
        idToken,
        name: result.user.displayName || undefined,
      });
      if (sessionResult.success && sessionResult.user) {
        set({ user: sessionResult.user });
      }
      return sessionResult;
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      if (err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request") {
        return { success: false, error: "Sign-in popup was closed before completing." };
      }
      return {
        success: false,
        error: err.message || "Google sign-in failed. Please try again.",
      };
    }
  },

  logout: async () => {
    await logoutFirebaseClient();
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    if (typeof window !== "undefined") {
      localStorage.removeItem("dripplug_token");
      localStorage.removeItem("dripplug_user");
    }
    set({ user: null });
  },
}));
