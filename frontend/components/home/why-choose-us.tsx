"use client";

import { Gift, Heart, Leaf, Shield, Truck, Award } from 'lucide-react';
import { SectionHeading } from '@/components/shared/section-heading';
import { Reveal } from '@/components/shared/reveal';

const features = [
  {
    icon: Leaf,
    title: 'Sustainably Sourced',
    description: 'All materials are ethically sourced with minimal environmental impact.',
  },
  {
    icon: Heart,
    title: 'Handcrafted with Love',
    description: 'Every product is made by skilled artisans with attention to detail.',
  },
  {
    icon: Shield,
    title: 'Quality Guaranteed',
    description: 'We stand behind every product with our satisfaction guarantee.',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Careful packaging and quick shipping to your doorstep.',
  },
  {
    icon: Gift,
    title: 'Gift Ready',
    description: 'Beautiful packaging perfect for gifting to loved ones.',
  },
  {
    icon: Award,
    title: 'Award Winning',
    description: 'Recognized for excellence in sustainable craftsmanship.',
  },
];

export function WhyChooseUs() {
  return (
    <section className="bg-muted/30 py-20">
      <div className="container mx-auto px-4">
        <SectionHeading
          title="Why Choose Us"
          highlight="Choose"
          subtitle="We're committed to quality, sustainability, and your complete satisfaction"
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 0.06}>
              <div className="flex h-full flex-col items-center rounded-2xl border border-border/60 bg-card p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
