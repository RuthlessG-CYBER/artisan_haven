"use client";

import { Suspense, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ProductGrid, ProductGridSkeleton } from '@/components/products';
import { useProducts } from '@/hooks/use-products';
import { SORT_OPTIONS, PRICE_RANGES } from '@/lib/constants';
import type { ProductType } from '@/lib/types';

const PRODUCT_TYPES: Array<{ value: ProductType; label: string }> = [
  { value: 'art_crafts', label: 'Art & Crafts' },
  { value: 'healthy_food', label: 'Healthy Foods' },
  { value: 'cakes', label: 'Custom Cakes' },
];

function ShopPageContent() {
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [productType, setProductType] = useState(searchParams.get('type') || '');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [inStock, setInStock] = useState(false);
  const [featured, setFeatured] = useState(searchParams.get('featured') === 'true');
  const [bestSeller, setBestSeller] = useState(searchParams.get('bestseller') === 'true');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const { products: allProducts, loading } = useProducts({
    product_type: productType || undefined,
    is_featured: featured || undefined,
    is_best_seller: bestSeller || undefined,
    search: search || undefined,
    sort: sortBy,
    min_price: priceRange[0] > 0 ? priceRange[0] : undefined,
    max_price: priceRange[1] < 500 ? priceRange[1] : undefined,
    in_stock: inStock || undefined,
  });

  const filteredProducts = useMemo(() => allProducts, [allProducts]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const clearFilters = () => {
    setSearch('');
    setProductType('');
    setPriceRange([0, 500]);
    setInStock(false);
    setFeatured(false);
    setBestSeller(false);
    setCurrentPage(1);
  };

  const activeFilterCount = [
    search,
    productType,
    priceRange[0] > 0 || priceRange[1] < 500,
    inStock,
    featured,
    bestSeller,
  ].filter(Boolean).length;

  const filterSidebar = (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4">Product Type</h3>
        <RadioGroup value={productType} onValueChange={setProductType}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="" id="all" />
            <Label htmlFor="all">All Products</Label>
          </div>
          {PRODUCT_TYPES.map((type) => (
            <div key={type.value} className="flex items-center space-x-2">
              <RadioGroupItem value={type.value} id={type.value} />
              <Label htmlFor={type.value}>{type.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <div className="flex flex-wrap gap-1.5">
          <Button
            variant={priceRange[0] === 0 && priceRange[1] === 500 ? "default" : "outline"}
            size="sm"
            className="text-xs h-8 px-2.5"
            onClick={() => setPriceRange([0, 500])}
          >
            All
          </Button>
          {PRICE_RANGES.map((range) => (
            <Button
              key={range.label}
              variant={priceRange[0] === range.value[0] && priceRange[1] === range.value[1] ? "default" : "outline"}
              size="sm"
              className="text-xs h-8 px-2.5 whitespace-nowrap"
              onClick={() => setPriceRange(range.value)}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4">Other Filters</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="in-stock"
              checked={inStock}
              onCheckedChange={(checked) => setInStock(checked as boolean)}
            />
            <Label htmlFor="in-stock">In Stock Only</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={featured}
              onCheckedChange={(checked) => setFeatured(checked as boolean)}
            />
            <Label htmlFor="featured">Featured Products</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="bestseller"
              checked={bestSeller}
              onCheckedChange={(checked) => setBestSeller(checked as boolean)}
            />
            <Label htmlFor="bestseller">Best Sellers</Label>
          </div>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          Clear All Filters
          <Badge variant="secondary" className="ml-2">{activeFilterCount}</Badge>
        </Button>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Shop All Products</h1>
        <p className="text-muted-foreground">
          Discover our handcrafted treasures
        </p>
      </motion.div>

      <div className="flex flex-wrap items-center gap-4 mb-8">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="lg:hidden">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2">{activeFilterCount}</Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-8">{filterSidebar}</div>
          </SheetContent>
        </Sheet>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="hidden sm:flex items-center gap-1 border rounded-md p-1">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {(productType || featured || bestSeller || inStock) && (
        <div className="flex flex-wrap gap-2 mb-6">
          {productType && (
            <Badge variant="secondary" className="gap-1">
              {PRODUCT_TYPES.find((t) => t.value === productType)?.label}
              <button onClick={() => setProductType('')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {featured && (
            <Badge variant="secondary" className="gap-1">
              Featured
              <button onClick={() => setFeatured(false)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {bestSeller && (
            <Badge variant="secondary" className="gap-1">
              Best Seller
              <button onClick={() => setBestSeller(false)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      <div className="flex gap-8">
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <Accordion type="multiple" defaultValue={['type', 'price', 'other']} className="space-y-4">
              <AccordionItem value="type">
                <AccordionTrigger className="font-semibold">Product Type</AccordionTrigger>
                <AccordionContent>
                  <RadioGroup value={productType} onValueChange={setProductType}>
                    <div className="flex items-center space-x-2 mb-2">
                      <RadioGroupItem value="" id="all-desktop" />
                      <Label htmlFor="all-desktop">All Products</Label>
                    </div>
                    {PRODUCT_TYPES.map((type) => (
                      <div key={type.value} className="flex items-center space-x-2 mb-2">
                        <RadioGroupItem value={type.value} id={`${type.value}-desktop`} />
                        <Label htmlFor={`${type.value}-desktop`}>{type.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="price">
                <AccordionTrigger className="font-semibold">Price Range</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-wrap gap-1.5">
                    <Button
                      variant={priceRange[0] === 0 && priceRange[1] === 500 ? "default" : "outline"}
                      size="sm"
                      className="text-xs h-8 px-2.5"
                      onClick={() => setPriceRange([0, 500])}
                    >
                      All
                    </Button>
                    {PRICE_RANGES.map((range) => (
                      <Button
                        key={range.label}
                        variant={priceRange[0] === range.value[0] && priceRange[1] === range.value[1] ? "default" : "outline"}
                        size="sm"
                        className="text-xs h-8 px-2.5 whitespace-nowrap"
                        onClick={() => setPriceRange(range.value)}
                      >
                        {range.label}
                      </Button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="other">
                <AccordionTrigger className="font-semibold">Other Filters</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="in-stock-desktop" checked={inStock} onCheckedChange={(checked) => setInStock(checked as boolean)} />
                      <Label htmlFor="in-stock-desktop">In Stock Only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="featured-desktop" checked={featured} onCheckedChange={(checked) => setFeatured(checked as boolean)} />
                      <Label htmlFor="featured-desktop">Featured Products</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="bestseller-desktop" checked={bestSeller} onCheckedChange={(checked) => setBestSeller(checked as boolean)} />
                      <Label htmlFor="bestseller-desktop">Best Sellers</Label>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {activeFilterCount > 0 && (
              <Button variant="outline" className="w-full mt-6" onClick={clearFilters}>
                Clear All Filters
              </Button>
            )}
          </div>
        </aside>

        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-6">
            {loading ? 'Loading products...' : `Showing ${paginatedProducts.length} of ${filteredProducts.length} products`}
          </p>

          {loading ? <ProductGridSkeleton count={itemsPerPage} /> : <ProductGrid products={paginatedProducts} />}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))
                .map((page) => (
                  <Button key={page} variant={page === currentPage ? 'default' : 'outline'} onClick={() => setCurrentPage(page)}>
                    {page}
                  </Button>
                ))}
              <Button variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16">Loading shop...</div>}>
      <ShopPageContent />
    </Suspense>
  );
}
