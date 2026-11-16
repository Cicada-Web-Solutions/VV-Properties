'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Property } from '@/types';

interface RenamePropertyModalProps {
  property: Property | null;
  onClose: () => void;
  onSaveRename: (id: string, nextTitle: string) => Promise<void>;
}

export function RenamePropertyModal({
  property,
  onClose,
  onSaveRename,
}: RenamePropertyModalProps) {
  const [title, setTitle] = useState(property?.title ?? '');

  if (!property) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onSaveRename(property.id, title.trim());
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="renameModalTitle"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0221]/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3
            id="renameModalTitle"
            className="font-sans text-sm font-bold text-[#0D0221]"
          >
            Rename Property
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close rename modal"
            className="cursor-pointer rounded-lg p-1 text-slate-400 hover:text-[#0D0221]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)}>
          <div className="p-5 text-xs">
            <label
              htmlFor="renamePropInput"
              className="mb-1.5 block font-medium text-slate-500"
            >
              New Property Title
            </label>
            <input
              id="renamePropInput"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-[#0F52BA]/20"
            />
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-white px-5 py-3.5">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cursor-pointer rounded-lg bg-[#0F52BA] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#0A3F91]"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
