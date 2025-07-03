import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are properly configured
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const hasValidConfig = supabaseUrl && 
                      supabaseAnonKey && 
                      supabaseUrl !== 'your_supabase_url' && 
                      supabaseAnonKey !== 'your_supabase_anon_key' &&
                      isValidUrl(supabaseUrl);

let _supabase: any;

if (!hasValidConfig) {
  console.error('❌ Supabase configuration error:');
  console.error('Please update your .env file with valid Supabase credentials:');
  console.error('1. Go to https://supabase.com/dashboard');
  console.error('2. Select your project');
  console.error('3. Go to Settings > API');
  console.error('4. Copy your Project URL and anon/public key');
  console.error('5. Update VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
  
  // Create a mock client to prevent the app from crashing
  const mockClient = {
    auth: {
      signUp: () => Promise.reject(new Error('Supabase not configured')),
      signInWithPassword: () => Promise.reject(new Error('Supabase not configured')),
      signOut: () => Promise.reject(new Error('Supabase not configured')),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: () => Promise.reject(new Error('Supabase not configured')),
      insert: () => Promise.reject(new Error('Supabase not configured')),
      update: () => Promise.reject(new Error('Supabase not configured')),
      delete: () => Promise.reject(new Error('Supabase not configured')),
    }),
  };
  
  _supabase = mockClient;
} else {
  _supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    }
  });
}

export const supabase = _supabase;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          jedi_rank: string;
          total_points: number;
          streak_days: number;
          last_activity: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          jedi_rank?: string;
          total_points?: number;
          streak_days?: number;
          last_activity?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          jedi_rank?: string;
          total_points?: number;
          streak_days?: number;
          last_activity?: string;
          updated_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          file_url: string;
          file_type: string;
          progress: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string;
          file_url: string;
          file_type: string;
          progress?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          file_url?: string;
          file_type?: string;
          progress?: number;
          updated_at?: string;
        };
      };
      daily_skills: {
        Row: {
          id: string;
          user_id: string;
          skill_type: string;
          completed: boolean;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          skill_type: string;
          completed?: boolean;
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          skill_type?: string;
          completed?: boolean;
          date?: string;
        };
      };
    };
  };
};