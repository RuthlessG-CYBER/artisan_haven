"use client";

import { useState } from 'react';
import { Mail, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Reveal } from '@/components/shared/reveal';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setEmail('');
    toast.success('Successfully subscribed!', {
      description: 'Thank you for subscribing to our newsletter.',
    });
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <Reveal className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 via-background to-accent/5 p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Mail className="h-7 w-7 text-primary" />
            </div>

            <h2 className="mb-3 text-3xl font-bold sm:text-4xl">Stay in the Loop</h2>
            <p className="mb-2 text-muted-foreground">
              Subscribe for exclusive offers, new arrivals, and artisan stories.
            </p>
            <p className="mb-8 text-sm text-muted-foreground">
              <Gift className="mr-1 inline h-4 w-4" />
              Get 10% off your first order when you subscribe!
            </p>

            <form onSubmit={handleSubmit} className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                required
              />
              <Button type="submit" disabled={isLoading} className="sm:px-8">
                {isLoading ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>

            <p className="mt-4 text-xs text-muted-foreground">
              By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
