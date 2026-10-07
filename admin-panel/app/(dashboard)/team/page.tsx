"use client";

import { useEffect, useState } from 'react';
import { Package, ShoppingBag, Users, LayoutDashboard, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api';

export default function TeamPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [invite, setInvite] = useState({ email: '', role: 'MANAGER' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchStaff() {
      try {
        const res = await apiClient.getStaff();
        setStaff(res.data || []);
      } catch (err) {
        console.error("Failed to load staff", err);
      }
    }
    fetchStaff();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.inviteStaff(invite.email, invite.role);
      if (res.data) {
        setMessage(res.data.message);
        setInvite({ email: '', role: 'MANAGER' });
      } else {
        setMessage(res.error || 'Failed to invite');
      }
    } catch (err) {
      setMessage("Error inviting user");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="shadow-sm border-gray-200/60">
        <CardHeader>
          <CardTitle>Invite Staff Member</CardTitle>
        </CardHeader>
        <CardContent>
          {message && <div className={`mb-4 p-3 rounded-md text-sm font-medium ${message.includes('Error') || message.includes('Failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{message}</div>}
          <form onSubmit={handleInvite} className="flex flex-col md:flex-row gap-4 md:items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1.5 text-gray-700">Email Address</label>
              <input required type="email" value={invite.email} onChange={e => setInvite({...invite, email: e.target.value})} className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="staff@example.com" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1.5 text-gray-700">Role</label>
              <select value={invite.role} onChange={e => setInvite({...invite, role: e.target.value})} className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white">
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>
            <button type="submit" className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium shadow hover:opacity-90 transition-opacity">
              Send Invite
            </button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-gray-200/60">
        <CardHeader>
          <CardTitle>Current Staff</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {staff.length === 0 ? <p className="text-gray-500 py-4 text-center">No staff found.</p> : staff.map((member, i) => (
              <div key={i} className="flex justify-between items-center border border-gray-100 bg-gray-50/50 p-4 rounded-lg">
                <div>
                  <p className="font-bold text-gray-900">{member.firstName} {member.lastName}</p>
                  <p className="text-sm text-gray-600 mt-1">{member.email}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                  member.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' :
                  member.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {member.role}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
