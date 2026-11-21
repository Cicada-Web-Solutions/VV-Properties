'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useVVStore } from '@/context/VVStoreContext';

export function ToastContainer() {
  const { toasts, dismissToast } = useVVStore();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-20 right-4 z-[95] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2.5 sm:right-6"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const icon =
          toast.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#2F7D57]" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="h-4 w-4 shrink-0 text-[#D6866B]" />
          ) : (
            <Info className="h-4 w-4 shrink-0 text-[#CE8936]" />
          );

        return (
          <div
            key={toast.id}
            className="flex items-start gap-3 rounded-md border border-[#DBCCC6] bg-white p-3.5 shadow-[0_12px_32px_rgba(73,31,64,0.14)]"
            role="status"
          >
            <div className="mt-0.5">{icon}</div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[#491F40]">
                {toast.title}
              </p>
              {toast.description && (
                <p className="mt-0.5 text-xs text-[#491F40]/70">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="rounded p-1 text-[#491F40]/45 hover:bg-[#DBCCC6]/35 hover:text-[#491F40]"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
