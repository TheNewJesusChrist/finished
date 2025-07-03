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
  console.error('🔧 Supabase Configuration Required');
  console.error('To enable full functionality, please configure Supabase:');
  console.error('1. Visit https://supabase.com/dashboard');
  console.error('2. Select your project → Settings → API');
  console.error('3. Copy your Project URL and anon/public key');
  console.error('4. Update .env file with your credentials');
  console.error('5. Restart the development server');
  console.error('📝 Running in demo mode with mock data...');
  
  // Create a comprehensive mock client to prevent app crashes
  const mockClient = {
    auth: {
      signUp: () => Promise.resolve({ 
        data: { user: null, session: null }, 
        error: { message: 'Demo mode: Supabase not configured' } 
      }),
      signInWithPassword: () => Promise.resolve({ 
        data: { user: null, session: null }, 
        error: { message: 'Demo mode: Supabase not configured' } 
      }),
      signOut: () => Promise.resolve({ error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      onAuthStateChange: (callback: any) => {
        // Call callback immediately with no session
        callback('SIGNED_OUT', null);
        return { 
          data: { 
            subscription: { 
              unsubscribe: () => {} 
            } 
          } 
        };
      },
    },
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: () => ({ data: [], error: null }),
        neq: () => ({ data: [], error: null }),
        gt: () => ({ data: [], error: null }),
        gte: () => ({ data: [], error: null }),
        lt: () => ({ data: [], error: null }),
        lte: () => ({ data: [], error: null }),
        like: () => ({ data: [], error: null }),
        ilike: () => ({ data: [], error: null }),
        is: () => ({ data: [], error: null }),
        in: () => ({ data: [], error: null }),
        contains: () => ({ data: [], error: null }),
        containedBy: () => ({ data: [], error: null }),
        rangeGt: () => ({ data: [], error: null }),
        rangeGte: () => ({ data: [], error: null }),
        rangeLt: () => ({ data: [], error: null }),
        rangeLte: () => ({ data: [], error: null }),
        rangeAdjacent: () => ({ data: [], error: null }),
        overlaps: () => ({ data: [], error: null }),
        textSearch: () => ({ data: [], error: null }),
        match: () => ({ data: [], error: null }),
        not: () => ({ data: [], error: null }),
        or: () => ({ data: [], error: null }),
        filter: () => ({ data: [], error: null }),
        order: () => ({ data: [], error: null }),
        limit: () => ({ data: [], error: null }),
        range: () => ({ data: [], error: null }),
        abortSignal: () => ({ data: [], error: null }),
        single: () => Promise.resolve({ data: null, error: { message: 'Demo mode: No data available' } }),
        maybeSingle: () => Promise.resolve({ data: null, error: null }),
        then: (resolve: any) => resolve({ data: [], error: null }),
      }),
      insert: (values: any) => ({
        select: () => Promise.resolve({ 
          data: null, 
          error: { message: 'Demo mode: Cannot insert data' } 
        }),
        then: (resolve: any) => resolve({ 
          data: null, 
          error: { message: 'Demo mode: Cannot insert data' } 
        }),
      }),
      update: (values: any) => ({
        eq: () => ({
          select: () => Promise.resolve({ 
            data: null, 
            error: { message: 'Demo mode: Cannot update data' } 
          }),
          then: (resolve: any) => resolve({ 
            data: null, 
            error: { message: 'Demo mode: Cannot update data' } 
          }),
        }),
        match: () => ({
          select: () => Promise.resolve({ 
            data: null, 
            error: { message: 'Demo mode: Cannot update data' } 
          }),
          then: (resolve: any) => resolve({ 
            data: null, 
            error: { message: 'Demo mode: Cannot update data' } 
          }),
        }),
        then: (resolve: any) => resolve({ 
          data: null, 
          error: { message: 'Demo mode: Cannot update data' } 
        }),
      }),
      delete: () => ({
        eq: () => Promise.resolve({ 
          data: null, 
          error: { message: 'Demo mode: Cannot delete data' } 
        }),
        match: () => Promise.resolve({ 
          data: null, 
          error: { message: 'Demo mode: Cannot delete data' } 
        }),
        then: (resolve: any) => resolve({ 
          data: null, 
          error: { message: 'Demo mode: Cannot delete data' } 
        }),
      }),
      upsert: (values: any) => ({
        select: () => Promise.resolve({ 
          data: null, 
          error: { message: 'Demo mode: Cannot upsert data' } 
        }),
        then: (resolve: any) => resolve({ 
          data: null, 
          error: { message: 'Demo mode: Cannot upsert data' } 
        }),
      }),
    }),
    storage: {
      from: (bucket: string) => ({
        upload: () => Promise.resolve({ 
          data: null, 
          error: { message: 'Demo mode: Cannot upload files' } 
        }),
        download: () => Promise.resolve({ 
          data: null, 
          error: { message: 'Demo mode: Cannot download files' } 
        }),
        remove: () => Promise.resolve({ 
          data: null, 
          error: { message: 'Demo mode: Cannot remove files' } 
        }),
        list: () => Promise.resolve({ 
          data: [], 
          error: null 
        }),
        getPublicUrl: (path: string) => ({
          data: { publicUrl: '' },
          error: null
        }),
      }),
    },
    rpc: (fn: string, args?: any) => Promise.resolve({ 
      data: null, 
      error: { message: 'Demo mode: Cannot call RPC functions' } 
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
      quiz_questions: {
        Row: {
          id: string;
          course_id: string;
          question: string;
          options: any;
          correct_answer: number;
          explanation: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          question: string;
          options: any;
          correct_answer: number;
          explanation?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          question?: string;
          options?: any;
          correct_answer?: number;
          explanation?: string;
        };
      };
    };
  };
};