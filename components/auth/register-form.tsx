"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail, User, Phone, ArrowRight } from "lucide-react";

import { FormField } from "@/components/auth/form-field";
import { FormMessage } from "@/components/auth/form-message";
import { PasswordInput } from "@/components/auth/password-input";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface RegisterFormProps {
  idPrefix?: string;
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  compact?: boolean;
}

export function RegisterForm({
  idPrefix = "register",
  onSuccess,
  onSwitchToLogin,
  compact = false,
}: RegisterFormProps) {
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) errors.firstName = "First name is required.";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required.";
    if (!formData.email.trim()) errors.email = "Email is required.";
    if (formData.password.length < 8) errors.password = "Password must be at least 8 characters.";
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Passwords do not match.";

    if (!formData.agreeTerms) {
      setFormError("Please agree to the Terms of Service and Privacy Policy.");
    } else {
      setFormError("");
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0 && formData.agreeTerms;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      toast.success("Account created successfully!");
      onSuccess?.();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to create your account right now.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={compact ? "space-y-3.5" : "space-y-4"}>
      {formError ? <FormMessage type="error" message={formError} /> : null}

      <div className="grid gap-3.5 sm:grid-cols-2">
        <FormField
          id={`${idPrefix}-firstName`}
          label="First Name"
          icon={User}
          placeholder="John"
          autoComplete="given-name"
          value={formData.firstName}
          error={fieldErrors.firstName}
          onChange={(e) => {
            setFieldErrors((current) => ({ ...current, firstName: "" }));
            setFormData({ ...formData, firstName: e.target.value });
          }}
          required
        />
        <FormField
          id={`${idPrefix}-lastName`}
          label="Last Name"
          icon={User}
          placeholder="Smith"
          autoComplete="family-name"
          value={formData.lastName}
          error={fieldErrors.lastName}
          onChange={(e) => {
            setFieldErrors((current) => ({ ...current, lastName: "" }));
            setFormData({ ...formData, lastName: e.target.value });
          }}
          required
        />
      </div>

      <FormField
        id={`${idPrefix}-email`}
        label="Email Address"
        type="email"
        icon={Mail}
        placeholder="you@example.com"
        autoComplete="email"
        value={formData.email}
        error={fieldErrors.email}
        onChange={(e) => {
          setFieldErrors((current) => ({ ...current, email: "" }));
          setFormData({ ...formData, email: e.target.value });
        }}
        required
      />

      <FormField
        id={`${idPrefix}-phone`}
        label="Phone Number"
        type="tel"
        icon={Phone}
        placeholder="(555) 123-4567"
        autoComplete="tel"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
      />

      <PasswordInput
        id={`${idPrefix}-password`}
        label="Password"
        placeholder="Create a password"
        autoComplete="new-password"
        hint="Minimum 8 characters"
        value={formData.password}
        error={fieldErrors.password}
        onChange={(e) => {
          setFieldErrors((current) => ({ ...current, password: "" }));
          setFormData({ ...formData, password: e.target.value });
        }}
        required
      />

      <PasswordInput
        id={`${idPrefix}-confirmPassword`}
        label="Confirm Password"
        placeholder="Confirm your password"
        autoComplete="new-password"
        value={formData.confirmPassword}
        error={fieldErrors.confirmPassword}
        onChange={(e) => {
          setFieldErrors((current) => ({ ...current, confirmPassword: "" }));
          setFormData({ ...formData, confirmPassword: e.target.value });
        }}
        required
      />

      <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
        <Checkbox
          id={`${idPrefix}-terms`}
          className="mt-0.5"
          checked={formData.agreeTerms}
          onCheckedChange={(checked) => {
            setFormError("");
            setFormData({ ...formData, agreeTerms: checked === true });
          }}
        />
        <Label htmlFor={`${idPrefix}-terms`} className="cursor-pointer text-sm font-normal leading-relaxed">
          I agree to the{" "}
          <Link href="/faq" className="text-primary hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/faq" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </Label>
      </div>

      <Button type="submit" className="h-11 w-full" size="lg" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          <>
            Create Account
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>

      {onSwitchToLogin ? (
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            onClick={onSwitchToLogin}
          >
            Sign in
          </button>
        </p>
      ) : null}
    </form>
  );
}
