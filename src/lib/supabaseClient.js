import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl === 'https://your-project-id.supabase.co' || !supabaseAnonKey || supabaseAnonKey === 'your-supabase-anon-key') {
  console.warn(
    'DealFlow Warning: Supabase credentials are not configured. ' +
    'Please create a .env file and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

// Ensure the client is created with whatever variables are available
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);
