"use client";

import { useState } from "react";
import { Leaf, ShoppingBag } from "lucide-react";

import { AuthDivider } from "@/components/auth/auth-divider";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { useAuth, type AuthModalMode } from "@/components/auth/auth-provider";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BUSINESS_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface AuthModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultMode?: AuthModalMode;
  reason?: string;
}

export function AuthModal({
  open,
  onOpenChange,
  defaultMode = "login",
  reason,
}: AuthModalProps) {
  const {
    isAuthModalOpen,
    authModalMode,
    authModalReason,
    closeAuthModal,
    handleAuthSuccess,
  } = useAuth();

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : isAuthModalOpen;
  const activeReason = reason ?? authModalReason;
  const preferredMode = isControlled ? defaultMode : authModalMode;
  const [overrideMode, setOverrideMode] = useState<AuthModalMode | null>(null);
  const mode = overrideMode ?? preferredMode;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setOverrideMode(null);
    }

    if (onOpenChange) {
      onOpenChange(nextOpen);
      return;
    }

    if (!nextOpen) {
      closeAuthModal();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "max-h-[90vh] overflow-hidden border-border/60 p-0 shadow-2xl sm:max-w-[480px]",
          mode === "register" && "sm:max-w-[540px]"
        )}
      >
        <div className="border-b border-border/60 bg-gradient-to-br from-primary/5 via-background to-accent/5 px-6 py-5">
          <DialogHeader className="space-y-3 text-center sm:text-left">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 sm:mx-0">
              {activeReason ? <ShoppingBag className="h-6 w-6 text-primary" /> : <Leaf className="h-6 w-6 text-primary" />}
            </div>
            <div>
              <DialogTitle className="text-2xl">
                {mode === "login" ? "Welcome Back" : "Create an Account"}
              </DialogTitle>
              <DialogDescription className="text-base">
                {activeReason ??
                  (mode === "login"
                    ? "Sign in to your account and continue shopping."
                    : "Join our community and start shopping handcrafted goods.")}
              </DialogDescription>
            </div>
          </DialogHeader>
        </div>

        <div className="max-h-[calc(90vh-8rem)] overflow-y-auto px-6 py-5">
          <Tabs
            value={mode}
            onValueChange={(value) => setOverrideMode(value as AuthModalMode)}
            className="w-full"
          >
            <TabsList className="mb-5 grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-0 space-y-5">
              <LoginForm
                idPrefix="modal-login"
                compact
                onSuccess={handleAuthSuccess}
                onSwitchToRegister={() => setOverrideMode("register")}
              />
              <AuthDivider />
              <SocialAuthButtons />
            </TabsContent>

            <TabsContent value="register" className="mt-0 space-y-5">
              <RegisterForm
                idPrefix="modal-register"
                compact
                onSuccess={handleAuthSuccess}
                onSwitchToLogin={() => setOverrideMode("login")}
              />
              <AuthDivider />
              <SocialAuthButtons />
            </TabsContent>
          </Tabs>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            {BUSINESS_NAME} · Secure checkout
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
