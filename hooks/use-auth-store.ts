"use client";

import * as React from "react";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

interface AuthState {
  user: AuthUser | null;
}

const STORAGE_KEY = "artisan-haven-auth";
let state: AuthState = { user: null };
const listeners = new Set<() => void>();

function loadState() {
  if (typeof window === "undefined") return;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AuthState;
      state = { user: parsed.user ?? null };
    }
  } catch {
    state = { user: null };
  }
}

function persistState() {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

function emit() {
  persistState();
  listeners.forEach((listener) => listener());
}

function setState(nextState: AuthState) {
  state = nextState;
  emit();
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) {
    loadState();
  }

  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return state;
}

function getServerSnapshot() {
  return { user: null };
}

export function useAuthStore() {
  const current = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return React.useMemo(
    () => ({
      user: current.user,
      isAuthenticated: Boolean(current.user),
      login: async (email: string, password: string) => {
        await new Promise((resolve) => setTimeout(resolve, 600));

        const normalizedEmail = email.trim().toLowerCase();
        if (!normalizedEmail || !password) {
          throw new Error("Please enter your email and password.");
        }

        const [localPart] = normalizedEmail.split("@");
        setState({
          user: {
            id: crypto.randomUUID(),
            email: normalizedEmail,
            firstName: localPart.charAt(0).toUpperCase() + localPart.slice(1),
            lastName: "",
          },
        });
      },
      register: async (input: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        password: string;
      }) => {
        await new Promise((resolve) => setTimeout(resolve, 600));

        const normalizedEmail = input.email.trim().toLowerCase();
        if (!input.firstName.trim() || !input.lastName.trim() || !normalizedEmail || !input.password) {
          throw new Error("Please complete all required fields.");
        }

        if (input.password.length < 8) {
          throw new Error("Password must be at least 8 characters.");
        }

        setState({
          user: {
            id: crypto.randomUUID(),
            email: normalizedEmail,
            firstName: input.firstName.trim(),
            lastName: input.lastName.trim(),
            phone: input.phone?.trim() || undefined,
          },
        });
      },
      logout: () => setState({ user: null }),
    }),
    [current.user]
  );
}
