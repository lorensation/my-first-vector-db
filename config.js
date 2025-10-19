import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/** Ensure the OpenAI API key is available and correctly configured */
if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is missing or invalid.");
}

/** Ensure Supabase credentials are available */
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase URL or Service Role Key is missing.");
}

/** OpenAI config - SERVER-SIDE ONLY (API key is never exposed to browser) */
export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/** 
 * Supabase client - SERVER-SIDE ONLY
 * Using service role key for full database access
 * Note: Service role key bypasses RLS (Row Level Security)
 */
export const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

// Default export for backward compatibility
export default openai;