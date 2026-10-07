"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, MapPin, Edit, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';

const EMPTY_FORM = {
  type: 'Home',
  fullName: '',
  phone: '',
  address: '',
  apartment: '',
  city: '',
  state: '',
  zipCode: '',
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const loadAddresses = async () => {
    const res = await apiClient.getAddresses();
    if (res.data) {
      setAddresses(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newAddress = {
      id: editingId || `addr-${Date.now()}`,
      type: formData.type,
      fullName: formData.fullName,
      phone: formData.phone,
      address: formData.address,
      apartment: formData.apartment,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      country: 'United States',
      isDefault: addresses.length === 0,
    };

    if (editingId) {
      setAddresses(addresses.map(addr => addr.id === editingId ? newAddress : addr));
    } else {
      setAddresses([...addresses, newAddress]);
    }

    toast.success(editingId ? 'Address updated' : 'Address added');
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (addresses.length === 1) {
      toast.error('You must have at least one address');
      return;
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    setAddresses(addresses.filter(addr => addr.id !== id));
    toast.success('Address deleted');
  };

  const handleSetDefault = (id: string) => {
    setAddresses(
      addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
    toast.success('Set as default address');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Loading addresses...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold">
          Saved Addresses
        </motion.h1>

        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Address
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Address' : 'Add New Address'}</DialogTitle>
              <DialogDescription>Enter the complete delivery address</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Address Type</Label>
                  <select
                    className="w-full h-10 px-3 border rounded-md"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <Label>Full Name *</Label>
                  <Input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
                </div>
              </div>
              <div>
                <Label>Phone *</Label>
                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
              </div>
              <div>
                <Label>Street Address *</Label>
                <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required />
              </div>
              <div>
                <Label>Apartment, Suite, etc.</Label>
                <Input value={formData.apartment} onChange={(e) => setFormData({ ...formData, apartment: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>City *</Label>
                  <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} required />
                </div>
                <div>
                  <Label>State *</Label>
                  <Input value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} required />
                </div>
                <div>
                  <Label>ZIP *</Label>
                  <Input value={formData.zipCode} onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })} required />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full">
                  {editingId ? 'Update Address' : 'Save Address'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {addresses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MapPin className="w-12 h-12 mx-auto mb-4" />
            <p>No addresses saved yet.</p>
          </div>
        ) : (
          addresses.map((address, index) => (
            <motion.div
              key={address.id as string}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={address.isDefault ? 'border-primary' : ''}>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{address.fullName as string}</span>
                          <span className="text-sm text-muted-foreground">({address.type as string})</span>
                          {!!address.isDefault && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Default</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {address.address as string}
                          {address.apartment ? `, ${address.apartment as string}` : ''}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {address.city as string}, {address.state as string} {address.zipCode as string}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">{address.phone as string}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      {!address.isDefault && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleSetDefault(address.id as string)}>
                            <Check className="w-4 h-4 mr-2" />
                            Set Default
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(address.id as string)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
