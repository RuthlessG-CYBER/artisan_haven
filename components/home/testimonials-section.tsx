"use client";

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { SectionHeading } from '@/components/shared/section-heading';
import { Reveal } from '@/components/shared/reveal';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    location: 'New York, NY',
    image: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?w=150',
    rating: 5,
    comment:
      'The recycled glass vase I ordered is absolutely stunning! You can really tell each piece is made with love. The packaging was eco-friendly too!',
    product: 'Recycled Glass Vase',
  },
  {
    id: 2,
    name: 'Michael Chen',
    location: 'San Francisco, CA',
    image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=150',
    rating: 5,
    comment:
      'Best granola I have ever tasted! Fresh, organic, and the perfect blend of nuts. My whole family loves it. Will definitely order again.',
    product: 'Organic Granola Mix',
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    location: 'Austin, TX',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=150',
    rating: 5,
    comment:
      'The custom birthday cake for my daughter was beyond perfect! The design was exactly what we wanted and it tasted amazing. Thank you!',
    product: 'Custom Birthday Cake',
  },
  {
    id: 4,
    name: 'David Thompson',
    location: 'Seattle, WA',
    image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?w=150',
    rating: 5,
    comment:
      'Love supporting sustainable businesses. The bamboo wind chime adds such a peaceful vibe to my garden. Highly recommend!',
    product: 'Bamboo Wind Chime',
  },
];

export function TestimonialsSection() {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((c) => (c + 1) % testimonials.length);
  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const testimonial = testimonials[current];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <SectionHeading
          title="What Our Customers Say"
          highlight="Customers"
          subtitle="Real reviews from happy customers"
        />

        <Reveal className="mx-auto max-w-3xl">
          <Card className="border-border/60 shadow-md">
            <CardContent className="p-8 sm:p-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.25 }}
                >
                  <Quote className="mb-4 h-10 w-10 text-primary/25" />
                  <p className="mb-8 text-lg leading-relaxed sm:text-xl">{testimonial.comment}</p>
                  <div className="flex flex-col items-center gap-4 sm:flex-row">
                    <div className="relative h-14 w-14 overflow-hidden rounded-full ring-2 ring-primary/20">
                      <Image src={testimonial.image} alt={testimonial.name} fill className="object-cover" />
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.location}</div>
                      <div className="mt-1 flex justify-center gap-0.5 sm:justify-start">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <div className="text-center sm:ml-auto sm:text-right">
                      <span className="text-sm text-muted-foreground">Purchased: </span>
                      <span className="text-sm font-medium">{testimonial.product}</span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={prev}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:bg-primary hover:text-primary-foreground"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === current ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30'
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:bg-primary hover:text-primary-foreground"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
