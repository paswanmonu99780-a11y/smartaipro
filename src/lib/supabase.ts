import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://odmttamhcrstegwztiwn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kbXR0YW1oY3JzdGVnd3p0aXduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3ODE4MjEsImV4cCI6MjA5MzM1NzgyMX0.xoJHTt5lMP0P6dHnTdEbxKFk75q-W3wkK3_Swa_AXB4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
