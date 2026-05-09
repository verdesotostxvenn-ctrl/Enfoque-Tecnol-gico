import { createClient } from '@supabase/supabase-js';

/**
 * Táctica de Blindaje: Cast al tipo 'any' para evitar que TypeScript 
 * bloquee el acceso a las variables de entorno durante el build en Netlify.
 */
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY as string;

// Creamos el puente satelital con Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
