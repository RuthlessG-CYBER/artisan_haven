"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Heart,
  ShoppingCart,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Leaf,
  Minus,
  Plus,
  Share2,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductGrid } from '@/components/products';
import { useProduct, useProducts } from '@/hooks/use-products';
import { useAuth } from '@/components/auth/auth-provider';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { toast } from 'sonner';
import { NUTRITIONAL_CATEGORIES } from '@/lib/constants';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { requireAuth } = useAuth();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  const isWishlisted = isInWishlist(slug);

  const { product, loading } = useProduct(slug);
  const { products: relatedProducts } = useProducts(
    product ? { product_type: product.product_type, limit: 4 } : {}
  );

  const relatedFiltered = relatedProducts.filter(p => p.id !== product?.id).slice(0, 4);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The product you're looking for doesn't exist.
        </p>
        <Button asChild>
          <Link href="/shop">Back to Shop</Link>
        </Button>
      </div>
    );
  }

  const images = product.images?.length > 0
    ? product.images
    : [product.featured_image || 'https://i.pinimg.com/736x/a4/3e/e6/a43ee6d3e310564af22b71bdfb1a52e7.jpg?w=800'];

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success('Added to cart', {
      description: `${quantity}x ${product.name} added to your cart.`,
    });
  };

  const handleBuyNow = () => {
    requireAuth(() => {
      addItem(product, quantity);
      router.push('/checkout');
    }, {
      reason: 'Sign in to complete your purchase.',
      redirectTo: '/checkout',
    });
  };

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(slug);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist');
    }
  };

  const discountedPrice = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-foreground">Shop</Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            <Image
              src={images[selectedImage]}
              alt={product.name}
              fill
              className="object-cover"
              priority
              loading="eager"
            />
            {product.is_featured && (
              <Badge className="absolute top-4 left-4">Featured</Badge>
            )}
            {product.is_best_seller && (
              <Badge className="absolute top-4 left-24 bg-accent text-accent-foreground">
                Best Seller
              </Badge>
            )}
            {discountedPrice && (
              <Badge variant="destructive" className="absolute top-4 right-4">
                -{discountedPrice}%
              </Badge>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {images.map((img: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 ${
                    selectedImage === index ? 'ring-2 ring-primary' : 'border'
                  }`}
                >
                  <Image src={img} alt={`${product.name} ${index + 1}`} fill className="object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                ))}
                <span className="text-sm ml-2">4.5 (128 reviews)</span>
              </div>
              {product.sustainability_score && product.sustainability_score >= 4 && (
                <Badge variant="secondary" className="gap-1">
                  <Leaf className="w-3 h-3 text-green-500" />
                  Eco-Friendly
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-baseline gap-3 pt-2">
            <span className="text-3xl font-bold text-primary">${product.price.toFixed(2)}</span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-xl text-muted-foreground line-through">
                ${product.compare_at_price.toFixed(2)}
              </span>
            )}
          </div>

          <p className="text-muted-foreground">{product.short_description}</p>

          <div className="flex items-center gap-2">
            <span className="text-sm">Availability:</span>
            {product.stock_quantity > 0 ? (
              <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                <Check className="w-4 h-4" />
                In Stock ({product.stock_quantity} available)
              </span>
            ) : (
              <span className="text-sm text-destructive">Out of Stock</span>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center border rounded-md">
              <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                <Minus className="w-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)} disabled={!!(product.stock_quantity && quantity >= product.stock_quantity)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <Button size="lg" className="flex-1 sm:flex-none" onClick={handleAddToCart} disabled={product.stock_quantity === 0}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>

            <Button size="lg" variant="secondary" className="flex-1 sm:flex-none" onClick={handleBuyNow} disabled={product.stock_quantity === 0}>
              Buy Now
            </Button>

            <Button variant="outline" size="icon" onClick={handleWishlistToggle}>
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>

            <Button variant="outline" size="icon">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-6 border-y">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="w-5 h-5 text-primary" />
              <span>Free Shipping</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-5 h-5 text-primary" />
              <span>Quality Guarantee</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <RotateCcw className="w-5 h-5 text-primary" />
              <span>30 Day Returns</span>
            </div>
          </div>

          <Tabs defaultValue="description">
            <TabsList>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
              <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-4">
              <div className="prose dark:prose-invert max-w-none">
                <p>{product.description}</p>
              </div>
            </TabsContent>

            <TabsContent value="nutrition" className="mt-4">
              {product.nutritional_info ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {NUTRITIONAL_CATEGORIES.map((item) => (
                    <div key={item.key} className="p-4 rounded-lg bg-muted/50 text-center">
                      <div className="text-2xl font-bold text-primary">
                        {product.nutritional_info?.[item.key as keyof typeof product.nutritional_info]}
                        <span className="text-sm text-muted-foreground ml-1">{item.unit}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">{item.label}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nutritional information not available for this product.</p>
              )}
            </TabsContent>

            <TabsContent value="ingredients" className="mt-4">
              {product.ingredients && product.ingredients.length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {product.ingredients.map((ingredient: string, index: number) => (
                    <li key={index} className="text-sm">{ingredient}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">Ingredients list not available for this product.</p>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Customer Reviews</span>
                  <Button size="sm">Write a Review</Button>
                </div>
                {[1, 2].map((review) => (
                  <div key={review} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">John D.</span>
                      <span className="text-xs text-muted-foreground">
                        {review === 1 ? '2 weeks ago' : '1 month ago'}
                      </span>
                    </div>
                    <p className="text-sm">
                      {review === 1
                        ? 'Amazing quality! You can really tell it was handmade with care. Will definitely buy again.'
                        : 'Exactly as described. Fast shipping and beautiful packaging. Highly recommend!'}
                    </p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {relatedFiltered.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-8">You May Also Like</h2>
          <ProductGrid products={relatedFiltered} />
        </section>
      )}
    </div>
  );
}
