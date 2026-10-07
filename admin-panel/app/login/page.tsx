"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { apiClient } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaVerified) {
      setError("Please verify you are human");
      return;
    }
    setError('');
    
    try {
      // Pass captcha token to backend (simulated here)
      const res = await apiClient.login(email, password);
      if (res.error) {
        setError(res.error);
      } else {
        // Success
        apiClient.setToken(res.data?.token);
        window.location.href = '/';
      }
    } catch (err) {
      setError("Login failed");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the panel</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && <div className="p-3 bg-red-100 text-red-700 rounded text-sm font-medium">{error}</div>}
            
            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded p-2" placeholder="admin@example.com" />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium">Password</label>
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border rounded p-2" placeholder="••••••••" />
            </div>

            {/* Simulated Captcha Widget */}
            <div className="border border-gray-300 bg-gray-50 p-4 rounded flex items-center justify-center gap-3">
              <input 
                type="checkbox" 
                id="captcha" 
                className="w-5 h-5 cursor-pointer"
                checked={captchaVerified}
                onChange={e => setCaptchaVerified(e.target.checked)}
              />
              <label htmlFor="captcha" className="font-medium cursor-pointer">I am human (Captcha)</label>
            </div>

            <button type="submit" className="w-full bg-primary text-primary-foreground py-2 rounded font-medium">
              Sign In
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
