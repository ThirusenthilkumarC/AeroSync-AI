import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const isConfigValid = Boolean(
  supabaseUrl && 
  supabaseKey && 
  !supabaseUrl.includes('your-supabase-project')
);

export const supabase = isConfigValid 
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
      global: { headers: { 'x-application-name': 'aerosync-occ' } }
    })
  : null;

export let isSupabaseConfigured = false;

if (isConfigValid && supabase) {
  // Test connection asynchronously with a 2-second timeout to prevent DNS blocking
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Connection timeout')), 2000)
  );

  Promise.race([
    supabase.from('flights').select('id').limit(1),
    timeoutPromise
  ]).then(({ data, error }) => {
    if (!error && data !== undefined) {
      isSupabaseConfigured = true;
      console.log('[Supabase] Client initialized successfully with PostgreSQL connection.');
    } else {
      console.log('[Supabase] Remote database returned error or unreachable. Active operational dataset in use.');
    }
  }).catch((err) => {
    console.log('[Supabase] Remote host unreachable (' + err.message + '). Active operational dataset in use.');
  });
} else {
  console.log('[Supabase] Credentials not provided or using default placeholder. Active operational dataset in use.');
}

