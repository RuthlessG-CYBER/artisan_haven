"use client";

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/lib/types';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    addItem(product, 1);
    toast.success('Added to cart', {
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist');
    }
  };

  const discountedPrice =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
    >
      <Card className="group overflow-hidden border-border/60 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Link href={`/product/${product.slug}`} className="relative block w-full h-full">
            <Image
              src={
                product.featured_image ||
                'https://images.pexels.com/photos/1125135/pexels-photo-1125135.jpeg?w=500'
              }
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Link>

          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {product.is_featured && (
              <Badge className="bg-primary text-primary-foreground">Featured</Badge>
            )}
            {product.is_best_seller && (
              <Badge className="bg-accent text-accent-foreground">Best Seller</Badge>
            )}
            {discountedPrice && <Badge variant="destructive">-{discountedPrice}%</Badge>}
          </div>

          <div className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              size="icon"
              variant={isWishlisted ? 'default' : 'secondary'}
              className="h-9 w-9 rounded-full"
              onClick={handleWishlistToggle}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </Button>
          </div>

          <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/70 to-transparent p-3 transition-transform duration-300 group-hover:translate-y-0 flex items-end justify-end">
            <Button
              className="w-1/2 rounded-full"
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>

          {product.sustainability_score && product.sustainability_score >= 4 && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-background/90 px-2 py-1 text-xs font-medium backdrop-blur-sm">
              <Leaf className="h-3 w-3 text-green-600" />
              <span>Eco-Friendly</span>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <Link href={`/product/${product.slug}`}>
            <h3 className="line-clamp-2 font-semibold transition-colors hover:text-primary min-h-[2.5rem]">
              {product.name}
            </h3>
          </Link>

          {product.category && (
            <p className="mt-1 text-sm text-muted-foreground">{product.category.name}</p>
          )}

          <div className="mt-2 flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium">4.5</span>
            <span className="text-sm text-muted-foreground">(128)</span>
          </div>

          <div className="mt-3 pt-1 flex items-center gap-2">
            <span className="text-lg font-bold text-primary">${product.price.toFixed(2)}</span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.compare_at_price.toFixed(2)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
