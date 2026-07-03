"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Package, Eye, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const SAMPLE_ORDERS = [
  {
    id: 'ORD-12345',
    date: 'January 15, 2024',
    status: 'delivered',
    total: 125.99,
    items: [
      { name: 'Recycled Glass Vase', qty: 1, price: 45.00 },
      { name: 'Organic Granola Mix', qty: 2, price: 25.98 },
      { name: 'Bamboo Wind Chime', qty: 1, price: 28.00 },
    ],
  },
  {
    id: 'ORD-12344',
    date: 'January 10, 2024',
    status: 'shipped',
    total: 89.50,
    items: [
      { name: 'Eco-Cotton Wall Art', qty: 1, price: 89.00 },
    ],
  },
  {
    id: 'ORD-12343',
    date: 'January 5, 2024',
    status: 'processing',
    total: 255.00,
    items: [
      { name: 'Classic Birthday Cake', qty: 1, price: 255.00 },
    ],
  },
  {
    id: 'ORD-12342',
    date: 'December 28, 2023',
    status: 'delivered',
    total: 62.97,
    items: [
      { name: 'Fresh Energy Bars', qty: 3, price: 56.97 },
      { name: 'Raw Trail Mix', qty: 1, price: 15.99 },
    ],
  },
];

const STATUS_STYLES = {
  pending: { label: 'Pending', background: 'bg-yellow-500', textColor: 'text-white' },
  processing: { label: 'Processing', background: 'bg-blue-500', textColor: 'text-white' },
  shipped: { label: 'Shipped', background: 'bg-purple-500', textColor: 'text-white' },
  delivered: { label: 'Delivered', background: 'bg-green-500', textColor: 'text-white' },
  cancelled: { label: 'Cancelled', background: 'bg-red-500', textColor: 'text-white' },
};

export default function OrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = SAMPLE_ORDERS.filter((order) => {
    const matchesSearch = order.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-8"
      >
        Order History
      </motion.h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">No orders found</h2>
          <p className="text-muted-foreground mb-6">
            {search || statusFilter !== 'all'
              ? 'Try adjusting your search or filter.'
              : "You haven't placed any orders yet."}
          </p>
          <Button asChild>
            <Link href="/shop">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg">{order.id}</CardTitle>
                        <Badge className={STATUS_STYLES[order.status as keyof typeof STATUS_STYLES].background}>
                          {STATUS_STYLES[order.status as keyof typeof STATUS_STYLES].label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{order.date}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/track-order?order=${order.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          Track
                        </Link>
                      </Button>
                      {order.status === 'delivered' && (
                        <Button variant="outline" size="sm">
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reorder
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Items List */}
                  <div className="space-y-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span>{item.name} x{item.qty}</span>
                        <span className="text-muted-foreground">${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-3" />

                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
