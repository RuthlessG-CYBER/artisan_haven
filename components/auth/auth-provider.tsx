"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/hooks/use-auth-store";

export type AuthModalMode = "login" | "register";

interface OpenAuthModalOptions {
  mode?: AuthModalMode;
  redirectTo?: string;
  reason?: string;
}

interface AuthContextValue {
  user: ReturnType<typeof useAuthStore>["user"];
  isAuthenticated: boolean;
  login: ReturnType<typeof useAuthStore>["login"];
  register: ReturnType<typeof useAuthStore>["register"];
  logout: ReturnType<typeof useAuthStore>["logout"];
  isAuthModalOpen: boolean;
  authModalMode: AuthModalMode;
  authModalReason?: string;
  openAuthModal: (options?: OpenAuthModalOptions) => void;
  closeAuthModal: () => void;
  requireAuth: (action: () => void, options?: OpenAuthModalOptions) => void;
  handleAuthSuccess: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const auth = useAuthStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>("login");
  const [authModalReason, setAuthModalReason] = useState<string | undefined>();
  const [pendingRedirect, setPendingRedirect] = useState<string | undefined>();
  const [pendingAction, setPendingAction] = useState<(() => void) | undefined>();

  const openAuthModal = useCallback((options?: OpenAuthModalOptions) => {
    setAuthModalMode(options?.mode ?? "login");
    setAuthModalReason(options?.reason);
    setPendingRedirect(options?.redirectTo);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthModalReason(undefined);
    setPendingRedirect(undefined);
    setPendingAction(undefined);
  }, []);

  const requireAuth = useCallback(
    (action: () => void, options?: OpenAuthModalOptions) => {
      if (auth.isAuthenticated) {
        action();
        return;
      }

      setPendingAction(() => action);
      openAuthModal({
        mode: options?.mode ?? "login",
        reason: options?.reason ?? "Sign in to continue with your purchase.",
        redirectTo: options?.redirectTo,
      });
    },
    [auth.isAuthenticated, openAuthModal]
  );

  const handleAuthSuccess = useCallback(() => {
    const action = pendingAction;
    const redirect = pendingRedirect;

    closeAuthModal();

    if (action) {
      action();
      return;
    }

    if (redirect) {
      router.push(redirect);
    }
  }, [closeAuthModal, pendingAction, pendingRedirect, router]);

  const value = useMemo(
    () => ({
      user: auth.user,
      isAuthenticated: auth.isAuthenticated,
      login: auth.login,
      register: auth.register,
      logout: auth.logout,
      isAuthModalOpen,
      authModalMode,
      authModalReason,
      openAuthModal,
      closeAuthModal,
      requireAuth,
      handleAuthSuccess,
    }),
    [
      auth.user,
      auth.isAuthenticated,
      auth.login,
      auth.register,
      auth.logout,
      isAuthModalOpen,
      authModalMode,
      authModalReason,
      openAuthModal,
      closeAuthModal,
      requireAuth,
      handleAuthSuccess,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}
