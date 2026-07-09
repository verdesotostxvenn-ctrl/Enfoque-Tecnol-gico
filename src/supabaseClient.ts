import { createClient } from '@supabase/supabase-js';

const supabaseUrl = ((import.meta as any).env?.VITE_SUPABASE_URL || '') as string;
const supabaseAnonKey = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '') as string;

const emptyResponse = { data: null, error: null };

const createOfflineSupabase = () => ({
  from: () => ({
    insert: async () => emptyResponse,
    update: () => ({
      eq: async () => emptyResponse
    }),
    select: () => ({
      order: async () => ({ data: [], error: null })
    })
  })
});

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase no está configurado. La app funcionará con progreso local hasta agregar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.'
  );
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (createOfflineSupabase() as any);
