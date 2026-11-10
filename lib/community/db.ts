import 'server-only';
import { createClient } from '@supabase/supabase-js';

function client(key: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || !key) throw new Error('Supabase environment is incomplete');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
}

export function publicDb() {
  return client(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '');
}

export function serviceDb() {
  return client(process.env.SUPABASE_SECRET_KEY ?? '');
}
