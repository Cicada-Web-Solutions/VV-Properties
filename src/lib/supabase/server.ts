import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const defaultUrl = 'https://keafzoktjrbcdgsmurdr.supabase.co';
const defaultAnonKey = 'sb_publishable_3w3eXnfJxtgRQZLRHXo8tw_ZI-easpr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || defaultUrl;
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  defaultAnonKey;

/**
 * Creates an admin/service-role Supabase client that bypasses RLS
 * for trusted server-side background tasks, triggers, and audit logging.
 */
export function createAdminClient() {
  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Creates a server client scoped to a user's JWT bearer token
 * so that Row Level Security (RLS) is accurately enforced on server routes.
 */
export function createUserServerClient(jwtToken: string) {
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || defaultAnonKey;

  return createClient<Database>(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    },
    auth: {
      persistSession: false,
    },
  });
}
