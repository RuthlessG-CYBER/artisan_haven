"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Package,
  Truck,
  Clock,
  ArrowRight,
  Home,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function OrderConfirmationPage() {
  const router = useRouter();
  const [orderNumber] = useState<string>(() => {
    // In a real app, you would get the order number from URL params or state
    // For now, we'll generate a placeholder
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const orderNum = params.get('orderNumber');
      if (orderNum) {
        return orderNum;
      }
    }
    // Generate a placeholder order number for demo
    return `ORD-${Date.now().toString().slice(-8)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  });

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        {/* Success Message */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-6"
          >
            <CheckCircle className="w-12 h-12 text-green-600" />
          </motion.div>
          <h1 className="text-4xl font-bold mb-4">Order Confirmed!</h1>
          <p className="text-lg text-muted-foreground">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">Order Number:</span>
            <span className="font-mono font-bold">{orderNumber}</span>
          </div>
        </div>

        {/* Order Status Timeline */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-6">Order Status</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div className="w-0.5 h-12 bg-green-500 mt-2"></div>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-semibold">Order Placed</h3>
                  <p className="text-sm text-muted-foreground">Your order has been confirmed</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                  <div className="w-0.5 h-12 bg-gray-300 mt-2"></div>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-semibold">Processing</h3>
                  <p className="text-sm text-muted-foreground">Your order is being prepared</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div className="w-0.5 h-12 bg-gray-300 mt-2"></div>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-semibold text-muted-foreground">Shipped</h3>
                  <p className="text-sm text-muted-foreground">Your order is on the way</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-semibold text-muted-foreground">Delivered</h3>
                  <p className="text-sm text-muted-foreground">Order delivered to your doorstep</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What's Next */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">What's Next?</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Confirmation Email</h3>
                  <p className="text-sm text-muted-foreground">
                    You'll receive a confirmation email with your order details shortly.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Order Processing</h3>
                  <p className="text-sm text-muted-foreground">
                    We'll prepare your order and ship it within 1-2 business days.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Tracking Information</h3>
                  <p className="text-sm text-muted-foreground">
                    You'll receive tracking details once your order ships.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="flex-1 sm:flex-none">
            <Link href="/shop">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="flex-1 sm:flex-none">
            <Link href="/dashboard/orders">
              <ArrowRight className="w-4 h-4 mr-2" />
              View Orders
            </Link>
          </Button>
          <Button asChild size="lg" variant="ghost" className="flex-1 sm:flex-none">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Help Section */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-2">Need help with your order?</p>
          <Link href="/contact" className="text-primary hover:underline">
            Contact our support team
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
