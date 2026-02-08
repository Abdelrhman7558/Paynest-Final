import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, type UserProfile } from '../lib/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    session: Session | null;
    loading: boolean;
    signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<{ error: any }>;
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    // Load user profile from database
    const loadUserProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('user_masareefy')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) throw error;
            setProfile(data);
        } catch (error) {
            console.error('Error loading user profile:', error);
            setProfile(null);
        }
    };

    // Refresh profile
    const refreshProfile = async () => {
        if (user) {
            await loadUserProfile(user.id);
        }
    };

    // Initialize auth state
    useEffect(() => {
        // Check if Supabase is configured
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey ||
            supabaseUrl.includes('your_supabase_url') ||
            supabaseAnonKey.includes('your_supabase_anon_key')) {
            console.warn('⚠️ Supabase is not configured. Authentication features will not work until you update .env file.');
            setLoading(false);
            return;
        }

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                loadUserProfile(session.user.id);
            }
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                loadUserProfile(session.user.id);
            } else {
                setProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Sign up function
    const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
        console.log('📝 Starting signup process for:', email);

        try {
            // Create auth user with metadata (bypasses RLS issues)
            console.log('🔐 Creating auth user with metadata...');
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/login`,
                    data: {
                        // Store user data in auth metadata - profile will be created on first login
                        name: userData.name || '',
                        phone: userData.phone || null,
                        country: userData.country || null,
                        currency: userData.currency || 'USD',
                        language: userData.language || 'en',
                    },
                },
            });

            console.log('🔍 Auth response:', {
                user: authData?.user?.id,
                error: authError,
                errorMessage: authError?.message,
                errorStatus: authError?.status
            });

            if (authError) {
                console.error('❌ Auth signup error:', authError);
                console.error('❌ Error details:', JSON.stringify(authError, null, 2));
                return { error: authError };
            }

            if (!authData.user) {
                console.error('❌ No user returned from signup');
                return { error: { message: 'User creation failed - no user returned' } };
            }

            console.log('✅ Auth user created:', authData.user.id);
            console.log('✅ User metadata saved, profile will be created on first login');

            return { error: null };
        } catch (error: any) {
            console.error('❌ Signup exception:', error);
            console.error('❌ Exception details:', JSON.stringify(error, null, 2));
            return { error: { message: error.message || 'An unexpected error occurred' } };
        }
    };

    // Sign in function
    const signIn = async (email: string, password: string) => {
        try {
            console.log('🔐 Signing in...');
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) return { error };

            if (data.user) {
                const isAuthVerified = !!data.user.email_confirmed_at;

                // Check if user profile exists
                const { data: profileData, error: profileCheckError } = await supabase
                    .from('user_masareefy')
                    .select('*')
                    .eq('user_id', data.user.id)
                    .single();

                // If profile doesn't exist, create it from auth metadata
                if (profileCheckError?.code === 'PGRST116' || !profileData) {
                    console.log('📋 Creating profile on first login...');
                    const metadata = data.user.user_metadata || {};

                    const { error: createError } = await supabase.from('user_masareefy').insert([
                        {
                            user_id: data.user.id,
                            email: data.user.email,
                            name: metadata.name || '',
                            phone: metadata.phone || null,
                            country: metadata.country || null,
                            currency: metadata.currency || 'USD',
                            language: metadata.language || 'en',
                            plan: 'free',
                            email_verified: isAuthVerified,
                        },
                    ]);

                    if (createError) {
                        console.warn('⚠️ Profile creation warning:', createError);
                        // Don't block login if profile creation fails
                    } else {
                        console.log('✅ Profile created successfully');
                    }
                }

                const isProfileVerified = profileData?.email_verified === true;

                // If NEITHER is verified, block login
                if (!isAuthVerified && !isProfileVerified) {
                    await supabase.auth.signOut();
                    return {
                        error: { message: 'Please verify your email before signing in. Check your inbox for the verification link.' }
                    };
                }
            }

            console.log('✅ Login successful');
            return { error: null };
        } catch (error: any) {
            console.error('❌ Login error:', error);
            return { error: { message: error.message || 'Login failed' } };
        }
    };

    // Sign out function
    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setSession(null);
    };

    const value = {
        user,
        profile,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
