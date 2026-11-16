'use client';

import React from 'react';
import { Download, Shield } from 'lucide-react';
import { triggerTextDownload } from '@/lib/adminUtils';
import type { ActivityLogEntry } from '@/types';

interface ActivityLogsTabProps {
  logs: ActivityLogEntry[];
  onExportedJson: () => void;
}

export function ActivityLogsTab({
  logs,
  onExportedJson,
}: ActivityLogsTabProps) {
  const handleDownloadJson = () => {
    triggerTextDownload(
      'activity_logs.json',
      JSON.stringify(logs, null, 2),
      'application/json'
    );
    onExportedJson();
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 pb-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-sans text-2xl font-extrabold tracking-tight text-[#0D0221] lg:text-3xl">
            Activity Audit Logs
          </h1>
          <p className="mt-0.5 text-xs font-medium text-slate-500 lg:text-sm">
            Chronological system audit trail with automatic 14-day pruning &amp;
            JSON export.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadJson}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-[#0D0221] shadow-sm transition-all hover:bg-slate-50"
          >
            <Download className="h-4 w-4 text-[#0F52BA]" />
            <span>Download activity_logs.json</span>
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 p-4 text-xs">
          <span className="font-bold text-[#0D0221]">
            System Activity Records
          </span>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Shield className="h-3.5 w-3.5 text-[#10B981]" />
            <span>Logs older than 14 days automatically pruned</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-bold tracking-wider text-slate-400 uppercase">
              <tr>
                <th className="px-6 py-3.5">Admin User</th>
                <th className="px-6 py-3.5">Action Summary</th>
                <th className="px-6 py-3.5">Module</th>
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-6 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center font-medium text-slate-400"
                  >
                    No activity logs recorded within the past 14 days.
                  </td>
                </tr>
              ) : (
                logs.map((entry) => (
                  <tr
                    key={entry.id}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className="px-6 py-3.5 font-bold text-[#0D0221]">
                      {entry.username}
                    </td>
                    <td className="px-6 py-3.5 font-medium text-slate-700">
                      {entry.action}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        {entry.module}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-medium whitespace-nowrap text-slate-400">
                      {entry.dateStr}
                    </td>
                    <td className="px-6 py-3.5 text-right text-xs font-bold text-[#10B981]">
                      &bull; {entry.status}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
