'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Compass, Mail, User, Building, ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter as useNextRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useNextRouter();
  const { registerAgency } = useStore();
  
  const [agencyName, setAgencyName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [adminName, setAdminName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check subdomain format
    const subdomainRegex = /^[a-zA-Z0-9-]+$/;
    if (!subdomainRegex.test(subdomain)) {
      setError('Subdomain must contain only letters, numbers, and hyphens.');
      setLoading(false);
      return;
    }

    setTimeout(() => {
      try {
        registerAgency(agencyName, subdomain, adminName, email);
        // Redirect to OTP verification page, passing email as query parameter
        router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}&agency=${encodeURIComponent(agencyName)}`);
      } catch {
        setError('Subdomain is already registered. Please choose another.');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-indigo-900/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[60%] rounded-full bg-teal-900/10 blur-[120px]" />

      <div className="w-full max-w-md bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 p-8 rounded-2xl shadow-2xl relative z-10">
        <div className="mb-6 flex items-center space-x-2">
          <Link href="/auth/login" className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="text-xs text-zinc-400 font-medium">Back to Sign In</span>
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-indigo-600/30">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-200 to-indigo-400 bg-clip-text text-transparent">
            Provision New Agency
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Spin up an isolated database, domain & staff workspace</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-800/40 text-red-200 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Agency Name
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  placeholder="Apex Travels"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-800/60 border border-zinc-700/50 focus:border-indigo-500 focus:outline-none text-xs transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Subdomain
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value)}
                  placeholder="apex"
                  className="w-full pl-3 pr-12 py-2 rounded-lg bg-zinc-800/60 border border-zinc-700/50 focus:border-indigo-500 focus:outline-none text-xs transition-colors text-right"
                />
                <span className="absolute right-3 top-2.5 text-[9px] text-zinc-500 font-bold">.aero</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Administrator Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="Alara Vane"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-800/60 border border-zinc-700/50 focus:border-indigo-500 focus:outline-none text-xs transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@myagency.com"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-800/60 border border-zinc-700/50 focus:border-indigo-500 focus:outline-none text-xs transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Security Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-lg bg-zinc-800/60 border border-zinc-700/50 focus:border-indigo-500 focus:outline-none text-xs transition-colors"
            />
          </div>

          <div className="flex items-center space-x-2 p-3 bg-indigo-950/20 border border-indigo-900/30 rounded-lg text-[10px] text-indigo-300">
            <ShieldCheck className="w-4 h-4 shrink-0 text-indigo-400" />
            <span>Enforces Supabase PostgreSQL Row Level Security (RLS) tenant isolation automatically.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-xs tracking-wider uppercase transition-colors shadow-lg shadow-indigo-600/20 flex items-center justify-center"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              'Create Agency Workspace'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
