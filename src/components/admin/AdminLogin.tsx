'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  ShieldAlert,
} from 'lucide-react';
import { BrandLogo } from '@/components/layout/BrandLogo';
import {
  authenticateDemoAdmin,
  DEMO_ADMIN_CREDENTIALS,
} from '@/lib/auth';
import type { AdminSession } from '@/types';

interface AdminLoginProps {
  onSuccess: (session: AdminSession) => void;
}

export function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = authenticateDemoAdmin(email, password);
    if (!res.success) {
      setError(res.error);
      return;
    }
    setError(null);
    onSuccess(res.session);
  };

  const fillDemo = () => {
    setEmail(DEMO_ADMIN_CREDENTIALS.email);
    setPassword(DEMO_ADMIN_CREDENTIALS.password);
    setError(null);
  };

  return (
    <div className="flex min-h-screen flex-col justify-between bg-[#CDE6F5]/25 px-4 py-8 sm:px-6">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
        <Link href="/">
          <BrandLogo />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0D0221]/75 transition-colors hover:text-[#4062BB]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Public Website</span>
        </Link>
      </div>

      <div className="mx-auto my-10 w-full max-w-md rounded-2xl border border-[#0D0221]/10 bg-white p-7 shadow-xl sm:p-9">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0D0221] text-white">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-[#4062BB] uppercase">
              Portfolio Management
            </p>
            <h1 className="font-display text-3xl font-medium text-[#0D0221]">
              Admin Sign In
            </h1>
          </div>
        </div>

        {/* Security & Frontend Prototype Disclaimer */}
        <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-[#4062BB]/25 bg-[#CDE6F5]/35 p-3.5 text-xs leading-relaxed text-[#0D0221]/80">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#4062BB]" />
          <div>
            <p className="font-semibold text-[#0D0221]">
              Frontend-Only Demo Authentication
            </p>
            <p className="mt-0.5">
              Credentials and session state are isolated in{' '}
              <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px]">
                src/lib/auth.ts
              </code>{' '}
              using localStorage. Replace with server-side auth before
              production.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="admin-email"
              className="block text-xs font-semibold tracking-wider text-[#0D0221] uppercase"
            >
              Email Address
            </label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={DEMO_ADMIN_CREDENTIALS.email}
              className="mt-2 w-full rounded-lg border border-[#0D0221]/15 bg-white px-4 py-3 text-sm text-[#0D0221] placeholder:text-[#0D0221]/35 focus:border-[#4062BB] focus:outline-none focus:ring-2 focus:ring-[#4062BB]/25"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-semibold tracking-wider text-[#0D0221] uppercase"
            >
              Password
            </label>
            <div className="relative mt-2">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-lg border border-[#0D0221]/15 bg-white py-3 pr-11 pl-4 text-sm text-[#0D0221] placeholder:text-[#0D0221]/35 focus:border-[#4062BB] focus:outline-none focus:ring-2 focus:ring-[#4062BB]/25"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 text-[#0D0221]/50 hover:bg-[#CDE6F5]/40 hover:text-[#0D0221]"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-[#F06543]/35 bg-[#F06543]/10 px-3.5 py-2.5 text-xs text-[#b83718]"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#F06543]" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-[#4062BB] py-3 text-sm font-medium text-white transition-colors hover:bg-[#0D0221]"
          >
            Sign In to Dashboard
          </button>
        </form>

        {/* Demo Credentials Box */}
        <div className="mt-6 rounded-xl border border-[#0D0221]/10 bg-[#CDE6F5]/20 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D0221]">
              <KeyRound className="h-3.5 w-3.5 text-[#4062BB]" />
              <span>Demo Credentials</span>
            </span>
            <button
              type="button"
              onClick={fillDemo}
              className="text-xs font-semibold text-[#4062BB] hover:underline"
            >
              Fill Demo Credentials
            </button>
          </div>
          <div className="mt-2 space-y-1 font-mono text-xs text-[#0D0221]/80">
            <p>Email: {DEMO_ADMIN_CREDENTIALS.email}</p>
            <p>Pass: {DEMO_ADMIN_CREDENTIALS.password}</p>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-[#0D0221]/55">
        VV Properties · Frontend Prototype Administration Console
      </p>
    </div>
  );
}
