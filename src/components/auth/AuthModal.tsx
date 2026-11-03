"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import { APP_NAME, Logo } from "@/config/site";
import {
  loginWithEmail,
  loginWithGoogle,
  registerWithEmail,
} from "@/lib/firebase-client";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";
import { useToastStore } from "@/store/toast";

interface AuthFormProps {
  redirectTo?: string;
  onSuccess?: () => void;
}

function formatAuthError(err: unknown): string {
  if (typeof err === "object" && err !== null && "code" in err) {
    const code = (err as { code: string }).code;
    switch (code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
        return "Invalid email or password. If you haven't created a password account, please click 'Create an account' below.";
      case "auth/user-not-found":
        return "No account found with this email. Click 'Create an account' below to sign up.";
      case "auth/email-already-in-use":
        return "An account with this email already exists. Click 'Sign in instead' below.";
      case "auth/weak-password":
        return "Password is too weak. Please use at least 6 characters.";
      case "auth/popup-closed-by-user":
        return "Sign-in popup was closed before completing.";
      case "auth/cancelled-popup-request":
        return "Another sign-in request is in progress.";
      default:
        break;
    }
  }
  return err instanceof Error ? err.message : "Authentication failed. Check your credentials.";
}

export function AuthForm({ redirectTo, onSuccess }: AuthFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setUser = useAuthStore((s) => s.setUser);
  const syncWithServer = useCartStore((s) => s.syncWithServer);
  const addToast = useToastStore((s) => s.addToast);

  async function establishServerSession(idToken: string, displayName?: string) {
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, name: displayName }),
    });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      throw new Error(json.error || "Failed to establish session");
    }

    setUser(json.data.user);
    await syncWithServer();
    addToast(`Welcome to ${APP_NAME}, ${json.data.user.name}!`, "success");

    if (onSuccess) {
      onSuccess();
    }
    if (redirectTo) {
      router.push(redirectTo);
      router.refresh();
    } else {
      router.refresh();
    }
  }

  async function handleGoogleAuth() {
    setError(null);
    setLoading(true);
    try {
      const res = await loginWithGoogle();
      if (res) {
        await establishServerSession(res.idToken, res.user.displayName || undefined);
      }
    } catch (err: unknown) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const res = await registerWithEmail(name, email, password);
        await establishServerSession(res.idToken, name);
      } else {
        const res = await loginWithEmail(email, password);
        await establishServerSession(res.idToken);
      }
    } catch (err: unknown) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <Logo className="text-2xl" />
        <h2
          id="auth-dialog-title"
          className="font-heading text-xl md:text-2xl uppercase mt-3 tracking-tight"
        >
          {mode === "signin" ? "Welcome Back" : "Create Campus Account"}
        </h2>
        <p className="text-sm text-muted mt-1">
          {mode === "signin"
            ? "Sign in to complete your order or track campus deliveries."
            : "Join fellow UNILORIN students for fast 1-minute checkout."}
        </p>
      </div>

      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-4 rounded-2xl bg-danger-bg border border-danger/20 px-4 py-3 text-xs text-danger font-medium"
        >
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={loading}
        className="w-full min-h-[48px] rounded-full border border-border bg-white hover:bg-surface transition-colors px-5 py-3 text-sm font-semibold flex items-center justify-center gap-3 disabled:opacity-60 cursor-pointer"
      >
        <svg aria-hidden="true" className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
          />
        </svg>
        Continue with Google
      </button>

      <div className="relative my-5 flex items-center justify-center">
        <div className="border-t border-border w-full" />
        <span className="bg-white px-3 text-xs text-muted uppercase tracking-wider">or</span>
        <div className="border-t border-border w-full" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <div>
            <label htmlFor="auth-name" className="block text-xs font-semibold mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User
                aria-hidden="true"
                className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2"
              />
              <input
                id="auth-name"
                name="name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tobi Adeyemi"
                className="w-full min-h-[48px] rounded-full bg-surface pl-11 pr-4 text-base focus:bg-white border border-transparent focus:border-black transition-colors"
              />
            </div>
          </div>
        )}

        <div>
          <label htmlFor="auth-email" className="block text-xs font-semibold mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail
              aria-hidden="true"
              className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2"
            />
            <input
              id="auth-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@unilorin.edu.ng"
              className="w-full min-h-[48px] rounded-full bg-surface pl-11 pr-4 text-base focus:bg-white border border-transparent focus:border-black transition-colors"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="auth-password" className="block text-xs font-semibold">
              Password
            </label>
            <span id="auth-password-hint" className="text-[11px] text-muted">
              Min. 6 characters
            </span>
          </div>
          <div className="relative">
            <Lock
              aria-hidden="true"
              className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2"
            />
            <input
              id="auth-password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              aria-describedby="auth-password-hint"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full min-h-[48px] rounded-full bg-surface pl-11 pr-12 text-base focus:bg-white border border-transparent focus:border-black transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-pressed={showPassword}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted hover:text-black cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-[48px] rounded-full bg-black text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-black/90 transition-colors disabled:opacity-60 cursor-pointer"
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {mode === "signin" ? "Sign In" : "Create Account"}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-5 text-center text-sm text-muted">
        {mode === "signin" ? (
          <>
            New to {APP_NAME}?{" "}
            <button
              type="button"
              onClick={() => setMode("signup")}
              className="text-black font-semibold underline underline-offset-4 cursor-pointer"
            >
              Create an account
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => setMode("signin")}
              className="text-black font-semibold underline underline-offset-4 cursor-pointer"
            >
              Sign in instead
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Native <dialog> modal opened via showModal() so screen readers and focus containment
 * work natively without brittle DOM focus traps.
 */
export function AuthModal() {
  const isOpen = useAuthStore((s) => s.isOpen);
  const redirectAfterLogin = useAuthStore((s) => s.redirectAfterLogin);
  const closeAuthModal = useAuthStore((s) => s.closeAuthModal);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="auth-dialog-title"
      onClose={closeAuthModal}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-[24px] bg-white p-6 md:p-8 shadow-2xl border border-border text-black"
    >
      <div className="flex justify-end -mt-2 -mr-2">
        <button
          type="button"
          onClick={closeAuthModal}
          aria-label="Close sign in dialog"
          className="p-2 rounded-full hover:bg-surface transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <AuthForm
        redirectTo={redirectAfterLogin || undefined}
        onSuccess={closeAuthModal}
      />
    </dialog>
  );
}
