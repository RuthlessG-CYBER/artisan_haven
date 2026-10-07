"use client";

import { useEffect, useState } from 'react';
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
import { apiClient } from '@/lib/api';

const STATUS_STYLES: Record<string, { label: string; background: string; textColor: string }> = {
  pending: { label: 'Pending', background: 'bg-yellow-500', textColor: 'text-white' },
  processing: { label: 'Processing', background: 'bg-blue-500', textColor: 'text-white' },
  shipped: { label: 'Shipped', background: 'bg-purple-500', textColor: 'text-white' },
  delivered: { label: 'Delivered', background: 'bg-green-500', textColor: 'text-white' },
  cancelled: { label: 'Cancelled', background: 'bg-red-500', textColor: 'text-white' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    let isMounted = true;
    const fetchOrders = async () => {
      const res = await apiClient.getOrders();
      if (isMounted) {
        setOrders(res.data || []);
        setLoading(false);
      }
    };
    fetchOrders();
    return () => { isMounted = false; };
  }, []);

  const filteredOrders = orders.filter((order) => {
    const orderNumber = (order.orderNumber || order.id || '') as string;
    const orderStatus = ((order.status || '') as string).toLowerCase();
    const matchesSearch = orderNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-8"
      >
        Order History
      </motion.h1>

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
          {filteredOrders.map((order, index) => {
            const orderNumber = (order.orderNumber || order.id) as string;
            const orderStatus = ((order.status || '') as string).toLowerCase();
            const style = STATUS_STYLES[orderStatus] || STATUS_STYLES.pending;
            const items = (order.items || []) as Array<{ name: string; qty?: number; quantity?: number; price: number }>;
            const total = (order.totalAmount || order.total) as number;

            return (
              <motion.div
                key={orderNumber}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-lg">{orderNumber}</CardTitle>
                          <Badge className={style.background}>{style.label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {order.placedAt ? new Date(order.placedAt as string).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/track-order?order=${orderNumber}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            Track
                          </Link>
                        </Button>
                        {orderStatus === 'delivered' && (
                          <Button variant="outline" size="sm">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reorder
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {items.map((item: any, i: number) => {
                        const qty = item.qty || item.quantity || 1;
                        return (
                          <div key={i} className="flex justify-between text-sm">
                            <span>{item.name} x{qty}</span>
                            <span className="text-muted-foreground">${item.price.toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                    <Separator className="my-3" />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${(typeof total === 'number' ? total : 0).toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
