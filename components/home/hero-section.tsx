"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BUSINESS_TAGLINE } from "@/lib/constants";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

export function HeroSection() {
  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.pexels.com/photos/60638/pexels-photo-60638.jpeg?w=1920"
          alt="Handmade products"
          fill
          priority
          className="object-cover opacity-20 dark:opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />
      </div>

      <div className="absolute top-20 right-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute bottom-20 left-10 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-3xl">
          <motion.div {...fadeUp} transition={{ duration: 0.6 }}>
            <span className="mb-6 inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              Sustainably Handcrafted
            </span>
          </motion.div>

          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6 text-4xl font-bold leading-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            <span className="font-serif italic text-primary">Artisan</span> Crafted
            <br />
            With <span className="gradient-text">Purpose</span>
          </motion.h1>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl"
          >
            {BUSINESS_TAGLINE}. Discover unique handmade art, wholesome foods, and custom
            cakes crafted with care for you and the planet.
          </motion.p>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <Button asChild size="lg" className="group h-11 px-8">
              <Link href="/shop">
                Shop Collection
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="group h-11 px-8">
              <Play className="mr-2 h-4 w-4" />
              Watch Our Story
            </Button>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 grid max-w-xl grid-cols-3 gap-8 border-t border-border/50 pt-12"
          >
            {[
              { value: "500+", label: "Products" },
              { value: "100%", label: "Handmade" },
              { value: "10K+", label: "Happy Customers" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold text-primary sm:text-4xl">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
