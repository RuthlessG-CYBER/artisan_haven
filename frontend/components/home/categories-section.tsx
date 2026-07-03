"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { SectionHeading } from '@/components/shared/section-heading';
import { Reveal } from '@/components/shared/reveal';

const categories = [
  {
    title: 'Recycled Art & Crafts',
    description: 'Beautiful creations from sustainable materials',
    image: 'https://images.pexels.com/photos/7692820/pexels-photo-7692820.jpeg?w=600',
    href: '/shop?category=art-crafts',
    count: '48 Products',
  },
  {
    title: 'Healthy Foods',
    description: 'Nutritious and delicious handmade treats',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?w=600',
    href: '/healthy-foods',
    count: '32 Products',
  },
  {
    title: 'Custom Birthday Cakes',
    description: 'Personalized cakes for your special moments',
    image: 'https://images.pexels.com/photos/17745938/pexels-photo-17745938.jpeg?w=600',
    href: '/cakes',
    count: '15 Designs',
  },
];

export function CategoriesSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <SectionHeading
          title="Shop by Category"
          highlight="Category"
          subtitle="Explore our curated collections of handcrafted products"
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {categories.map((category, index) => (
            <Reveal key={category.title} delay={index * 0.08}>
              <Link href={category.href} className="group block h-full">
                <Card className="overflow-hidden border-border/60 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={category.image}
                      alt={category.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                      <p className="mb-1 text-sm text-white/75">{category.count}</p>
                      <h3 className="mb-2 text-xl font-bold">{category.title}</h3>
                      <p className="mb-3 text-sm text-white/90">{category.description}</p>
                      <div className="flex items-center text-sm font-medium text-emerald-300">
                        Explore Collection
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
