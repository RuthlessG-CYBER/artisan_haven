"use client";

import { ThemeProvider } from '@/lib/shims/next-themes';
import { AuthProvider } from '@/components/auth/auth-provider';
import { AuthModal } from '@/components/auth/auth-modal';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
        <AuthModal />
      </AuthProvider>
    </ThemeProvider>
  );
}
