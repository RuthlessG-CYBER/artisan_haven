"use client";

import * as React from "react";
import { apiClient } from "@/lib/api";

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

let state: AuthState = { user: null };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function getSnapshot() {
  return state;
}

const SERVER_SNAPSHOT: AuthState = { user: null };

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

export function useAuthStore() {
  const current = React.useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getSnapshot,
    getServerSnapshot
  );

  return React.useMemo(
    () => ({
      user: current.user,
      isAuthenticated: Boolean(current.user),
      login: async (email: string, password: string) => {
        const normalizedEmail = email.trim().toLowerCase();
        if (!normalizedEmail || !password) {
          throw new Error("Please enter your email and password.");
        }

        const res = await apiClient.login(normalizedEmail, password);
        if (res.error || !res.data) {
          throw new Error(res.error || "Login failed");
        }

        const { user, token } = res.data;
        apiClient.setToken(token, user.id);
        state = { user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, phone: user.phone } };
        emit();
      },
      register: async (input: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        password: string;
      }) => {
        if (!input.firstName.trim() || !input.lastName.trim() || !input.email.trim() || !input.password) {
          throw new Error("Please complete all required fields.");
        }

        if (input.password.length < 8) {
          throw new Error("Password must be at least 8 characters.");
        }

        const res = await apiClient.register({
          firstName: input.firstName.trim(),
          lastName: input.lastName.trim(),
          email: input.email.trim().toLowerCase(),
          phone: input.phone?.trim() || undefined,
          password: input.password,
        });

        if (res.error || !res.data) {
          throw new Error(res.error || "Registration failed");
        }

        const { user, token } = res.data;
        apiClient.setToken(token, user.id);
        state = { user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, phone: user.phone } };
        emit();
      },
      logout: async () => {
        await apiClient.logout();
        apiClient.clearToken();
        state = { user: null };
        emit();
      },
    }),
    [current.user]
  );
}
