'use client';

import React, { useRef, useState } from 'react';
import {
  Camera,
  Download,
  Eye,
  EyeOff,
  HardDriveDownload,
  Key,
  Loader2,
  RotateCcw,
  Upload,
  UserPlus,
  X,
} from 'lucide-react';
import { IdbImage } from '@/components/ui/IdbImage';
import { saveMediaFile } from '@/lib/idb';
import { cn } from '@/lib/utils';
import type { AdminProfile, AdminSession, TeamAccount } from '@/types';

interface AdminProfileTabProps {
  session: AdminSession;
  adminProfile: AdminProfile;
  teamAccounts: TeamAccount[];
  onSaveProfile: (patch: {
    displayName?: string;
    username?: string;
    password?: string;
    avatar?: string | null;
  }) => Promise<void>;
  onAddTeamAccount: (input: {
    name: string;
    username: string;
    password: string;
    role: string;
  }) => Promise<{ success: boolean; error?: string }>;
  onToggleAccountStatus: (id: string) => Promise<void>;
  onDeleteAccount: (account: TeamAccount) => void;
  onExportBackup: () => Promise<void>;
  onImportBackup: (rawJson: string) => Promise<void>;
  onRequestResetDemoData: () => void;
  onDisplayNamePreviewChange?: (val: string) => void;
}

