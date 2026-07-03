"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail, ArrowRight } from "lucide-react";

import { FormField } from "@/components/auth/form-field";
import { FormMessage } from "@/components/auth/form-message";
import { PasswordInput } from "@/components/auth/password-input";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface LoginFormProps {
  idPrefix?: string;
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
  compact?: boolean;
}

export function LoginForm({
  idPrefix = "login",
  onSuccess,
  onSwitchToRegister,
  compact = false,
}: LoginFormProps) {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.email.trim() || !formData.password) {
      setFormError("Please enter your email and password.");
      return;
    }

    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success("Welcome back!");
      onSuccess?.();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to sign in right now.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={compact ? "space-y-4" : "space-y-5"}>
      {formError ? <FormMessage type="error" message={formError} /> : null}

      <FormField
        id={`${idPrefix}-email`}
        label="Email Address"
        type="email"
        icon={Mail}
        placeholder="you@example.com"
        autoComplete="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />

      <PasswordInput
        id={`${idPrefix}-password`}
        label="Password"
        placeholder="Enter your password"
        autoComplete="current-password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id={`${idPrefix}-rememberMe`}
            checked={formData.rememberMe}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, rememberMe: checked === true })
            }
          />
          <Label htmlFor={`${idPrefix}-rememberMe`} className="cursor-pointer text-sm font-normal">
            Remember me
          </Label>
        </div>
        <Link href="/contact" className="text-sm text-primary hover:underline">
          Need help?
        </Link>
      </div>

      <Button type="submit" className="h-11 w-full" size="lg" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            Sign In
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>

      {onSwitchToRegister ? (
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            onClick={onSwitchToRegister}
          >
            Create one
          </button>
        </p>
      ) : null}
    </form>
  );
}
