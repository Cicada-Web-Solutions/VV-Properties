'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff, Lock, LogIn, User } from 'lucide-react';
import { IdbImage } from '@/components/ui/IdbImage';

interface AdminLoginScreenProps {
  onLogin: (
    username: string,
    password: string
  ) => { success: boolean; error?: string };
}

export function AdminLoginScreen({ onLogin }: AdminLoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const result = onLogin(username, password);
    if (!result.success) {
      setErrorMessage(
        result.error || 'Invalid username or password. Please try again.'
      );
    }
  };

  return (
    <div
      id="loginScreen"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black p-4 font-sans"
    >
      <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-8 shadow-2xl">
        {/* Brand Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center">
            <IdbImage
              src="/assets/branding/admin-logo.png"
              alt="V.V Properties Logo"
              className="h-full w-full object-contain"
              fallbackSrc="/assets/branding/logo.jpg"
            />
          </div>
          <h1 className="font-sans text-xl leading-tight font-extrabold tracking-wider text-slate-900">
            V.V PROPERTIES
          </h1>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Executive Administration Portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600"
            >
              {errorMessage}
            </div>
          )}

          <div>
            <label
              htmlFor="loginUsername"
              className="mb-1 block text-xs font-bold text-slate-800"
            >
              Username
            </label>
            <div className="relative">
              <User className="absolute top-3 left-3.5 h-4 w-4 text-slate-400" />
              <input
                id="loginUsername"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="off"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-xs font-semibold text-slate-900 placeholder-slate-400 transition-all outline-none focus:border-[#0F52BA] focus:ring-2 focus:ring-[#0F52BA]/20"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="loginPassword"
              className="mb-1 block text-xs font-bold text-slate-800"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute top-3 left-3.5 h-4 w-4 text-slate-400" />
              <input
                id="loginPassword"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="new-password"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-10 pl-10 text-xs font-semibold text-slate-900 placeholder-slate-400 transition-all outline-none focus:border-[#0F52BA] focus:ring-2 focus:ring-[#0F52BA]/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute top-2.5 right-3 p-0.5 text-slate-400 transition-colors hover:text-slate-700"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0F52BA] py-3.5 text-xs font-bold text-white shadow-lg shadow-[#0F52BA]/25 transition-all hover:bg-[#0A3F91] active:scale-[0.98]"
          >
            <LogIn className="h-4 w-4" />
            <span>Sign In to Portal</span>
          </button>
        </form>
      </div>

      <Link
        href="/"
        className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Return to Public Website</span>
      </Link>
    </div>
  );
}
