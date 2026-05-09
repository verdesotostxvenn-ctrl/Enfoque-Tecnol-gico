import { createClient } from '@supabase/supabase-js';

// Estos datos los sacas de tu panel de Supabase (Settings > API)
const supabaseUrl = 'TU_URL_DE_PROYECTO';
const supabaseAnonKey = 'TU_CLAVE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
