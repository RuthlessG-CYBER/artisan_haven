"use client";

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductGrid } from '@/components/products';
import { getProducts } from '@/lib/mock-data';
import { SectionHeading } from '@/components/shared/section-heading';
import { Reveal } from '@/components/shared/reveal';

export function FeaturedProducts() {
  const products = getProducts({ is_featured: true, limit: 4 });

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            title="Featured Products"
            highlight="Featured"
            subtitle="Handpicked selections from our artisans"
            align="left"
            className="mb-0"
          />
          <Reveal delay={0.1} className="shrink-0">
            <Button asChild variant="outline" className="group">
              <Link href="/shop?featured=true">
                View All
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </Reveal>
        </div>

        <ProductGrid products={products} />
      </div>
    </section>
  );
}
