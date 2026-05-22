'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Compass, ShieldAlert, Key, Mail, Building, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { users, setCurrentUser, currentAgency } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate network latency
    setTimeout(() => {
      const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (foundUser) {
        setCurrentUser(foundUser);
        router.push('/dashboard');
      } else {
        setError('Invalid credentials or tenant registration not found.');
        setLoading(false);
      }
    }, 800);
  };

  const handleQuickFill = (roleName: string) => {
    const found = users.find(u => u.role === roleName);
    if (found) {
      setEmail(found.email);
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-indigo-900/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] rounded-full bg-teal-900/10 blur-[120px]" />

      <div className="w-full max-w-md bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 p-8 rounded-2xl shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-indigo-600/30">
            <Compass className="w-6 h-6 text-white animate-spin-slow" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-200 to-indigo-400 bg-clip-text text-transparent">
            AeroERP Enterprise
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Multi-Tenant Travel Agency Operations Manager</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-800/40 text-red-200 text-xs flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@agency.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-zinc-800/60 border border-zinc-700/50 focus:border-indigo-500 focus:outline-none text-sm transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Password
              </label>
              <Link 
                href="/auth/forgot-password" 
                className="text-[10px] text-indigo-400 hover:underline"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Key className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-zinc-800/60 border border-zinc-700/50 focus:border-indigo-500 focus:outline-none text-sm transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-xs tracking-wider uppercase transition-colors shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Sign In Securely</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Quick Access Roles Section */}
        <div className="mt-8 pt-6 border-t border-zinc-800/80">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2.5 text-center">
            Demo Personas (Skip Entry)
          </span>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <button
              onClick={() => handleQuickFill('Agency Admin')}
              className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/30 text-left transition-colors flex flex-col"
            >
              <span className="font-semibold text-zinc-200">Agency Admin</span>
              <span className="text-[9px] text-zinc-400 truncate">admin@apex.com</span>
            </button>
            <button
              onClick={() => handleQuickFill('Sales Agent')}
              className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/30 text-left transition-colors flex flex-col"
            >
              <span className="font-semibold text-zinc-200">Sales Agent</span>
              <span className="text-[9px] text-zinc-400 truncate">jane@apex.com</span>
            </button>
            <button
              onClick={() => handleQuickFill('Operations')}
              className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/30 text-left transition-colors flex flex-col"
            >
              <span className="font-semibold text-zinc-200">Operations</span>
              <span className="text-[9px] text-zinc-400 truncate">ops@apex.com</span>
            </button>
            <button
              onClick={() => handleQuickFill('Finance')}
              className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/30 text-left transition-colors flex flex-col"
            >
              <span className="font-semibold text-zinc-200">Finance</span>
              <span className="text-[9px] text-zinc-400 truncate">finance@apex.com</span>
            </button>
          </div>
          
          <div className="mt-4 pt-3.5 border-t border-zinc-800/60 flex justify-between gap-2.5">
            <Link 
              href="/portal/customer" 
              className="flex-1 py-2 rounded bg-indigo-950/20 hover:bg-indigo-900/10 border border-indigo-900/30 text-center text-indigo-300 hover:text-indigo-200 transition-colors font-semibold text-[10px]"
            >
              Customer Portal
            </Link>
            <Link 
              href="/portal/vendor" 
              className="flex-1 py-2 rounded bg-amber-950/20 hover:bg-amber-900/10 border border-amber-900/30 text-center text-amber-300 hover:text-amber-200 transition-colors font-semibold text-[10px]"
            >
              Vendor Portal
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-400 mt-6">
          Don't have an agency tenant?{' '}
          <Link href="/auth/register" className="text-indigo-400 hover:underline font-medium">
            Register Agency
          </Link>
        </p>
      </div>
    </div>
  );
}
