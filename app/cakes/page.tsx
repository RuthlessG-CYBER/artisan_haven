"use client";

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  Cake,
  Calendar,
  Upload,
  Check,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ProductGrid } from '@/components/products';
import { getProducts } from '@/lib/mock-data';
import { useCart } from '@/hooks/use-cart';
import { toast } from 'sonner';

const CAKE_FLAVORS = [
  { id: 'vanilla', name: 'Vanilla', price: 0 },
  { id: 'chocolate', name: 'Chocolate', price: 0 },
  { id: 'red_velvet', name: 'Red Velvet', price: 5 },
  { id: 'strawberry', name: 'Strawberry', price: 5 },
  { id: 'carrot', name: 'Carrot', price: 5 },
  { id: 'lemon', name: 'Lemon', price: 5 },
];

const CAKE_SIZES = [
  { id: '6inch', name: '6 inch', servings: '8-10', price: 0 },
  { id: '8inch', name: '8 inch', servings: '12-16', price: 15 },
  { id: '10inch', name: '10 inch', servings: '20-24', price: 30 },
  { id: '12inch', name: '12 inch', servings: '28-32', price: 50 },
];

const CAKE_DESIGNS = [
  { id: 'floral', name: 'Floral Design', price: 10 },
  { id: 'geometric', name: 'Geometric Pattern', price: 15 },
  { id: 'drip', name: 'Drip Cake', price: 12 },
  { id: 'naked', name: 'Naked Cake', price: 8 },
  { id: 'photo', name: 'Photo Cake', price: 25 },
];

