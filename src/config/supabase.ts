import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', !!supabaseUrl);
console.log('Supabase Key:', !!supabaseKey);
console.log('Supabase Key Length:', supabaseKey?.length);

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL is missing from .env');
}

if (!supabaseKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing from .env');
}

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);