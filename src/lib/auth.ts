import type { AdminProfile, AdminSession, TeamAccount } from '@/types';

/**
 * FRONTEND-ONLY MULTI-ACCOUNT SESSION AUTHENTICATION MODULE
 * ------------------------------------------------------------
 * Stores lightweight session metadata in localStorage for the
 * Executive Admin Suite prototype with zero backend dependency.
 */

const SESSION_STORAGE_KEY = 'vv_admin_session_v1';

export function authenticateExecutiveUser(
  usernameInput: string,
  passwordInput: string,
  adminProfile: AdminProfile,
  teamAccounts: TeamAccount[]
): { success: true; session: AdminSession } | { success: false; error: string } {
  const normalizedUser = usernameInput.trim().toLowerCase();
  const password = passwordInput.trim();

  if (!normalizedUser || !password) {
    return {
      success: false,
      error: 'Please enter both username and password.',
    };
  }

  // Primary administrator profile check
  const primaryMatchesUser =
    normalizedUser === adminProfile.username.toLowerCase() ||
    (adminProfile.username.toLowerCase() === 'victor' &&
      normalizedUser === 'victorpaul');

  if (primaryMatchesUser) {
    const isDefaultUntouched =
      adminProfile.password === 'victorpaul' ||
      adminProfile.password === 'admin';
    const validPrimaryPassword =
      password === adminProfile.password ||
      (isDefaultUntouched &&
        (password === 'victorpaul' ||
          password === 'admin' ||
          password === 'victor'));

    if (validPrimaryPassword) {
      const session: AdminSession = {
        username: adminProfile.username,
        name: adminProfile.displayName,
        displayName: adminProfile.displayName,
        email: `${adminProfile.username}@vvproperties.local`,
        role: adminProfile.role,
        loggedInAt: new Date().toISOString(),
      };
      saveAdminSession(session);
      return { success: true, session };
    }
  }

  // Team directory accounts check
  const matchedAccount = teamAccounts.find(
    (acc) => acc.username.toLowerCase() === normalizedUser
  );

  if (matchedAccount) {
    if (matchedAccount.status === 'Suspended') {
      return {
        success: false,
        error: 'This account is suspended. Contact a Super Administrator.',
      };
    }

    const validAccountPw =
      password === matchedAccount.password ||
      ((matchedAccount.username === 'victor' ||
        matchedAccount.username === 'victorpaul') &&
        (matchedAccount.password === 'victorpaul' ||
          matchedAccount.password === 'admin') &&
        (password === 'victorpaul' ||
          password === 'admin' ||
          password === 'victor'));

    if (validAccountPw) {
      const isSuperAdmin = matchedAccount.role === 'Super Administrator';
      const session: AdminSession = {
        username: matchedAccount.username,
        name: matchedAccount.name,
        displayName: matchedAccount.name,
        email: `${matchedAccount.username}@vvproperties.local`,
        role: matchedAccount.role,
        loggedInAt: new Date().toISOString(),
        expiry: isSuperAdmin ? undefined : Date.now() + 24 * 60 * 60 * 1000,
      };
      saveAdminSession(session);
      return { success: true, session };
    }
  }

  return {
    success: false,
    error: 'Invalid username or password. Please try again.',
  };
}

export function saveAdminSession(session: AdminSession): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Ignore lightweight storage quota errors
  }
}

export function getAdminSession(): AdminSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminSession;
    if (!parsed?.username) return null;
    if (parsed.expiry && Date.now() > parsed.expiry) {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function logoutAdminSession(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // No-op
  }
}
