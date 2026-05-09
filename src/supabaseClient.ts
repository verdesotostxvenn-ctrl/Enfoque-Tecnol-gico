import { createClient } from '@supabase/supabase-js';

// Extraemos las coordenadas de energía del entorno de Vite
// Usamos "as string" para que TypeScript no bloquee el radar
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Creamos el puente satelital con Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
