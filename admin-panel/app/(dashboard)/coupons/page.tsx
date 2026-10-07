"use client";

import { useEffect, useState } from 'react';
import { Package, ShoppingBag, Users, LayoutDashboard, Search, Bell, Settings, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [newCoupon, setNewCoupon] = useState({ code: '', discountType: 'PERCENTAGE', discountValue: 25 });

  useEffect(() => {
    async function fetchCoupons() {
      try {
        const res = await apiClient.getCoupons();
        setCoupons(res.data || []);
      } catch (err) {
        console.error("Failed to load coupons", err);
      }
    }
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.createCoupon(newCoupon);
      if (res.data) {
        setCoupons([...coupons, res.data]);
        setNewCoupon({ code: '', discountType: 'PERCENTAGE', discountValue: 25 });
      }
    } catch (err) {
      console.error("Failed to create coupon", err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="shadow-sm border-gray-200/60">
        <CardHeader>
          <CardTitle>Create New Coupon</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateCoupon} className="flex flex-col md:flex-row gap-4 md:items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1.5 text-gray-700">Coupon Code</label>
              <input required type="text" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value})} className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="e.g. SUMMER25" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1.5 text-gray-700">Discount Type</label>
              <select value={newCoupon.discountType} onChange={e => setNewCoupon({...newCoupon, discountType: e.target.value})} className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white">
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount ($)</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1.5 text-gray-700">Discount Value</label>
              <input required type="number" value={newCoupon.discountValue} onChange={e => setNewCoupon({...newCoupon, discountValue: Number(e.target.value)})} className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="25" />
            </div>
            <button type="submit" className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium shadow hover:opacity-90 transition-opacity">
              Create Coupon
            </button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-gray-200/60">
        <CardHeader>
          <CardTitle>Active Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {coupons.length === 0 ? <p className="text-gray-500 py-4 text-center">No coupons created yet.</p> : coupons.map((c, i) => (
              <div key={i} className="flex justify-between items-center border border-gray-100 bg-gray-50/50 p-4 rounded-lg">
                <div>
                  <p className="font-bold text-gray-900 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-primary" /> {c.code}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF total order` : `$${c.discountValue} OFF total order`}</p>
                </div>
                <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                  Active
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