export default function CakesPage() {
  const [step, setStep] = useState(1);
  const [customization, setCustomization] = useState({
    flavor: '',
    size: '',
    design: '',
    message: '',
    referenceImage: null as File | null,
    deliveryDate: undefined as Date | undefined,
    deliveryTime: '',
    specialInstructions: '',
  });

  const { addItem } = useCart();

  const cakeProducts = useMemo(() => getProducts({ product_type: 'cakes' }), []);

  const calculateTotal = () => {
    const basePrice = 55; // Base birthday cake price
    const flavorPrice = CAKE_FLAVORS.find(f => f.id === customization.flavor)?.price || 0;
    const sizePrice = CAKE_SIZES.find(s => s.id === customization.size)?.price || 0;
    const designPrice = CAKE_DESIGNS.find(d => d.id === customization.design)?.price || 0;
    return basePrice + flavorPrice + sizePrice + designPrice;
  };

  const handleAddToCart = () => {
    const cakeProduct = cakeProducts[0];
    if (cakeProduct) {
      addItem(cakeProduct, 1, {
        flavor: customization.flavor,
        size: customization.size,
        design: customization.design,
        message: customization.message,
        delivery_date: customization.deliveryDate?.toISOString(),
        delivery_time: customization.deliveryTime,
        special_instructions: customization.specialInstructions,
      });
      toast.success('Custom cake added to cart!');
    }
  };

  const nextStep = () => setStep(Math.min(4, step + 1));
  const prevStep = () => setStep(Math.max(1, step - 1));

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Custom Birthday Cakes</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Design your perfect custom cake. Choose from our selection of flavors, sizes,
          and designs to create something truly special.
        </p>
      </motion.div>

      {/* Progress */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="flex justify-between mb-2">
          {['Flavor & Size', 'Design', 'Details', 'Review'].map((label, index) => (
            <span
              key={label}
              className={`text-sm ${step > index ? 'text-primary' : step === index + 1 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
            >
              {step}. {label}
            </span>
          ))}
        </div>
        <Progress value={(step / 4) * 100} className="h-2" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Customization Form */}
        <div className="lg:col-span-2">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {/* Step 1: Flavor & Size */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cake className="w-5 h-5" />
                    Select Flavor & Size
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Flavor */}
                  <div>
                    <Label className="text-base font-semibold mb-4 block">Choose Your Flavor</Label>
                    <RadioGroup
                      value={customization.flavor}
                      onValueChange={(value) => setCustomization({ ...customization, flavor: value })}
                      className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                    >
                      {CAKE_FLAVORS.map((flavor) => (
                        <div key={flavor.id}>
                          <RadioGroupItem
                            value={flavor.id}
                            id={flavor.id}
                            className="sr-only peer"
                          />
                          <Label
                            htmlFor={flavor.id}
                            className="flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                          >
                            <span className="font-medium">{flavor.name}</span>
                            {flavor.price > 0 && (
                              <Badge variant="secondary" className="mt-2">+${flavor.price}</Badge>
                            )}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Size */}
                  <div>
                    <Label className="text-base font-semibold mb-4 block">Choose Your Size</Label>
                    <RadioGroup
                      value={customization.size}
                      onValueChange={(value) => setCustomization({ ...customization, size: value })}
                      className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                    >
                      {CAKE_SIZES.map((size) => (
                        <div key={size.id}>
                          <RadioGroupItem
                            value={size.id}
                            id={size.id}
                            className="sr-only peer"
                          />
                          <Label
                            htmlFor={size.id}
                            className="flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                          >
                            <span className="font-bold text-lg">{size.name}</span>
                            <span className="text-sm text-muted-foreground">Serves {size.servings}</span>
                            {size.price > 0 && (
                              <Badge variant="secondary" className="mt-2">+${size.price}</Badge>
                            )}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Design */}
            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Choose Your Design</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={customization.design}
                    onValueChange={(value) => setCustomization({ ...customization, design: value })}
                    className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                  >
                    {CAKE_DESIGNS.map((design) => (
                      <div key={design.id}>
                        <RadioGroupItem
                          value={design.id}
                          id={design.id}
                          className="sr-only peer"
                        />
                        <Label
                          htmlFor={design.id}
                          className="flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                        >
                          <span className="font-medium">{design.name}</span>
                          <Badge variant="secondary" className="mt-2">
                            {design.price > 0 ? `+$${design.price}` : 'Included'}
                          </Badge>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  <Separator className="my-6" />

                  {/* Reference Image Upload */}
                  <div>
                    <Label className="text-base font-semibold mb-4 block">Upload Reference Image (Optional)</Label>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-4">
                        Drag and drop an image, or click to browse
                      </p>
                      <Input type="file" accept="image/*" className="max-w-xs mx-auto" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Details */}
            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Add Your Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Message on Cake */}
                  <div>
                    <Label htmlFor="message" className="font-semibold">Message on Cake</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Add a personalized message (up to 25 characters)
                    </p>
                    <Input
                      id="message"
                      placeholder="e.g., Happy Birthday Sarah!"
                      maxLength={25}
                      value={customization.message}
                      onChange={(e) => setCustomization({ ...customization, message: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground mt-1 text-right">
                      {customization.message.length}/25
                    </p>
                  </div>

                  {/* Delivery Date */}
                  <div>
                    <Label className="font-semibold">Delivery Date</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Please allow at least 48 hours for custom orders
                    </p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <Calendar className="w-4 h-4 mr-2" />
                          {customization.deliveryDate
                            ? format(customization.deliveryDate, 'PPP')
                            : 'Select date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={customization.deliveryDate}
                          onSelect={(date) => setCustomization({ ...customization, deliveryDate: date })}
                          disabled={(date) => date < new Date() || date < new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Delivery Time */}
                  <div>
                    <Label htmlFor="deliveryTime" className="font-semibold">Preferred Delivery Time</Label>
                    <Select
                      value={customization.deliveryTime}
                      onValueChange={(value) => setCustomization({ ...customization, deliveryTime: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning (9AM - 12PM)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
                        <SelectItem value="evening">Evening (5PM - 8PM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Special Instructions */}
                  <div>
                    <Label htmlFor="instructions" className="font-semibold">Special Instructions</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Any allergies or special requests?
                    </p>
                    <Textarea
                      id="instructions"
                      placeholder="e.g., Nut-free, gluten-free options needed..."
                      value={customization.specialInstructions}
                      onChange={(e) => setCustomization({ ...customization, specialInstructions: e.target.value })}
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle>Review Your Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Flavor</span>
                      <span className="font-medium capitalize">
                        {customization.flavor?.replace('_', ' ') || 'Not selected'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Size</span>
                      <span className="font-medium">
                        {CAKE_SIZES.find(s => s.id === customization.size)?.name || 'Not selected'}
                        <span className="text-sm ml-2 text-muted-foreground">
                          (Serves {CAKE_SIZES.find(s => s.id === customization.size)?.servings || 'N/A'})
                        </span>
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Design</span>
                      <span className="font-medium">
                        {CAKE_DESIGNS.find(d => d.id === customization.design)?.name || 'Not selected'}
                      </span>
                    </div>
                    {customization.message && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Message</span>
                        <span className="font-medium">{customization.message}</span>
                      </div>
                    )}
                    {customization.deliveryDate && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Delivery Date</span>
                        <span className="font-medium">
                          {format(customization.deliveryDate, 'PPP')}
                        </span>
                      </div>
                    )}
                    {customization.deliveryTime && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Delivery Time</span>
                        <span className="font-medium capitalize">{customization.deliveryTime}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={step === 1}
            >
              Previous
            </Button>
            {step < 4 ? (
              <Button onClick={nextStep}>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleAddToCart}>
                <Cake className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            )}
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square rounded-lg bg-muted flex items-center justify-center mb-4">
                <Cake className="w-20 h-20 text-muted-foreground" />
              </div>

              <h3 className="font-semibold mb-4">Your Custom Cake</h3>

              <div className="space-y-2 text-sm">
                {customization.flavor && (
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="capitalize">{customization.flavor.replace('_', ' ')} flavor</span>
                  </div>
                )}
                {customization.size && (
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>{CAKE_SIZES.find(s => s.id === customization.size)?.name} size</span>
                  </div>
                )}
                {customization.design && (
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>{CAKE_DESIGNS.find(d => d.id === customization.design)?.name}</span>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Base Price</span>
                  <span>$55.00</span>
                </div>
                {customization.flavor && (CAKE_FLAVORS.find(f => f.id === customization.flavor)?.price || 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Flavor</span>
                    <span>+${CAKE_FLAVORS.find(f => f.id === customization.flavor)?.price}</span>
                  </div>
                )}
                {customization.size && (CAKE_SIZES.find(s => s.id === customization.size)?.price || 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Size</span>
                    <span>+${CAKE_SIZES.find(s => s.id === customization.size)?.price}</span>
                  </div>
                )}
                {customization.design && (CAKE_DESIGNS.find(d => d.id === customization.design)?.price || 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Design</span>
                    <span>+${CAKE_DESIGNS.find(d => d.id === customization.design)?.price}</span>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary">${calculateTotal().toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ready-made Cakes */}
      {cakeProducts && cakeProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-8">Or Choose from Our Designs</h2>
          <ProductGrid products={cakeProducts} />
        </section>
      )}
    </div>
  );
}
