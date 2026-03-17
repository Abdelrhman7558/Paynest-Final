import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are configured (not placeholder values)
const isConfigured =
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your_supabase_url') &&
    !supabaseAnonKey.includes('your_supabase_anon_key');

// Create a dummy client if not configured to prevent app crash
export const supabase = isConfigured
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    })
    : createClient('https://placeholder.supabase.co', 'placeholder-key', {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
        }
    });

// Database types
export interface UserProfile {
    id: string;
    user_id: string;
    email: string;
    name: string;
    phone?: string;
    country?: string;
    currency: string;
    language: string;
    plan: string;
    email_verified: boolean;
    avatar_url?: string;
    timezone?: string;
    date_format?: string;
    notifications_enabled?: boolean;
    created_at: string;
    updated_at: string;
}
