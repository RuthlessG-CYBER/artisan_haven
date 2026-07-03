"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Truck,
  MapPin,
  Check,
  ChevronLeft,
  ChevronRight,
  Lock,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/components/auth/auth-provider';
import { useCart } from '@/hooks/use-cart';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const CHECKOUT_STEPS = [
  { id: 'shipping', title: 'Shipping', icon: MapPin },
  { id: 'delivery', title: 'Delivery', icon: Truck },
  { id: 'payment', title: 'Payment', icon: CreditCard },
];

function StripePaymentForm({
  clientSecret,
  shippingInfo,
  deliveryMethod,
  saveInfo,
  onSuccess,
  onError,
}: {
  clientSecret: string;
  shippingInfo: any;
  deliveryMethod: string;
  saveInfo: boolean;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      onError(submitError.message ?? 'Payment failed');
      setLoading(false);
      return;
    }

    const { error: payError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation`,
      },
      redirect: 'if_required',
    });

    if (payError) {
      onError(payError.message ?? 'Payment failed');
      setLoading(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      const res = await apiClient.confirmStripeOrder({
        paymentIntentId: paymentIntent.id,
        shippingInfo,
        deliveryMethod,
        saveInfo,
      });

      if (res.error) {
        onError(res.error);
        setLoading(false);
        return;
      }

      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <Button type="submit" className="w-full mt-4" disabled={!stripe || loading}>
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="w-4 h-4 mr-2" />
            Pay Now
          </>
        )}
      </Button>
    </form>
  );
}

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const { items, getTotal, clearCart } = useCart();
  const { isAuthenticated, openAuthModal } = useAuth();

  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });

  const router = useRouter();
  const [deliveryMethod, setDeliveryMethod] = useState('standard');
  const [saveInfo, setSaveInfo] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [isProcessing, setIsProcessing] = useState(false);
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal({
        mode: 'login',
        reason: 'Sign in to complete your purchase.',
        redirectTo: '/checkout',
      });
    }

    apiClient.getStripeConfig().then((res) => {
      if (res.data) {
        setStripePromise(loadStripe((res.data as { publishableKey: string }).publishableKey));
      }
    });
  }, [isAuthenticated, openAuthModal]);

  useEffect(() => {
    if (paymentMethod === 'stripe' && currentStep === 2 && !clientSecret) {
      apiClient.createStripePaymentIntent(deliveryMethod).then((res) => {
        if (res.data) {
          setClientSecret((res.data as { clientSecret: string }).clientSecret);
        }
      });
    }
  }, [paymentMethod, currentStep, deliveryMethod, clientSecret]);

  const subtotal = getTotal();
  const shipping = subtotal > 50 ? 0 : 5.99;
  const expressShipping = deliveryMethod === 'express' ? 9.99 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + expressShipping + tax;

  const handleNext = () => {
    if (currentStep < CHECKOUT_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePlaceOrder = async () => {
    if (paymentMethod === 'stripe') {
      return; // Handled by StripePaymentForm
    }
    await handleCashOnDelivery();
  };

  const handleCashOnDelivery = async () => {
    setIsProcessing(true);

    try {
      const orderResponse = await apiClient.createOrder({
        shippingInfo,
        deliveryMethod,
        paymentMethod,
        saveInfo,
      });

      if (orderResponse.error) {
        toast.error('Failed to place order', {
          description: orderResponse.error,
        });
        setIsProcessing(false);
        return;
      }

      toast.success('Order placed successfully!', {
        description: 'You will receive a confirmation email shortly.',
      });
      clearCart();
      router.push('/order-confirmation');
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Failed to place order', {
        description: 'An error occurred while placing your order.',
      });
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8">
          Add items to your cart before checking out.
        </p>
        <Button asChild>
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-8 ${!isAuthenticated ? 'pointer-events-none opacity-60' : ''}`}>
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {CHECKOUT_STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center ${
                index <= currentStep ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index < currentStep
                    ? 'bg-primary text-primary-foreground'
                    : index === currentStep
                    ? 'border-2 border-primary'
                    : 'border border-muted-foreground'
                }`}
              >
                {index < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              <span className="ml-2 hidden sm:block font-medium">{step.title}</span>
            </div>
          ))}
        </div>
        <Progress value={((currentStep + 1) / CHECKOUT_STEPS.length) * 100} className="h-2" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* Step 1: Shipping Info */}
            {currentStep === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={shippingInfo.firstName}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, firstName: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={shippingInfo.lastName}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, lastName: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={shippingInfo.email}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, email: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={shippingInfo.phone}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, phone: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      value={shippingInfo.address}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, address: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="apartment">Apartment, Suite, etc. (optional)</Label>
                    <Input
                      id="apartment"
                      value={shippingInfo.apartment}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, apartment: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={shippingInfo.city}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, city: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={shippingInfo.state}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, state: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        value={shippingInfo.zipCode}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, zipCode: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="saveInfo"
                      checked={saveInfo}
                      onCheckedChange={(checked) => setSaveInfo(checked as boolean)}
                    />
                    <Label htmlFor="saveInfo" className="font-normal">
                      Save this information for next time
                    </Label>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Delivery Options */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod}>
                    <div className="space-y-4">
                      <div>
                        <RadioGroupItem value="standard" id="standard" className="sr-only peer" />
                        <Label
                          htmlFor="standard"
                          className="flex justify-between items-center p-4 border rounded-lg cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                        >
                          <div>
                            <div className="font-semibold">Standard Delivery</div>
                            <div className="text-sm text-muted-foreground">3-5 business days</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              {subtotal >= 50 ? 'Free' : '$5.99'}
                            </div>
                          </div>
                        </Label>
                      </div>

                      <div>
                        <RadioGroupItem value="express" id="express" className="sr-only peer" />
                        <Label
                          htmlFor="express"
                          className="flex justify-between items-center p-4 border rounded-lg cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                        >
                          <div>
                            <div className="font-semibold">Express Delivery</div>
                            <div className="text-sm text-muted-foreground">1-2 business days</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">$9.99</div>
                          </div>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>

                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <Truck className="w-4 h-4 text-green-500" />
                      <span>Free shipping on orders over $50!</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Payment */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="space-y-4">
                      <div>
                        <RadioGroupItem value="stripe" id="stripe" className="sr-only peer" />
                        <Label
                          htmlFor="stripe"
                          className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer peer-data-[state=checked]:border-primary"
                        >
                          <CreditCard className="w-5 h-5" />
                          <div>
                            <span className="font-medium">Credit / Debit Card</span>
                            <p className="text-xs text-muted-foreground">Secure payment via Stripe</p>
                          </div>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="cash_on_delivery" id="cash_on_delivery" className="sr-only peer" />
                        <Label
                          htmlFor="cash_on_delivery"
                          className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer peer-data-[state=checked]:border-primary"
                        >
                          <Lock className="w-5 h-5" />
                          <div>
                            <span className="font-medium">Cash on Delivery</span>
                            <p className="text-xs text-muted-foreground">Pay when you receive your order</p>
                          </div>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>

                  {paymentMethod === 'stripe' && clientSecret && stripePromise && (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <StripePaymentForm
                        clientSecret={clientSecret}
                        shippingInfo={shippingInfo}
                        deliveryMethod={deliveryMethod}
                        saveInfo={saveInfo}
                        onSuccess={() => {
                          toast.success('Order placed successfully!', {
                            description: 'You will receive a confirmation email shortly.',
                          });
                          clearCart();
                          router.push('/order-confirmation');
                        }}
                        onError={(msg) => {
                          toast.error('Payment failed', { description: msg });
                          setIsProcessing(false);
                        }}
                      />
                    </Elements>
                  )}

                  {paymentMethod === 'stripe' && !clientSecret && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Loading payment form...</span>
                    </div>
                  )}

                  <div className="p-4 bg-muted/50 rounded-lg text-sm">
                    <p className="flex items-center gap-2 mb-2">
                      <Lock className="w-4 h-4" />
                      Secure Payment
                    </p>
                    <p className="text-muted-foreground">
                      Your payment information is encrypted and secure.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              {currentStep < CHECKOUT_STEPS.length - 1 ? (
                <Button onClick={handleNext}>
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : paymentMethod === 'cash_on_delivery' ? (
                <Button onClick={handlePlaceOrder} disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Place Order
                    </>
                  )}
                </Button>
              ) : null}
            </div>
          </motion.div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={item.product.featured_image || 'https://images.pexels.com/photos/1125135/pexels-photo-1125135.jpeg?w=200'}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-medium">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Pricing */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {deliveryMethod === 'express'
                      ? '$9.99'
                      : subtotal >= 50
                      ? 'Free'
                      : '$5.99'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
