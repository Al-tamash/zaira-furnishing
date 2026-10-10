'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Lock, Mail, User, Phone, Sparkles, Heart } from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';

export function AuthModal() {
  const { authModalOpen, setAuthModalOpen, refreshSession } = useStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to sign in');
        }
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, password, confirmPassword }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to register account');
        }
      }

      await refreshSession();
      setAuthModalOpen(false);
      // Reset form
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#FAF7F2] rounded-2xl sm:rounded-3xl border border-[#EDE8DE] shadow-2xl p-6 sm:p-8 overflow-hidden text-[#1C1917]">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            setAuthModalOpen(false);
            setError(null);
          }}
          className="absolute top-4 right-4 p-2 text-[#78716C] hover:text-[#1C1917] rounded-full hover:bg-black/5 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#9A7B56]/10 text-[#9A7B56] mb-3">
            <Heart className="w-6 h-6 stroke-[1.8]" />
          </div>
          <h2 className="font-serif text-[24px] sm:text-[26px] font-medium text-[#1C1917]">
            {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p className="text-[12.5px] sm:text-[13px] text-[#78716C] mt-1">
            {mode === 'login'
              ? 'Sign in to access your curated wishlist and synchronized cart.'
              : 'Register to save custom measurements, wishlists, and orders.'}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex rounded-xl bg-white p-1 border border-[#EAE4D8] mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2 text-[12px] font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-[#1C1714] text-white shadow-xs'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-2 text-[12px] font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-[#1C1714] text-white shadow-xs'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[12.5px] leading-relaxed">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1C1917] mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A29E]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rohini Sharma"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D8CFBF] bg-white text-[13px] text-[#1C1917] focus:outline-hidden focus:border-[#9A7B56]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1C1917] mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A29E]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@zairafurnishing.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D8CFBF] bg-white text-[13px] text-[#1C1917] focus:outline-hidden focus:border-[#9A7B56]"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1C1917] mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A29E]" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D8CFBF] bg-white text-[13px] text-[#1C1917] focus:outline-hidden focus:border-[#9A7B56]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1C1917] mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A29E]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D8CFBF] bg-white text-[13px] text-[#1C1917] focus:outline-hidden focus:border-[#9A7B56]"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1C1917] mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A29E]" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D8CFBF] bg-white text-[13px] text-[#1C1917] focus:outline-hidden focus:border-[#9A7B56]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-center text-[12px] uppercase tracking-widest font-semibold bg-[#1C1714] hover:bg-[#9A7B56] text-white transition-all shadow-xs cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In to Account' : 'Create Customer Account'}
          </button>
        </form>

        <div className="mt-5 text-center">
          <Link
            href="/account"
            onClick={() => setAuthModalOpen(false)}
            className="text-[12px] text-[#9A7B56] hover:text-[#9A7B56] underline font-medium"
          >
            Go to Full Account Portal &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
