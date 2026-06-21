"use client";

import Image from 'next/image';
import {
  Leaf,
  Apple,
  Heart,
  Clock,
  Flame,
  Droplet,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProductGrid } from '@/components/products';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getProducts } from '@/lib/mock-data';
import { useCart } from '@/hooks/use-cart';
import { toast } from 'sonner';
import { NUTRITIONAL_CATEGORIES } from '@/lib/constants';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';

const BENEFITS = [
  {
    icon: Apple,
    title: '100% Natural',
    description: 'No artificial preservatives or additives',
  },
  {
    icon: Leaf,
    title: 'Organic Ingredients',
    description: 'Certified organic whenever possible',
  },
  {
    icon: Heart,
    title: 'Heart Healthy',
    description: 'Nutritious options for wellness',
  },
  {
    icon: Clock,
    title: 'Fresh Daily',
    description: 'Made fresh to order',
  },
];

export default function HealthyFoodsPage() {
  const [sortBy, setSortBy] = useState('newest');

  const products = useMemo(() => getProducts({ product_type: 'healthy_food' }), []);

  const { addItem } = useCart();

  const handleQuickAdd = (product: any) => {
    addItem(product, 1);
    toast.success('Added to cart', {
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-green-50 to-amber-50 dark:from-green-950/20 dark:to-amber-950/20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-4" variant="secondary">
                <Leaf className="w-3 h-3 mr-1" />
                Healthy & Natural
              </Badge>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                Nourish Your Body with
                <span className="text-primary block">Handmade Goodness</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Our healthy foods are made fresh daily using organic, natural ingredients.
                No preservatives, no artificial flavors - just pure, wholesome nutrition.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {BENEFITS.map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?w=800"
                  alt="Healthy Foods"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-accent/80 rounded-2xl flex flex-col items-center justify-center text-white shadow-xl">
                <span className="text-3xl font-bold">100%</span>
                <span className="text-sm">Natural</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">Our Healthy Selection</h2>
              <p className="text-muted-foreground">Fresh, nutritious, and delicious</p>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ProductGrid products={products} />

          {/* Nutritional Guide */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold mb-8 text-center">Understanding Nutrition Labels</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
              {NUTRITIONAL_CATEGORIES.map((nutrient) => (
                <Card key={nutrient.key} className="text-center">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-full mx-auto bg-primary/10 flex items-center justify-center mb-3">
                      {nutrient.key === 'calories' ? (
                        <Flame className="w-6 h-6 text-primary" />
                      ) : nutrient.key === 'fat' ? (
                        <Droplet className="w-6 h-6 text-primary" />
                      ) : (
                        <Leaf className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <h4 className="font-semibold text-sm">{nutrient.label}</h4>
                    <p className="text-xs text-muted-foreground">{nutrient.unit}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dietary Information */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Dietary Preferences</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We cater to various dietary needs. Look for these labels on our products.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { label: 'Gluten-Free', description: 'No gluten-containing ingredients' },
              { label: 'Vegan', description: '100% plant-based' },
              { label: 'Nut-Free', description: 'Safe for nut allergies' },
              { label: 'Organic', description: 'Certified organic ingredients' },
            ].map((diet) => (
              <Card key={diet.label} className="text-center">
                <CardContent className="pt-6">
                  <Badge className="mb-3" variant="secondary">{diet.label}</Badge>
                  <p className="text-sm text-muted-foreground">{diet.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How to Order */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Getting your healthy snacks is easy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '1', title: 'Browse & Select', description: 'Choose from our selection of healthy foods' },
              { step: '2', title: 'Place Your Order', description: 'Checkout securely with fast delivery options' },
              { step: '3', title: 'Enjoy Fresh', description: 'Receive your order fresh and ready to enjoy' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">{item.step}</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
