"use client";

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Package,
  Check,
  Truck,
  Clock,
  Home,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { Suspense } from 'react';

const TRACKING_STEPS = [
  { id: 'confirmed', label: 'Order Confirmed', icon: Check },
  { id: 'processing', label: 'Processing', icon: Package },
  { id: 'shipped', label: 'Shipped', icon: Truck },
  { id: 'in_transit', label: 'In Transit', icon: Clock },
  { id: 'delivered', label: 'Delivered', icon: Home },
];

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get('order') || '';

  const [orderNumber, setOrderNumber] = useState(initialOrder);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingResult, setTrackingResult] = useState<Record<string, unknown> | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      toast.error('Please enter an order number');
      return;
    }

    setIsTracking(true);

    const res = await apiClient.trackOrder(orderNumber.trim());
    setIsTracking(false);

    if (res.error || !res.data) {
      toast.error('Order not found', {
        description: res.error || 'No order found with that number.',
      });
      return;
    }

    setTrackingResult(res.data as Record<string, unknown>);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Track Your Order</h1>
          <p className="text-muted-foreground">
            Enter your order number to check delivery status
          </p>
        </div>

        <form onSubmit={handleTrack} className="flex gap-4 mb-8">
          <Input
            placeholder="Enter order number (e.g., ORD-12345)"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={isTracking}>
            {isTracking ? 'Tracking...' : 'Track Order'}
          </Button>
        </form>

        {trackingResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    Order {(trackingResult.orderNumber || trackingResult.order_number) as string}
                  </CardTitle>
                  <Badge variant="default">
                    {(trackingResult.status as string) ?? 'Shipped'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Tracking Number</span>
                    <p className="font-medium">{(trackingResult.trackingNumber as string) || '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Carrier</span>
                    <p className="font-medium">{(trackingResult.carrier as string) || '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Estimated Delivery</span>
                    <p className="font-medium">{(trackingResult.estimatedDelivery as string) || '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status</span>
                    <p className="font-medium text-green-600">{(trackingResult.status as string) ?? 'In Transit'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="relative">
                  {TRACKING_STEPS.map((step, index) => {
                    const currentStep = (trackingResult.currentStep as number) || 0;
                    const isCompleted = index <= currentStep;
                    const isCurrent = index === currentStep;

                    return (
                      <div key={step.id} className="flex items-start mb-6 last:mb-0">
                        <div className="flex-shrink-0 w-10 h-10 relative">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isCompleted
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                          >
                            <step.icon className="w-5 h-5" />
                          </div>
                          {index < TRACKING_STEPS.length - 1 && (
                            <div
                              className={`absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-10 ${
                                index < currentStep ? 'bg-primary' : 'bg-muted'
                              }`}
                            />
                          )}
                        </div>
                        <div className="ml-4">
                          <p className={`font-medium ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {step.label}
                          </p>
                          {isCurrent && (
                            <p className="text-sm text-muted-foreground">
                              Your order is on the way!
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tracking History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {((trackingResult.timeline as Array<{ date: string; event: string; location?: string }>) || []).map((event, index) => (
                    <div key={index} className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{event.event}</p>
                        <p className="text-xs text-muted-foreground">{event.date}</p>
                        {event.location && (
                          <p className="text-xs text-muted-foreground">{event.location}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-900/10">
              <CardContent className="pt-6 flex items-start gap-4">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900 dark:text-yellow-200">
                    Need help with your order?
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    If you have any issues with your delivery, please{' '}
                    <a href="/contact" className="underline">contact our support team</a>.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {!trackingResult && (
          <div className="text-center py-12 text-muted-foreground">
            <Truck className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>Enter your order number above to track your package.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16">Loading...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