export function AdminProfileTab({
  session,
  adminProfile,
  teamAccounts,
  onSaveProfile,
  onAddTeamAccount,
  onToggleAccountStatus,
  onDeleteAccount,
  onExportBackup,
  onImportBackup,
  onRequestResetDemoData,
  onDisplayNamePreviewChange,
}: AdminProfileTabProps) {
  const [displayName, setDisplayName] = useState(
    adminProfile.displayName || session.displayName
  );
  const [username, setUsername] = useState(
    adminProfile.username || session.username
  );
  const [passwordValue, setPasswordValue] = useState(adminProfile.password);
  const [showProfilePassword, setShowProfilePassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Change Password Modal
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confPw, setConfPw] = useState('');
  const [showCurPw, setShowCurPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfPw, setShowConfPw] = useState(false);
  const [pwError, setPwError] = useState('');

  // Create Account Modal
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [accName, setAccName] = useState('');
  const [accUsername, setAccUsername] = useState('');
  const [accPassword, setAccPassword] = useState('');
  const [accRole, setAccRole] = useState('Property Manager');
  const [accError, setAccError] = useState('');

  const [exportingBackup, setExportingBackup] = useState(false);
  const [importingBackup, setImportingBackup] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const importBackupInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (file?: File) => {
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const ref = await saveMediaFile(file);
      await onSaveProfile({ avatar: ref });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');

    const isDefaultUntouched =
      adminProfile.password === 'victorpaul' ||
      adminProfile.password === 'admin';
    const curValid =
      curPw === adminProfile.password ||
      (isDefaultUntouched &&
        (curPw === 'victorpaul' || curPw === 'admin' || curPw === 'victor'));

    if (!curValid) {
      setPwError('Current password does not match your active password.');
      return;
    }
    if (!newPw || newPw.length < 4) {
      setPwError('Please enter a new password of at least 4 characters.');
      return;
    }
    if (newPw !== confPw) {
      setPwError('New password and confirmation do not match.');
      return;
    }

    await onSaveProfile({ password: newPw });
    setPasswordValue(newPw);
    setCurPw('');
    setNewPw('');
    setConfPw('');
    setPwModalOpen(false);
  };

  const handleCreateAccount = async () => {
    setAccError('');
    const result = await onAddTeamAccount({
      name: accName,
      username: accUsername,
      password: accPassword,
      role: accRole,
    });
    if (!result.success) {
      setAccError(result.error || 'Could not create team account.');
      return;
    }
    setAccName('');
    setAccUsername('');
    setAccPassword('');
    setAccRole('Property Manager');
    setAccountModalOpen(false);
  };

  const handleBackupImportFile = async (file?: File) => {
    if (!file) return;
    setImportingBackup(true);
    try {
      const text = await file.text();
      await onImportBackup(text);
    } finally {
      setImportingBackup(false);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-sans text-2xl font-extrabold tracking-tight text-[#0D0221] lg:text-3xl">
          Admin Profile &amp; Settings
        </h1>
        <p className="mt-0.5 text-xs font-medium text-slate-500 lg:text-sm">
          Manage administrator profile, credentials, portable JSON backups, and
          staff account directory.
        </p>
      </div>

      {/* Profile Credentials Form */}
      <div className="max-w-4xl rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-3">
          {/* Profile Photo Box */}
          <div>
            <label className="mb-2 block text-xs font-bold tracking-wider text-slate-900 uppercase">
              Profile Photo
            </label>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              aria-label="Upload profile avatar"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                void handleAvatarUpload(file);
              }}
            />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="group relative flex aspect-square w-full max-w-[220px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 shadow-sm transition-all hover:border-[#0F52BA] hover:bg-[#0F52BA]/5"
            >
              {adminProfile.avatar ? (
                <IdbImage
                  src={adminProfile.avatar}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-4 text-center text-slate-400 group-hover:text-[#0F52BA]">
                  {uploadingAvatar ? (
                    <Loader2 className="mb-1 h-8 w-8 animate-spin" />
                  ) : (
                    <Camera className="mb-1 h-8 w-8 stroke-[1.8]" />
                  )}
                  <span className="mt-1 text-xs font-bold text-[#0D0221]">
                    Upload Photo
                  </span>
                  <span className="mt-0.5 text-[10px] text-slate-400">
                    JPG or PNG
                  </span>
                </div>
              )}
            </button>
          </div>

          {/* Credentials Stack */}
          <div className="space-y-4 md:col-span-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-900 uppercase">
                Display Name
              </label>
              <input
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  onDisplayNamePreviewChange?.(e.target.value);
                }}
                placeholder="Display name"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-[#0F52BA] focus:ring-2 focus:ring-[#0F52BA]/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-900 uppercase">
                Username / Email
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-[#0F52BA] focus:ring-2 focus:ring-[#0F52BA]/20"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-xs font-bold tracking-wider text-slate-900 uppercase">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setPwError('');
                    setPwModalOpen(true);
                  }}
                  className="flex cursor-pointer items-center gap-1 text-xs font-bold text-[#0F52BA] hover:underline"
                >
                  <Key className="h-3.5 w-3.5" />
                  <span>Change Password</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type={showProfilePassword ? 'text' : 'password'}
                  value={passwordValue}
                  onChange={(e) => setPasswordValue(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pr-11 pl-3.5 text-xs font-bold text-slate-900 outline-none focus:border-[#0F52BA] focus:ring-2 focus:ring-[#0F52BA]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowProfilePassword((prev) => !prev)}
                  title="Toggle password visibility"
                  aria-label="Toggle password visibility"
                  className="absolute top-2.5 right-3 cursor-pointer p-0.5 text-slate-400 transition-colors hover:text-[#0D0221] focus:outline-none"
                >
                  {showProfilePassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() =>
                  void onSaveProfile({
                    displayName,
                    username,
                    password: passwordValue,
                  })
                }
                className="cursor-pointer rounded-xl bg-[#0F52BA] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-[#0F52BA]/20 transition-all hover:bg-[#0A3F91]"
              >
                Save Profile Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 1-Click JSON Backup & Import Card */}
      <div className="max-w-4xl rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="flex items-center gap-2 font-sans text-sm font-bold text-[#0D0221]">
              <HardDriveDownload className="h-4 w-4 text-[#0F52BA]" />
              <span>1-Click JSON Backup &amp; Import</span>
            </h3>
            <p className="mt-0.5 text-xs font-medium text-slate-400">
              Download <code className="font-mono text-[#0D0221]">vv_properties_catalog.json</code> with all properties, uploaded IndexedDB images, banners, testimonials, enquiries, and logs for cross-machine portability.
            </p>
          </div>
        </div>

        <input
          ref={importBackupInputRef}
          type="file"
          accept="application/json,.json"
          aria-label="Import catalog JSON file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            void handleBackupImportFile(file);
          }}
        />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={exportingBackup}
            onClick={async () => {
              setExportingBackup(true);
              try {
                await onExportBackup();
              } finally {
                setExportingBackup(false);
              }
            }}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#0F52BA] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-[#0F52BA]/20 transition-all hover:bg-[#0A3F91] disabled:opacity-60"
          >
            {exportingBackup ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>Download vv_properties_catalog.json</span>
          </button>

          <button
            type="button"
            disabled={importingBackup}
            onClick={() => importBackupInputRef.current?.click()}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-[#0D0221] shadow-sm transition-all hover:bg-slate-50 disabled:opacity-60"
          >
            {importingBackup ? (
              <Loader2 className="h-4 w-4 animate-spin text-[#0F52BA]" />
            ) : (
              <Upload className="h-4 w-4 text-[#0F52BA]" />
            )}
            <span>Import Catalog JSON</span>
          </button>

          <button
            type="button"
            onClick={onRequestResetDemoData}
            className="ml-auto inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3.5 py-2.5 text-xs font-bold text-[#EF4444] transition-colors hover:bg-red-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Seeded Data</span>
          </button>
        </div>
      </div>

      {/* Admin & Team Accounts Directory */}
      <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-sans text-sm font-bold text-[#0D0221]">
              Admin &amp; Team Accounts
            </h3>
            <p className="text-xs font-medium text-slate-400">
              Authorized team credentials for Victor Paul, Saran, Vibhkar,
              Umeshwar, Sharmika, and Administrators.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setAccError('');
              setAccountModalOpen(true);
            }}
            className="inline-flex cursor-pointer items-center gap-1.5 self-start rounded-xl bg-[#0F52BA] px-4 py-2 text-xs font-bold text-white shadow-md shadow-[#0F52BA]/20 transition-all hover:bg-[#0A3F91]"
          >
            <UserPlus className="h-4 w-4" />
            <span>+ Add New Account</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-bold tracking-wider text-slate-400 uppercase">
              <tr>
                <th className="px-4 py-3">Display Name</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Role / Access</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {teamAccounts.map((acc) => {
                const isPrimary = acc.username.toLowerCase() === 'victor';
                const avatarSrc = isPrimary ? adminProfile.avatar || acc.photo : acc.photo;
                return (
                  <tr key={acc.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {avatarSrc ? (
                          <div className="h-7 w-7 overflow-hidden rounded-full border border-slate-200 shadow-xs">
                            <IdbImage
                              src={avatarSrc}
                              alt={acc.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#0F52BA]/20 bg-[#0F52BA]/10 text-xs font-bold text-[#0F52BA]">
                            {acc.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-bold text-[#0D0221]">
                          {isPrimary ? adminProfile.displayName : acc.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-500">
                      {acc.username}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border border-[#0F52BA]/20 bg-[#0F52BA]/10 px-2 py-0.5 text-[10px] font-bold text-[#0F52BA]">
                        {acc.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={isPrimary}
                        onClick={() => void onToggleAccountStatus(acc.id)}
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[10px] font-bold',
                          acc.status === 'Active'
                            ? 'bg-[#10B981]/10 text-[#10B981]'
                            : 'bg-red-50 text-red-600',
                          !isPrimary && 'cursor-pointer hover:opacity-80'
                        )}
                      >
                        {acc.status}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-400">
                      {acc.created}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isPrimary ? (
                        <span className="text-[10px] text-slate-400">
                          Primary
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onDeleteAccount(acc)}
                          className="cursor-pointer text-[11px] font-bold text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Team Account */}
      {accountModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="createAccountModalTitle"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0221]/60 p-4 backdrop-blur-sm"
          onClick={() => setAccountModalOpen(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2
                id="createAccountModalTitle"
                className="font-sans text-base font-bold text-[#0D0221]"
              >
                Create Team Account
              </h2>
              <button
                type="button"
                onClick={() => setAccountModalOpen(false)}
                aria-label="Close account modal"
                className="cursor-pointer rounded-lg p-1 text-slate-400 hover:text-[#0D0221]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3.5 p-6 text-xs">
              {accError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 font-semibold text-red-600">
                  {accError}
                </div>
              )}
              <div>
                <label className="mb-1 block font-medium text-slate-500">
                  Display Name
                </label>
                <input
                  value={accName}
                  onChange={(e) => setAccName(e.target.value)}
                  placeholder="Display name"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-[#0F52BA]/20"
                />
              </div>
              <div>
                <label className="mb-1 block font-medium text-slate-500">
                  Username
                </label>
                <input
                  value={accUsername}
                  onChange={(e) => setAccUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-[#0F52BA]/20"
                />
              </div>
              <div>
                <label className="mb-1 block font-medium text-slate-500">
                  Temporary Password
                </label>
                <input
                  type="password"
                  value={accPassword}
                  onChange={(e) => setAccPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-[#0F52BA]/20"
                />
              </div>
              <div>
                <label className="mb-1 block font-medium text-slate-500">
                  Assigned Role
                </label>
                <select
                  value={accRole}
                  onChange={(e) => setAccRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-[#0F52BA]/20"
                >
                  <option value="Property Manager">Property Manager</option>
                  <option value="Sales Executive">Sales Executive</option>
                  <option value="Marketing Lead">Marketing Lead</option>
                  <option value="Portfolio Director">Portfolio Director</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-white px-6 py-4">
              <button
                type="button"
                onClick={() => setAccountModalOpen(false)}
                className="cursor-pointer rounded-lg border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleCreateAccount()}
                className="cursor-pointer rounded-lg bg-[#0F52BA] px-5 py-1.5 text-xs font-bold text-white hover:bg-[#0A3F91]"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Change Password */}
      {pwModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="changePasswordModalTitle"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0221]/60 p-4 backdrop-blur-sm"
          onClick={() => setPwModalOpen(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2
                id="changePasswordModalTitle"
                className="font-sans text-base font-bold text-[#0D0221]"
              >
                Change Password
              </h2>
              <button
                type="button"
                onClick={() => setPwModalOpen(false)}
                aria-label="Close password modal"
                className="cursor-pointer rounded-lg p-1 text-slate-400 hover:text-[#0D0221]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => void handlePasswordChangeSubmit(e)}
              className="space-y-4 p-6 text-xs"
            >
              {pwError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 font-semibold text-red-600">
                  {pwError}
                </div>
              )}

              <div>
                <label className="mb-1 block font-medium text-slate-500">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurPw ? 'text' : 'password'}
                    required
                    value={curPw}
                    onChange={(e) => setCurPw(e.target.value)}
                    placeholder="Current password"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pr-10 pl-3.5 font-medium text-slate-900 outline-none focus:ring-2 focus:ring-[#0F52BA]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurPw((prev) => !prev)}
                    className="absolute top-2.5 right-3 p-0.5 text-slate-400 hover:text-[#0D0221]"
                  >
                    {showCurPw ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-500">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    required
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    placeholder="New password"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pr-10 pl-3.5 font-medium text-slate-900 outline-none focus:ring-2 focus:ring-[#0F52BA]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw((prev) => !prev)}
                    className="absolute top-2.5 right-3 p-0.5 text-slate-400 hover:text-[#0D0221]"
                  >
                    {showNewPw ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-500">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfPw ? 'text' : 'password'}
                    required
                    value={confPw}
                    onChange={(e) => setConfPw(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pr-10 pl-3.5 font-medium text-slate-900 outline-none focus:ring-2 focus:ring-[#0F52BA]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfPw((prev) => !prev)}
                    className="absolute top-2.5 right-3 p-0.5 text-slate-400 hover:text-[#0D0221]"
                  >
                    {showConfPw ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setPwModalOpen(false)}
                  className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cursor-pointer rounded-xl bg-[#0F52BA] px-5 py-2 text-xs font-bold text-white shadow-md shadow-[#0F52BA]/25 hover:bg-[#0A3F91]"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
