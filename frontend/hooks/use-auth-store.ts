"use client";

import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { setCredentials, logoutUser, AuthUser } from '@/lib/store/authSlice';
import { apiClient } from '@/lib/api';

export type { AuthUser };

export function useAuthStore() {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated } = useAppSelector((state) => state.auth);

  const login = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      throw new Error("Please enter your email and password.");
    }

    const res = await apiClient.login(normalizedEmail, password);
    if (res.error) {
      throw new Error(res.error);
    }

    if (res.data?.user && res.data?.token) {
      dispatch(setCredentials({ user: res.data.user, token: res.data.token }));
    } else {
      throw new Error("Invalid response from server.");
    }
  };

  const register = async (input: {
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

    const res = await apiClient.register(input);
    if (res.error) {
      throw new Error(res.error);
    }

    if (res.data?.user && res.data?.token) {
      dispatch(setCredentials({ user: res.data.user, token: res.data.token }));
    } else {
      throw new Error("Invalid response from server.");
    }
  };

  const logout = async () => {
    await apiClient.logout();
    dispatch(logoutUser());
  };

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout,
  };
}
