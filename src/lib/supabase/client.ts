import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const defaultUrl = 'https://keafzoktjrbcdgsmurdr.supabase.co';
const defaultAnonKey = 'sb_publishable_3w3eXnfJxtgRQZLRHXo8tw_ZI-easpr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || defaultUrl;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || defaultAnonKey;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
