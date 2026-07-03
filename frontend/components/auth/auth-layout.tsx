"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Leaf } from "lucide-react";

import { AuthDivider } from "@/components/auth/auth-divider";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BUSINESS_NAME, BUSINESS_TAGLINE } from "@/lib/constants";

const STATS = [
  { value: "500+", label: "Products" },
  { value: "100%", label: "Handmade" },
  { value: "10K+", label: "Happy Customers" },
];

interface AuthLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  showSocialAuth?: boolean;
}

export function AuthLayout({
  title,
  description,
  children,
  footer,
  showSocialAuth = true,
}: AuthLayoutProps) {
  return (
    <div className="min-h-[calc(100vh-5rem)] py-6 sm:py-8 lg:py-12">
      <div className="container mx-auto px-4">
        <div className="grid items-start gap-8 lg:grid-cols-2 lg:items-stretch lg:gap-16">
          {/* Branding panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative hidden overflow-hidden rounded-2xl border border-border/60 shadow-sm lg:block"
          >
            <div className="absolute inset-0 z-0">
              <Image
                src="https://images.pexels.com/photos/1125135/pexels-photo-1125135.jpeg?w=1200"
                alt="Handcrafted products"
                fill
                className="object-cover opacity-30 dark:opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/10" />
            </div>

            <div className="absolute top-10 right-10 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute bottom-10 left-10 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />

            <div className="relative z-10 flex min-h-full flex-col justify-center p-10 xl:p-14">
              <Badge
                variant="secondary"
                className="mb-6 w-fit bg-primary/10 text-primary hover:bg-primary/10"
              >
                Sustainably Handcrafted
              </Badge>

              <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
                <span className="font-serif italic text-primary">Artisan</span> Crafted
                <br />
                With <span className="gradient-text">Purpose</span>
              </h1>

              <p className="mt-6 max-w-md text-lg text-muted-foreground">
                {BUSINESS_TAGLINE}. Discover unique handmade art, wholesome foods, and custom cakes
                crafted with care.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild className="group">
                  <Link href="/shop">
                    Shop Collection
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/about">Our Story</Link>
                </Button>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-6 border-t border-border/50 pt-10">
                {STATS.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl font-bold text-primary xl:text-3xl">{stat.value}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Form panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto flex w-full max-w-md flex-col justify-center lg:max-w-lg"
          >
            <div className="mb-6 overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6 text-center lg:hidden">
              <Link href="/" className="mb-3 inline-flex items-center gap-2">
                <Leaf className="h-7 w-7 text-primary" />
                <span className="text-xl font-bold">{BUSINESS_NAME}</span>
              </Link>
              <p className="text-sm text-muted-foreground">{BUSINESS_TAGLINE}</p>
            </div>

            <Card className="border-border/60 shadow-md">
              <CardHeader className="space-y-2 pb-4 text-center lg:text-left">
                <CardTitle className="text-2xl sm:text-3xl">{title}</CardTitle>
                <CardDescription className="text-base">{description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {children}

                {showSocialAuth ? (
                  <>
                    <AuthDivider />
                    <SocialAuthButtons />
                  </>
                ) : null}

                <div className="text-center text-sm text-muted-foreground">{footer}</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
