import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://odmttamhcrstegwztiwn.supabase.co';
const supabaseAnonKey = 'sb_publishable_OW-bsfhbdoAO3KvsBFIVHA_z3LBxV3J';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
