"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ShoppingBag,
  Heart,
  User,
  MapPin,
  Package,
  Settings,
  Clock,
  Check,
  Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWishlist } from '@/hooks/use-wishlist';
import { useCart } from '@/hooks/use-cart';
import { ProductGrid } from '@/components/products';

const SIDEBAR_ITEMS = [
  { icon: Package, label: 'Dashboard', href: '/dashboard' },
  { icon: ShoppingBag, label: 'Orders', href: '/dashboard/orders' },
  { icon: Heart, label: 'Wishlist', href: '/dashboard/wishlist' },
  { icon: User, label: 'Profile', href: '/dashboard/profile' },
  { icon: MapPin, label: 'Addresses', href: '/dashboard/addresses' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

const SAMPLE_ORDERS = [
  {
    id: 'ORD-12345',
    date: '2024-01-15',
    status: 'delivered',
    total: 125.99,
    items: 3,
  },
  {
    id: 'ORD-12344',
    date: '2024-01-10',
    status: 'shipped',
    total: 89.50,
    items: 2,
  },
  {
    id: 'ORD-12343',
    date: '2024-01-05',
    status: 'processing',
    total: 255.00,
    items: 1,
  },
];

const STATUS_BADGES = {
  pending: { label: 'Pending', color: 'bg-yellow-500' },
  processing: { label: 'Processing', color: 'bg-blue-500' },
  shipped: { label: 'Shipped', color: 'bg-purple-500' },
  delivered: { label: 'Delivered', color: 'bg-green-500' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500' },
};

export default function DashboardPage() {
  const { items: wishlistItems } = useWishlist();
  const { getItemCount } = useCart();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              {/* User Info */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Guest User</h3>
                  <p className="text-sm text-muted-foreground">Sign in for full access</p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {SIDEBAR_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Welcome */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
            <p className="text-muted-foreground">Manage your orders and account settings.</p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid sm:grid-cols-3 gap-4"
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{SAMPLE_ORDERS.length}</div>
                    <div className="text-sm text-muted-foreground">Total Orders</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">1</div>
                    <div className="text-sm text-muted-foreground">Delivered</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{wishlistItems.length}</div>
                    <div className="text-sm text-muted-foreground">Wishlist Items</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Orders</CardTitle>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/orders">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {SAMPLE_ORDERS.slice(0, 3).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium">{order.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`${STATUS_BADGES[order.status as keyof typeof STATUS_BADGES].color} text-white`}>
                          {STATUS_BADGES[order.status as keyof typeof STATUS_BADGES].label}
                        </Badge>
                        <p className="text-sm font-medium mt-1">${order.total.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid sm:grid-cols-2 gap-4"
          >
            <Card className="hover:border-primary transition-colors">
              <Link href="/track-order">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Truck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Track Your Order</h3>
                      <p className="text-sm text-muted-foreground">
                        Check delivery status
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:border-primary transition-colors">
              <Link href="/dashboard/addresses">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Manage Addresses</h3>
                      <p className="text-sm text-muted-foreground">
                        Add or edit delivery addresses
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
