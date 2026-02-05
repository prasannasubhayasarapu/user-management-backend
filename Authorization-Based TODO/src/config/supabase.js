import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Validate critical env vars
const requiredVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'JWT_SECRET'];
requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

// Initialize Supabase client with service role key (backend-only)
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    },
    db: {
      schema: 'public'
    }
  }
);

// Critical: Verify connection on startup
export const testSupabaseConnection = async () => {
  try {
    const { error } = await supabase.rpc('current_user_id');
    if (error?.message?.includes('Invalid API key')) {
      throw new Error('Invalid SUPABASE_SERVICE_ROLE_KEY. Verify credentials.');
    }
    console.log('✓ Supabase connection verified');
  } catch (err) {
    if (err.message.includes('fetch failed')) {
      throw new Error('Cannot connect to Supabase. Check SUPABASE_URL');
    }
    throw err;
  }
};