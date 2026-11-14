import type { AdminSession } from '@/types';

/**
 * FRONTEND-ONLY DEMO AUTHENTICATION MODULE
 * ------------------------------------------------------------
 * SECURITY NOTICE:
 * This module intentionally implements client-only demo authentication
 * backed by browser localStorage for prototype preview purposes.
 * Do NOT treat this as production security.
 *
 * Future Backend Integration:
 * Replace loginAdmin(), logoutAdmin(), and getAdminSession() with calls
 * to your real authentication provider / HTTP-only session API.
 */

const SESSION_STORAGE_KEY = 'vv_admin_session_v1';

export const DEMO_ADMIN_CREDENTIALS = {
  email: 'admin@vvproperties.demo',
  password: 'VVProperties@2026',
  displayName: 'VV Portfolio Administrator (Demo)',
} as const;

export function authenticateDemoAdmin(
  email: string,
  password: string
): { success: true; session: AdminSession } | { success: false; error: string } {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password) {
    return { success: false, error: 'Please enter both email and password.' };
  }

  if (
    normalizedEmail === DEMO_ADMIN_CREDENTIALS.email.toLowerCase() &&
    password === DEMO_ADMIN_CREDENTIALS.password
  ) {
    const session: AdminSession = {
      email: DEMO_ADMIN_CREDENTIALS.email,
      name: DEMO_ADMIN_CREDENTIALS.displayName,
      loggedInAt: new Date().toISOString(),
    };
    try {
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Ignore storage quota errors for lightweight session object
    }
    return { success: true, session };
  }

  return {
    success: false,
    error: 'Invalid credentials. Use the demo credentials shown below to sign in.',
  };
}

export function getAdminSession(): AdminSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminSession;
    if (!parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function logoutDemoAdmin(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // No-op
  }
}
