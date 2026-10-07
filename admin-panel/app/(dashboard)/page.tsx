"use client";

import { useEffect, useState } from 'react';
import { Package, ShoppingBag, Users, LayoutDashboard, Search, Bell, Settings, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    recentOrders: [] as any[],
  });

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const [ordersRes, productsRes, summaryRes] = await Promise.all([
          apiClient.getOrders(),
          apiClient.getProducts(),
          apiClient.getAnalyticsSummary()
        ]);
        
        setStats({
          totalOrders: ordersRes.total || (ordersRes.data?.length || 0),
          totalProducts: productsRes.total || (productsRes.data?.length || 0),
          totalRevenue: summaryRes.data?.yearlyRevenue || 0,
          recentOrders: (ordersRes.data || []).slice(0, 5)
        });
      } catch (err) {
        console.error("Failed to load admin stats", err);
      }
    }
    fetchDashboard();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Overview</h1>
        <button onClick={() => window.print()} className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm shadow hover:bg-primary/90 transition-colors print:hidden">
          Download Report
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-gray-200/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalOrders}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-gray-200/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalProducts}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-gray-200/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-gray-200/60">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentOrders.length === 0 ? (
            <p className="text-gray-500">No recent orders found.</p>
          ) : (
            <div className="space-y-4">
              {stats.recentOrders.map((order, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">Order #{order.orderNumber || order.id?.substring(0, 8)}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{new Date(order.created_at || order.placedAt || new Date()).toLocaleDateString()}</p>
                  </div>
                  <div className="font-bold text-gray-900">${order.total_amount?.toFixed(2) || order.totalAmount?.toFixed(2) || '0.00'}</div>
                  <div className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {order.status || 'Pending'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
