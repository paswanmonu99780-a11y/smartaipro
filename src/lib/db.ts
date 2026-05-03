import { supabase } from './supabase';

export const syncUsersToSupabase = async (users: any[]) => {
  try {
    const { error } = await supabase
      .from('app_data')
      .upsert({ id: 'users', data: users });
      
    if (error) console.error("Supabase sync error:", error);
  } catch (err) {
    console.error("Supabase error:", err);
  }
};

export const fetchUsersFromSupabase = async (): Promise<any[] | null> => {
  try {
    const { data, error } = await supabase
      .from('app_data')
      .select('data')
      .eq('id', 'users')
      .single();
      
    if (error) {
       console.error("Supabase fetch error:", error);
       return null; // Return null on error so we don't overwrite local storage
    }
    return data?.data || null;
  } catch (err) {
    console.error("Supabase error:", err);
    return null;
  }
};

export const setAdminSession = async (sessionId: string) => {
  try {
    const { error } = await supabase
      .from('app_data')
      .upsert({ id: 'admin_session', data: { sessionId, timestamp: new Date().toISOString() } });
    if (error) console.error("Supabase admin session set error:", error);
  } catch (err) {
    console.error("Supabase error:", err);
  }
};

export const checkAdminSession = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('app_data')
      .select('data')
      .eq('id', 'admin_session')
      .single();
    if (error) return null;
    return data?.data?.sessionId || null;
  } catch (err) {
    return null;
  }
};
