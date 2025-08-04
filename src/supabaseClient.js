import { createClient } from '@supabase/supabase-js'

// Ambil URL dan Key dari Environment Variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Jika salah satu tidak ada, berikan error agar tidak lanjut
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL and Anon Key must be defined in .env.local");
}

export const supabase = createClient(supabaseUrl, supabaseKey)