"use client";

import { useEffect, useState } from 'react';
import { Package, ShoppingBag, Users, LayoutDashboard, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await apiClient.getOrders();
        setOrders(res.data || []);
      } catch (err) {
        console.error("Failed to load orders", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderNumber: string, newStatus: string) => {
    try {
      // Optimistic update
      setOrders(orders.map(o => o.id === orderNumber ? { ...o, status: newStatus } : o));
      const res = await apiClient.updateOrderStatus(orderNumber, newStatus.toUpperCase());
      if (res.error) {
        // Revert on error
        const origOrders = await apiClient.getOrders();
        setOrders(origOrders.data || []);
        alert(res.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <Card className="shadow-sm border-gray-200/60">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-gray-500 py-4">Loading orders...</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3 font-medium text-gray-500">Order Number</th>
                    <th className="pb-3 font-medium text-gray-500">Date</th>
                    <th className="pb-3 font-medium text-gray-500">Total</th>
                    <th className="pb-3 font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan={4} className="py-8 text-center text-gray-500">No orders found.</td></tr>
                  ) : (
                    orders.map((order, i) => (
                      <tr key={i} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 font-semibold text-gray-900">{order.id}</td>
                        <td className="py-4 text-gray-600">{order.date}</td>
                        <td className="py-4 font-medium text-gray-900">${order.total?.toFixed(2)}</td>
                        <td className="py-4">
                          <select 
                            value={order.status} 
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="border border-gray-300 rounded-md p-1.5 text-sm bg-white shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
