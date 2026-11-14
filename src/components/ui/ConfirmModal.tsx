'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[#0D0221]/55 px-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="w-full max-w-md rounded-xl border border-[#0D0221]/10 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={
                variant === 'danger'
                  ? 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F06543]/12 text-[#F06543]'
                  : 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#CDE6F5]/60 text-[#4062BB]'
              }
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3
              id="confirm-modal-title"
              className="font-display text-2xl font-medium text-[#0D0221]"
            >
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1.5 text-[#0D0221]/50 transition-colors hover:bg-[#CDE6F5]/40 hover:text-[#0D0221]"
            aria-label="Close confirmation dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-[#0D0221]/75">
          {description}
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[#0D0221]/20 bg-white px-4 py-2 text-sm font-medium text-[#0D0221] transition-colors hover:bg-[#CDE6F5]/30"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={
              variant === 'danger'
                ? 'rounded-lg bg-[#F06543] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#d85332]'
                : 'rounded-lg bg-[#4062BB] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3251a4]'
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
