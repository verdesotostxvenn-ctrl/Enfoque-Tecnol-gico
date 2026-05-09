import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iordxjvbxtytcraepmnd.supabase.co';
const supabaseAnonKey = 'sb_publishable_B0D4_ccnf1wIPx9YJUacmw_kLJuIu-g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
