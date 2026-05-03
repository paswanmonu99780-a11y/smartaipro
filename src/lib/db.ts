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
