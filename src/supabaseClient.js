import { createClient } from '@supabase/supabase-js'

// Ambil URL dan Key dari Environment Variables untuk Create React App
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Jika salah satu tidak ada, berikan error
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL and Anon Key must be defined in your environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseKey)
