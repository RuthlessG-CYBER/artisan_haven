"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Leaf } from "lucide-react";

import { AuthModal } from "@/components/auth/auth-modal";
import { useAuth, type AuthModalMode } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { BUSINESS_NAME, BUSINESS_TAGLINE } from "@/lib/constants";

interface AuthPageProps {
  defaultMode: AuthModalMode;
}

export function AuthPage({ defaultMode }: AuthPageProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  return (
    <>
      <div className="relative min-h-[calc(100vh-5rem)] overflow-hidden">
        <Image
          src="https://images.pexels.com/photos/60638/pexels-photo-60638.jpeg?w=1600"
          alt="Handcrafted products"
          fill
          priority
          className="object-cover opacity-25 dark:opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />

        <div className="relative z-10 flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center px-4 py-12 text-center">
          <Link href="/" className="mb-6 inline-flex items-center gap-2">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">{BUSINESS_NAME}</span>
          </Link>
          <h1 className="max-w-xl text-3xl font-bold sm:text-4xl">
            {defaultMode === "login" ? "Sign in to continue" : "Join our artisan community"}
          </h1>
          <p className="mt-3 max-w-md text-muted-foreground">{BUSINESS_TAGLINE}</p>
          <Button asChild className="mt-8 group" size="lg">
            <Link href="/shop">
              Browse Shop
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>

      <AuthModal
        open={open}
        defaultMode={defaultMode}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            router.push("/shop");
          }
        }}
      />
    </>
  );
}
